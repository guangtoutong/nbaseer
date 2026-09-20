/**
 * NBAseer data worker.
 *
 * Runs on a cron trigger and keeps D1 in step with reality:
 *   1. pulls the schedule and live scores from ESPN (free, no quota)
 *   2. reconciles games that got stranded mid-status
 *   3. grades finished games into prediction_results
 *   4. rolls those results into the Elo ratings
 *   5. optionally blends in bookmaker odds, within the free API quota
 *   6. writes a prediction for every upcoming game
 *
 * The prediction maths lives in model.mjs, shared with scripts/backfill.mjs so the
 * accuracy published on the site describes this exact model.
 */

import {
  MODEL_VERSION,
  TEAM_ID,
  TEAM_NAME_TO_ABBR,
  americanOddsToProb,
  applyGameToElo,
  gradePrediction,
  predict,
  recordGameForState,
  resolveTeamId,
  stateFromRows,
} from "./model.mjs";

/**
 * ESPN serves the same scoreboard payload from several hosts, and they do not sit
 * behind the same edge rules: as of 2026-09 `site.api` answers 403 Access Denied to
 * Cloudflare Workers while `site.web.api` serves normally. Relying on a single host
 * is what let this pipeline die silently for six months, so they are tried in order
 * and the first one that answers wins.
 */
const ESPN_SCOREBOARD_HOSTS = [
  "https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
];

/**
 * Overridable so scripts/espn-replay.mjs can feed the worker a shifted date range —
 * useful for testing the full game lifecycle out of season. Ordinary local
 * development needs no override: the hosts above work from workerd too.
 */
function scoreboardBases(env) {
  return env.ESPN_SCOREBOARD_URL ? [env.ESPN_SCOREBOARD_URL] : ESPN_SCOREBOARD_HOSTS;
}

function scoreboardUrl(env, date) {
  return `${scoreboardBases(env)[0]}?dates=${date.replace(/-/g, "")}`;
}

/**
 * the-odds-api free tier allows 500 credits/month. One call with 3 markets in 1
 * region costs 3 credits, so 4 calls a day (372/month) leaves headroom. The old
 * every-30-minutes schedule burned 4,320 credits/month and died within days.
 */
const ODDS_MIN_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** Predictions only need refreshing every half hour; scores run every 10 minutes. */
const PREDICT_MIN_INTERVAL_MS = 30 * 60 * 1000;

/** Per-run cap on reconciling old dates, to stay well inside subrequest limits. */
const MAX_RECONCILE_DATES = 8;

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runSync(env, { trigger: "cron" }));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json; charset=utf-8",
    };

    try {
      if (url.pathname === "/sync") {
        const force = url.searchParams.get("force") === "1";
        const result = await runSync(env, { trigger: "manual", force });
        return json(result, headers);
      }

      if (url.pathname === "/health") {
        return json(await health(env), headers);
      }

      // Diagnostic: shows exactly what the upstream returned, so a silent sync
      // failure can be told apart from an upstream block.
      if (url.pathname === "/debug/espn") {
        const date = url.searchParams.get("date") || utcDate(0);
        const probe = url.searchParams.get("url");

        // Restricted to known sports-data hosts: an endpoint that fetches any URL
        // on request is an SSRF hole, not a debug tool.
        const ALLOWED_HOSTS = [
          "site.api.espn.com",
          "site.web.api.espn.com",
          "cdn.espn.com",
          "data.nba.net",
          "stats.nba.com",
          "api.balldontlie.io",
          "www.thesportsdb.com",
          "api.the-odds-api.com",
        ];

        let target = scoreboardUrl(env, date);
        if (probe) {
          const parsed = new URL(probe);
          if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
            return json({ error: `host not allowed: ${parsed.hostname}`, ALLOWED_HOSTS }, headers, 400);
          }
          target = probe;
        }

        const res = await fetch(target, { headers: ESPN_HEADERS });
        const body = await res.text();
        return json(
          {
            target,
            status: res.status,
            responseHeaders: Object.fromEntries(res.headers),
            bodyPreview: body.slice(0, 600),
          },
          headers
        );
      }

      return json(
        {
          service: "nbaseer-worker",
          model: MODEL_VERSION,
          endpoints: ["/sync", "/sync?force=1", "/health"],
        },
        headers
      );
    } catch (err) {
      return json({ error: err.message, stack: err.stack }, headers, 500);
    }
  },
};

function json(body, headers, status = 200) {
  return new Response(JSON.stringify(body, null, 2), { headers, status });
}

// --- schema -----------------------------------------------------------------

/**
 * Applied on every run. Everything is idempotent, so a fresh database and one that
 * has been live since March both converge without anyone opening the D1 console.
 */
async function migrate(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS team_ratings (
         team_id INTEGER NOT NULL,
         season INTEGER NOT NULL,
         elo REAL NOT NULL DEFAULT 1500,
         off_ppg REAL,
         def_ppg REAL,
         games_played INTEGER DEFAULT 0,
         last_game_date TEXT,
         updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
         PRIMARY KEY (team_id, season)
       )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS meta (
         key TEXT PRIMARY KEY,
         value TEXT,
         updated_at TEXT DEFAULT CURRENT_TIMESTAMP
       )`
    )
    .run();

  // SQLite has no ALTER TABLE ... ADD COLUMN IF NOT EXISTS; a duplicate column is
  // the expected outcome on every run after the first.
  for (const stmt of [
    "ALTER TABLE games ADD COLUMN rating_applied INTEGER DEFAULT 0",
    "ALTER TABLE predictions ADD COLUMN model_version TEXT",
  ]) {
    try {
      await db.prepare(stmt).run();
    } catch (err) {
      if (!/duplicate column/i.test(err.message)) throw err;
    }
  }

  await db
    .prepare("CREATE INDEX IF NOT EXISTS idx_games_status_date ON games(status, date)")
    .run();
}

async function getMeta(db, key) {
  const row = await db.prepare("SELECT value FROM meta WHERE key = ?").bind(key).first();
  return row?.value ?? null;
}

async function setMeta(db, key, value) {
  await db
    .prepare(
      `INSERT INTO meta (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    )
    .bind(key, String(value))
    .run();
}

// --- ESPN -------------------------------------------------------------------

function utcDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

/**
 * ESPN serves the Workers runtime a 403 unless the request looks like a browser.
 * Without these headers the sync fetches nothing and the site goes stale with no
 * visible error anywhere.
 */
const ESPN_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.espn.com/",
};

async function fetchScoreboard(env, date, log) {
  const dates = date.replace(/-/g, "");
  const failures = [];

  for (const base of scoreboardBases(env)) {
    try {
      const res = await fetch(`${base}?dates=${dates}`, { headers: ESPN_HEADERS });
      if (res.ok) {
        const host = new URL(base).hostname;
        if (log && log.espnHost !== host) log.espnHost = host;
        return res.json();
      }
      failures.push(`${new URL(base).hostname} HTTP ${res.status}`);
    } catch (err) {
      failures.push(`${new URL(base).hostname} ${err.message}`);
    }
  }

  throw new Error(`ESPN ${date}: ${failures.join("; ")}`);
}

function parseEvent(evt) {
  const comp = evt?.competitions?.[0];
  if (!comp) return null;

  const home = comp.competitors?.find((c) => c.homeAway === "home");
  const away = comp.competitors?.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const homeId = resolveTeamId(home.team?.abbreviation);
  const awayId = resolveTeamId(away.team?.abbreviation);
  if (!homeId || !awayId) return null;

  const statusName = comp.status?.type?.name;
  let status = "scheduled";
  if (statusName === "STATUS_FINAL") status = "final";
  else if (statusName === "STATUS_IN_PROGRESS" || statusName === "STATUS_HALFTIME")
    status = "live";
  else if (statusName === "STATUS_POSTPONED" || statusName === "STATUS_CANCELED")
    status = "postponed";

  return {
    id: parseInt(evt.id, 10),
    // ESPN dates are UTC instants; the site renders them per-locale, so storing the
    // UTC day keeps the source of truth unambiguous.
    date: evt.date.slice(0, 10),
    tipoff: evt.date,
    // Scheduled games carry the tipoff instant; live games carry the game clock.
    time: status === "scheduled" ? evt.date : comp.status?.displayClock ?? null,
    status,
    period: comp.status?.period ?? 0,
    homeId,
    awayId,
    homeScore: parseInt(home.score, 10) || 0,
    awayScore: parseInt(away.score, 10) || 0,
    season: evt.season?.year ?? new Date().getUTCFullYear(),
    postseason: (evt.season?.type ?? 2) === 3 ? 1 : 0,
  };
}

const UPSERT_GAME = `
  INSERT INTO games (id,date,time,status,period,home_team_id,away_team_id,
                     home_score,away_score,season,postseason,updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    date=excluded.date, time=excluded.time, status=excluded.status,
    period=excluded.period, home_score=excluded.home_score,
    away_score=excluded.away_score, season=excluded.season,
    postseason=excluded.postseason, updated_at=datetime('now')`;

async function syncDates(env, db, dates, log) {
  const statements = [];
  for (const date of dates) {
    try {
      const data = await fetchScoreboard(env, date, log);
      for (const evt of data.events || []) {
        const g = parseEvent(evt);
        if (!g) continue;
        statements.push(
          db
            .prepare(UPSERT_GAME)
            .bind(
              g.id, g.date, g.time, g.status, g.period, g.homeId, g.awayId,
              g.homeScore, g.awayScore, g.season, g.postseason
            )
        );
      }
      log.datesFetched.push(date);
    } catch (err) {
      log.errors.push(err.message);
    }
  }

  if (statements.length) {
    await db.batch(statements);
    log.gamesUpserted += statements.length;
  }
}

/**
 * Games can get stranded: the worker dies while one is in progress, or a date falls
 * out of the rolling fetch window before its final score lands. Left alone they show
 * up on the homepage as live forever — which is exactly what happened to a March
 * game that was still reading "Q4 2:38" six months later.
 */
async function reconcileStranded(env, db, log) {
  const cutoff = utcDate(-1);
  const rows = await db
    .prepare(
      `SELECT DISTINCT date FROM games
       WHERE status IN ('live','scheduled') AND date < ?
       ORDER BY date DESC LIMIT ?`
    )
    .bind(cutoff, MAX_RECONCILE_DATES)
    .all();

  const dates = (rows.results || []).map((r) => r.date).filter(Boolean);
  if (!dates.length) return;

  log.reconciledDates = dates;
  await syncDates(env, db, dates, log);

  // Anything still live after the refetch is a game ESPN no longer reports under
  // that date — a changed id, a relocation, a cancellation. It must not be left
  // masquerading as in-progress: the homepage showed one such game as "Q4 2:38"
  // for six months. A partial score is the best truth available, so keep it and
  // mark the game final; with no score at all there is nothing to show.
  const staleCutoff = utcDate(-2);

  const closed = await db
    .prepare(
      `UPDATE games SET status = 'final', updated_at = datetime('now')
       WHERE status = 'live' AND date < ? AND (home_score > 0 OR away_score > 0)`
    )
    .bind(staleCutoff)
    .run();

  const abandoned = await db
    .prepare(
      `UPDATE games SET status = 'postponed', updated_at = datetime('now')
       WHERE status = 'live' AND date < ? AND home_score = 0 AND away_score = 0`
    )
    .bind(staleCutoff)
    .run();

  log.strandedClosed = closed.meta?.changes ?? 0;
  log.strandedAbandoned = abandoned.meta?.changes ?? 0;
}

// --- ratings ----------------------------------------------------------------

/**
 * ESPN labels a season by the calendar year it ends in. Rather than guess from the
 * calendar — which gets the September gap between seasons wrong — take the label
 * from the games actually in the current window, and only fall back to the date.
 */
async function currentSeason(db) {
  const row = await db
    .prepare("SELECT MAX(season) AS season FROM games WHERE date >= ?")
    .bind(utcDate(-7))
    .first();
  if (row?.season) return row.season;

  const now = new Date();
  return now.getUTCMonth() >= 9 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
}

async function loadState(db, season) {
  const rows = await db
    .prepare("SELECT * FROM team_ratings WHERE season = ?")
    .bind(season)
    .all();
  return stateFromRows(rows.results || []);
}

async function saveState(db, season, state) {
  const statements = Object.values(TEAM_ID).map((id) =>
    db
      .prepare(
        `INSERT INTO team_ratings (team_id,season,elo,off_ppg,def_ppg,games_played,last_game_date,updated_at)
         VALUES (?,?,?,?,?,?,?,datetime('now'))
         ON CONFLICT(team_id,season) DO UPDATE SET
           elo=excluded.elo, off_ppg=excluded.off_ppg, def_ppg=excluded.def_ppg,
           games_played=excluded.games_played, last_game_date=excluded.last_game_date,
           updated_at=datetime('now')`
      )
      .bind(
        id,
        season,
        state.elo[id],
        state.offPpg[id],
        state.defPpg[id],
        state.gamesPlayed[id],
        state.lastGameDate[id]
      )
  );
  await db.batch(statements);
}

/**
 * Grade finished games and fold them into the ratings. `rating_applied` guarantees
 * each game moves the Elo exactly once no matter how often the cron fires.
 */
async function settleFinishedGames(db, season, state, log) {
  const rows = await db
    .prepare(
      `SELECT g.id, g.date, g.time, g.home_team_id, g.away_team_id,
              g.home_score, g.away_score,
              p.home_win_prob, p.predicted_spread, p.predicted_total, p.model_version
       FROM games g
       LEFT JOIN predictions p ON p.game_id = g.id
       WHERE g.status = 'final'
         AND g.season = ?
         AND (g.home_score > 0 OR g.away_score > 0)
         AND COALESCE(g.rating_applied, 0) = 0
       ORDER BY g.date ASC, g.time ASC`
    )
    .bind(season)
    .all();

  const games = rows.results || [];
  if (!games.length) return;

  const statements = [];

  for (const row of games) {
    const game = {
      homeId: row.home_team_id,
      awayId: row.away_team_id,
      homeScore: row.home_score,
      awayScore: row.away_score,
      tipoff: row.date,
    };

    // Only grade real forecasts. Two things are excluded on purpose:
    //   - rows with no model_version: written by the pre-2026-09 pipeline, which
    //     stored 0.5/0.5/spread 0/total 220 defaults for every game. Those picked
    //     no side and cannot be right or wrong.
    //   - an exact 50/50: same reason, whatever produced it.
    const isRealForecast =
      row.model_version != null &&
      row.home_win_prob != null &&
      row.predicted_spread != null &&
      row.home_win_prob !== 0.5;

    if (isRealForecast) {
      const result = gradePrediction(
        {
          home_win_prob: row.home_win_prob,
          predicted_spread: row.predicted_spread,
          predicted_total: row.predicted_total,
        },
        row.home_score,
        row.away_score
      );
      statements.push(
        db
          .prepare(
            `INSERT INTO prediction_results
               (game_id,winner_correct,spread_correct,total_correct,actual_spread,actual_total,created_at)
             VALUES (?,?,?,?,?,?,datetime('now'))
             ON CONFLICT(game_id) DO UPDATE SET
               winner_correct=excluded.winner_correct, spread_correct=excluded.spread_correct,
               total_correct=excluded.total_correct, actual_spread=excluded.actual_spread,
               actual_total=excluded.actual_total`
          )
          .bind(
            row.id,
            result.winner_correct,
            result.spread_correct,
            result.total_correct,
            result.actual_spread,
            result.actual_total
          )
      );
      log.graded++;
    }

    applyGameToElo(state, game);
    recordGameForState(state, game);

    statements.push(
      db.prepare("UPDATE games SET rating_applied = 1 WHERE id = ?").bind(row.id)
    );
    log.ratingsApplied++;
  }

  await db.batch(statements);
}

// --- odds -------------------------------------------------------------------

async function fetchOdds(db, apiKey, force, log) {
  if (!apiKey) {
    log.odds = "no ODDS_API_KEY — running on model ratings only";
    return {};
  }

  const last = parseInt((await getMeta(db, "odds_last_fetch")) || "0", 10);
  if (!force && Date.now() - last < ODDS_MIN_INTERVAL_MS) {
    log.odds = "skipped (quota window)";
    return {};
  }

  try {
    const url =
      "https://api.the-odds-api.com/v4/sports/basketball_nba/odds/" +
      `?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;
    const res = await fetch(url);
    const remaining = res.headers.get("x-requests-remaining");
    const data = await res.json();

    if (!res.ok || data.error_code) {
      log.errors.push(`odds api: ${data.message || res.status}`);
      return {};
    }

    await setMeta(db, "odds_last_fetch", Date.now());
    if (remaining != null) await setMeta(db, "odds_credits_remaining", remaining);

    const map = {};
    for (const event of data) {
      const homeAbbr = TEAM_NAME_TO_ABBR[event.home_team];
      const awayAbbr = TEAM_NAME_TO_ABBR[event.away_team];
      if (!homeAbbr || !awayAbbr) continue;
      const parsed = parseBookmaker(event, homeAbbr, awayAbbr);
      if (parsed) map[`${homeAbbr}-${awayAbbr}`] = parsed;
    }

    log.odds = `fetched ${Object.keys(map).length} games (credits left: ${remaining ?? "?"})`;
    return map;
  } catch (err) {
    log.errors.push(`odds fetch: ${err.message}`);
    return {};
  }
}

/** Average across books rather than trusting whichever one happens to be first. */
function parseBookmaker(event, homeAbbr, awayAbbr) {
  const probs = [];
  const spreads = [];
  const totals = [];
  const homeMl = [];
  const awayMl = [];
  const spreadHomePrice = [];
  const totalOverPrice = [];
  const totalUnderPrice = [];
  const books = [];

  for (const bm of event.bookmakers || []) {
    let contributed = false;
    for (const market of bm.markets || []) {
      if (market.key === "h2h") {
        const home = market.outcomes?.find((o) => TEAM_NAME_TO_ABBR[o.name] === homeAbbr);
        const away = market.outcomes?.find((o) => TEAM_NAME_TO_ABBR[o.name] === awayAbbr);
        const ph = americanOddsToProb(home?.price);
        const pa = americanOddsToProb(away?.price);
        // Strip the bookmaker's margin so the two sides sum to 1.
        if (ph && pa) {
          probs.push(ph / (ph + pa));
          homeMl.push(home.price);
          awayMl.push(away.price);
          contributed = true;
        }
      } else if (market.key === "spreads") {
        const home = market.outcomes?.find((o) => TEAM_NAME_TO_ABBR[o.name] === homeAbbr);
        if (Number.isFinite(home?.point)) {
          spreads.push(home.point);
          if (Number.isFinite(home.price)) spreadHomePrice.push(home.price);
          contributed = true;
        }
      } else if (market.key === "totals") {
        const over = market.outcomes?.find((o) => o.name === "Over");
        const under = market.outcomes?.find((o) => o.name === "Under");
        if (Number.isFinite(over?.point)) {
          totals.push(over.point);
          if (Number.isFinite(over.price)) totalOverPrice.push(over.price);
          if (Number.isFinite(under?.price)) totalUnderPrice.push(under.price);
          contributed = true;
        }
      }
    }
    if (contributed && bm.title) books.push(bm.title);
  }

  if (!probs.length && !spreads.length && !totals.length) return null;
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const round = (v, d = 2) => (v == null ? null : +v.toFixed(d));

  return {
    home_win_prob: avg(probs),
    spread: avg(spreads),
    total: avg(totals),
    // Kept separately so the site can show a genuine consensus line instead of
    // dressing the model's own numbers up as market data.
    book_count: books.length,
    books,
    home_ml: round(avg(homeMl), 0),
    away_ml: round(avg(awayMl), 0),
    spread_home: round(avg(spreads), 1),
    spread_home_price: round(avg(spreadHomePrice), 0),
    total_over: round(avg(totals), 1),
    total_over_price: round(avg(totalOverPrice), 0),
    total_under_price: round(avg(totalUnderPrice), 0),
  };
}

/** Persist the consensus line so the UI can label it as real market data. */
async function storeOdds(db, gamesByKey, oddsMap, log) {
  const statements = [];

  for (const [key, odds] of Object.entries(oddsMap)) {
    const gameId = gamesByKey[key];
    if (!gameId || !odds.book_count) continue;

    statements.push(
      db
        .prepare(
          `INSERT INTO odds (game_id,bookmaker,home_ml,away_ml,spread_home,spread_home_price,
                             total_over,total_over_price,total_under,total_under_price,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now'))`
        )
        .bind(
          gameId,
          `consensus (${odds.book_count} books)`,
          odds.home_ml,
          odds.away_ml,
          odds.spread_home,
          odds.spread_home_price,
          odds.total_over,
          odds.total_over_price,
          odds.total_over,
          odds.total_under_price
        )
    );
    // One consensus row per game; replace rather than accumulate history.
    statements.unshift(
      db.prepare("DELETE FROM odds WHERE game_id = ? AND bookmaker LIKE 'consensus%'").bind(gameId)
    );
  }

  if (statements.length) {
    await db.batch(statements);
    log.oddsStored = statements.length / 2;
  }
}

// --- predictions ------------------------------------------------------------

async function writePredictions(db, state, oddsMap, log) {
  const rows = await db
    .prepare(
      `SELECT g.id, g.date, g.time, g.home_team_id, g.away_team_id,
              h.abbreviation AS home_abbr, a.abbreviation AS away_abbr
       FROM games g
       JOIN teams h ON h.id = g.home_team_id
       JOIN teams a ON a.id = g.away_team_id
       WHERE g.status IN ('scheduled','live') AND g.date >= ?`
    )
    .bind(utcDate(-1))
    .all();

  const games = rows.results || [];
  if (!games.length) return;

  const gamesByKey = {};
  for (const row of games) gamesByKey[`${row.home_abbr}-${row.away_abbr}`] = row.id;
  await storeOdds(db, gamesByKey, oddsMap, log);

  const statements = games.map((row) => {
    const market = oddsMap[`${row.home_abbr}-${row.away_abbr}`] || null;
    const p = predict(
      state,
      { homeId: row.home_team_id, awayId: row.away_team_id, tipoff: row.time || row.date },
      market
    );
    if (market) log.withMarket++;

    return db
      .prepare(
        `INSERT INTO predictions
           (game_id,home_win_prob,away_win_prob,predicted_home_score,predicted_away_score,
            predicted_spread,predicted_total,confidence,model_version)
         VALUES (?,?,?,?,?,?,?,?,?)
         ON CONFLICT(game_id) DO UPDATE SET
           home_win_prob=excluded.home_win_prob, away_win_prob=excluded.away_win_prob,
           predicted_home_score=excluded.predicted_home_score,
           predicted_away_score=excluded.predicted_away_score,
           predicted_spread=excluded.predicted_spread,
           predicted_total=excluded.predicted_total,
           confidence=excluded.confidence, model_version=excluded.model_version`
      )
      .bind(
        row.id, p.home_win_prob, p.away_win_prob, p.predicted_home_score,
        p.predicted_away_score, p.predicted_spread, p.predicted_total,
        p.confidence, p.model_version
      );
  });

  await db.batch(statements);
  log.predictionsWritten = statements.length;
}

// --- orchestration ----------------------------------------------------------

async function runSync(env, { trigger, force = false } = {}) {
  const started = Date.now();
  const log = {
    trigger,
    model: MODEL_VERSION,
    datesFetched: [],
    gamesUpserted: 0,
    graded: 0,
    ratingsApplied: 0,
    predictionsWritten: 0,
    withMarket: 0,
    odds: null,
    errors: [],
  };

  const db = env.DB;
  if (!db) throw new Error("D1 binding `DB` is not configured");

  await migrate(db);

  // 1. current window: yesterday through three days out
  await syncDates(env, db, [utcDate(-1), utcDate(0), utcDate(1), utcDate(2), utcDate(3)], log);

  // 2. rescue anything stuck in a stale status
  await reconcileStranded(env, db, log);

  // 3. grade results and update ratings
  const season = await currentSeason(db);
  log.season = season;
  const state = await loadState(db, season);
  await settleFinishedGames(db, season, state, log);
  await saveState(db, season, state);

  // 4. predictions — rate-limited independently of the score refresh
  const lastPredict = parseInt((await getMeta(db, "predict_last_run")) || "0", 10);
  if (force || Date.now() - lastPredict >= PREDICT_MIN_INTERVAL_MS) {
    const oddsMap = await fetchOdds(db, env.ODDS_API_KEY, force, log);
    await writePredictions(db, state, oddsMap, log);
    await setMeta(db, "predict_last_run", Date.now());
  } else {
    log.predictionsWritten = "skipped (refreshed within 30min)";
  }

  await setMeta(db, "last_sync", new Date().toISOString());
  log.durationMs = Date.now() - started;
  return log;
}

async function health(env) {
  const db = env.DB;
  if (!db) return { ok: false, error: "no DB binding" };

  // A brand-new database has none of the tables yet, and /health is the first thing
  // anyone calls after a deploy.
  await migrate(db);

  const [counts, lastSync, oddsLeft, ratings, results] = await Promise.all([
    db.prepare("SELECT status, COUNT(*) AS count FROM games GROUP BY status").all(),
    getMeta(db, "last_sync"),
    getMeta(db, "odds_credits_remaining"),
    db.prepare("SELECT COUNT(*) AS n FROM team_ratings").first().catch(() => null),
    db.prepare("SELECT COUNT(*) AS n FROM prediction_results").first().catch(() => null),
  ]);

  return {
    ok: true,
    model: MODEL_VERSION,
    hasOddsKey: Boolean(env.ODDS_API_KEY),
    lastSync,
    oddsCreditsRemaining: oddsLeft,
    teamRatings: ratings?.n ?? 0,
    gradedResults: results?.n ?? 0,
    games: counts.results || [],
  };
}
