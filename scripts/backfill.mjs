/**
 * Elo seeding + walk-forward backtest.
 *
 * Pulls every completed game of a season from ESPN, replays it through the same
 * Elo model the worker uses, and emits:
 *   - seed Elo ratings per team (starting point for the new season)
 *   - an honest walk-forward accuracy report (predict BEFORE grading each game)
 *   - SQL to load the historical games / predictions / results into D1
 *
 * Run: node scripts/backfill.mjs [startDate] [endDate]
 *   e.g. node scripts/backfill.mjs 2025-10-21 2026-06-27
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  TEAM_ID,
  resolveTeamId,
  INITIAL_ELO,
  SEASON_CARRYOVER,
  MODEL_VERSION,
  predict,
  applyGameToElo,
  gradePrediction,
  newRatingState,
  recordGameForState,
} from "../worker/model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "db");

const START = process.argv[2] || "2025-10-21";
const END = process.argv[3] || "2026-06-27";

const ESPN = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";

/** Effective games-played credited to last season's scoring rates when seeding. */
const PRIOR_WEIGHT_GAMES = 12;

function* dateRange(start, end) {
  const d = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (d <= last) {
    yield d.toISOString().slice(0, 10);
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Pace between requests. A full season is ~250 calls and ESPN throttles bursts. */
const REQUEST_SPACING_MS = 150;

async function fetchDate(date, attempt = 0) {
  const url = `${ESPN}?dates=${date.replace(/-/g, "")}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
    // 403/429 here mean "slow down", not "forbidden forever" — back off hard and
    // retry rather than silently dropping a day of games.
    if (res.status === 403 || res.status === 429) {
      if (attempt < 5) {
        await sleep(5000 * (attempt + 1));
        return fetchDate(date, attempt + 1);
      }
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (attempt < 5) {
      await sleep(1000 * (attempt + 1));
      return fetchDate(date, attempt + 1);
    }
    console.error(`  ! ${date}: ${err.message}`);
    return { events: [] };
  }
}

function parseEvent(evt) {
  const comp = evt?.competitions?.[0];
  if (!comp) return null;
  const home = comp.competitors?.find((c) => c.homeAway === "home");
  const away = comp.competitors?.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const statusName = comp.status?.type?.name;
  if (statusName !== "STATUS_FINAL") return null;

  const homeAbbr = home.team?.abbreviation;
  const awayAbbr = away.team?.abbreviation;
  const homeId = resolveTeamId(homeAbbr);
  const awayId = resolveTeamId(awayAbbr);
  if (!homeId || !awayId) return null;

  const homeScore = parseInt(home.score, 10);
  const awayScore = parseInt(away.score, 10);
  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return null;
  if (homeScore === 0 && awayScore === 0) return null;

  return {
    id: parseInt(evt.id, 10),
    date: evt.date.slice(0, 10),
    tipoff: evt.date,
    homeAbbr,
    awayAbbr,
    homeId,
    awayId,
    homeScore,
    awayScore,
    postseason: comp.type?.abbreviation === "STD" ? 0 : 0,
    season: evt.season?.year ?? null,
    seasonType: evt.season?.type ?? 2,
  };
}

function sqlStr(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

/** Fetching 250 days takes minutes; cache the raw results so model tweaks are instant. */
async function loadGames() {
  const cachePath = join(OUT_DIR, `games-cache-${START}_${END}.json`);

  if (existsSync(cachePath)) {
    const cached = JSON.parse(readFileSync(cachePath, "utf8"));
    console.log(`Loaded ${cached.length} games from cache (delete ${cachePath} to refetch)`);
    return cached;
  }

  console.log(`Fetching NBA results ${START} .. ${END} from ESPN`);
  const games = [];
  let days = 0;
  for (const date of dateRange(START, END)) {
    const data = await fetchDate(date);
    games.push(...(data.events || []).map(parseEvent).filter(Boolean));
    await sleep(REQUEST_SPACING_MS);
    days++;
    if (days % 25 === 0) {
      console.log(`  ${date}  (${days} days, ${games.length} games)`);
    }
  }

  // ESPN can list the same game under adjacent dates; de-dup and order by tipoff.
  const byId = new Map();
  for (const g of games) byId.set(g.id, g);
  const ordered = [...byId.values()].sort((a, b) => a.tipoff.localeCompare(b.tipoff));

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(cachePath, JSON.stringify(ordered));
  return ordered;
}

async function main() {
  const ordered = await loadGames();
  const days = new Set(ordered.map((g) => g.date)).size;

  console.log(`\n${ordered.length} completed games across ${days} days\n`);
  if (ordered.length === 0) {
    console.error("No games found — nothing to seed. Check the date range.");
    process.exit(1);
  }

  // --- walk-forward: predict with ratings as they stood, THEN update ---
  const state = newRatingState();
  const graded = [];
  const rows = [];

  for (const g of ordered) {
    const pred = predict(state, {
      homeId: g.homeId,
      awayId: g.awayId,
      tipoff: g.tipoff,
    });

    const result = gradePrediction(pred, g.homeScore, g.awayScore);
    graded.push({ game: g, pred, result });
    rows.push({ g, pred, result });

    applyGameToElo(state, g);
    recordGameForState(state, g);
  }

  // --- honest accuracy report ---
  // Skip the first 150 games: every team starts at 1500, so those predictions
  // carry no information and would flatter nothing but the home-court prior.
  const WARMUP = Math.min(150, Math.floor(graded.length * 0.12));
  const evaluated = graded.slice(WARMUP);

  const pct = (n, d) => (d ? (n / d) * 100 : 0);
  const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);

  const winners = sum(evaluated, (e) => e.result.winner_correct);
  const spreads = sum(evaluated, (e) => e.result.spread_correct);
  const totals = sum(evaluated, (e) => e.result.total_correct);

  const mae = sum(evaluated, (e) =>
    Math.abs(e.result.actual_spread - e.pred.predicted_spread)
  ) / evaluated.length;
  const totalMae = sum(evaluated, (e) =>
    Math.abs(e.result.actual_total - e.pred.predicted_total)
  ) / evaluated.length;

  // Brier score — the real test of whether the probabilities mean anything.
  const brier = sum(evaluated, (e) => {
    const homeWon = e.result.actual_spread < 0 ? 1 : 0;
    return (e.pred.home_win_prob - homeWon) ** 2;
  }) / evaluated.length;

  const report = {
    generated_at: new Date().toISOString(),
    model_version: MODEL_VERSION,
    source: "ESPN scoreboard API",
    range: { start: START, end: END },
    games_fetched: ordered.length,
    warmup_games_excluded: WARMUP,
    games_evaluated: evaluated.length,
    winner_accuracy: +pct(winners, evaluated.length).toFixed(1),
    spread_accuracy: +pct(spreads, evaluated.length).toFixed(1),
    total_accuracy: +pct(totals, evaluated.length).toFixed(1),
    correct_winners: winners,
    correct_spreads: spreads,
    correct_totals: totals,
    spread_mae: +mae.toFixed(2),
    total_mae: +totalMae.toFixed(2),
    brier_score: +brier.toFixed(4),
  };

  console.log("=== walk-forward backtest ===");
  console.log(`  evaluated       ${report.games_evaluated} games (warmup ${WARMUP} excluded)`);
  console.log(`  winner accuracy ${report.winner_accuracy}%  (${winners}/${evaluated.length})`);
  console.log(`  spread (ATS)    ${report.spread_accuracy}%`);
  console.log(`  total (O/U)     ${report.total_accuracy}%`);
  console.log(`  spread MAE      ${report.spread_mae} pts`);
  console.log(`  total MAE       ${report.total_mae} pts`);
  console.log(`  Brier score     ${report.brier_score}  (0.25 = coin flip)`);
  console.log("");

  // --- carry Elo into the new season (regress 25% toward the mean) ---
  const seeds = Object.entries(TEAM_ID)
    .map(([abbr, id]) => {
      const elo = state.elo[id] ?? INITIAL_ELO;
      return {
        abbr,
        id,
        final_elo: +elo.toFixed(1),
        seed_elo: +(INITIAL_ELO + SEASON_CARRYOVER * (elo - INITIAL_ELO)).toFixed(1),
        off_ppg: +state.offPpg[id].toFixed(1),
        def_ppg: +state.defPpg[id].toFixed(1),
        games: state.gamesPlayed[id] ?? 0,
      };
    })
    .sort((a, b) => b.final_elo - a.final_elo);

  console.log("=== end-of-season Elo (top 10) ===");
  for (const s of seeds.slice(0, 10)) {
    console.log(`  ${s.abbr.padEnd(4)} ${String(s.final_elo).padStart(7)}  ->  seed ${s.seed_elo}`);
  }
  console.log("");

  mkdirSync(OUT_DIR, { recursive: true });

  writeFileSync(
    join(OUT_DIR, "backtest-report.json"),
    JSON.stringify({ ...report, seeds }, null, 2)
  );

  // --- SQL: seed ratings ---
  const nextSeason = (ordered.at(-1).season ?? new Date().getFullYear()) + 1;
  const seedSql = [
    "-- Generated by scripts/backfill.mjs — seed Elo for the upcoming season.",
    `-- Source: ${report.games_fetched} ESPN games, ${START}..${END}`,
    "",
    // games_played seeds the weight the scoring rates carry on opening night. At 0
    // the model would discard last season's rates entirely and quote the league
    // average total for every game until mid-November; PRIOR_WEIGHT gives them
    // roughly a third of the weight, which real games quickly overtake.
    ...seeds.map(
      (s) =>
        `INSERT INTO team_ratings (team_id, season, elo, off_ppg, def_ppg, games_played, updated_at) ` +
        `VALUES (${s.id}, ${nextSeason}, ${s.seed_elo}, ${s.off_ppg}, ${s.def_ppg}, ${PRIOR_WEIGHT_GAMES}, datetime('now')) ` +
        `ON CONFLICT(team_id, season) DO UPDATE SET elo=excluded.elo, off_ppg=excluded.off_ppg, ` +
        `def_ppg=excluded.def_ppg, games_played=excluded.games_played, updated_at=datetime('now');`
    ),
    "",
  ].join("\n");
  writeFileSync(join(OUT_DIR, "seed-ratings.sql"), seedSql);

  // Deliberately NOT emitting the historical games/predictions as SQL for the live
  // database. Two reasons:
  //   1. Those rows carry rating_applied = 0, so the worker would fold all 1,172
  //      games into ratings that already include them via the season carryover,
  //      double-counting every result.
  //   2. /history states that each row was written before tip-off. Backtest rows
  //      were written today; mixing them in would misrepresent the track record.
  // The backtest is published on /about and /whitepaper, labelled as a backtest.

  console.log("Wrote:");
  console.log(`  src/lib/backtest.ts       (model: ${MODEL_VERSION})`);
  console.log(`  db/backtest-report.json   (${report.games_evaluated} games evaluated)`);
  console.log(`  db/seed-ratings.sql       (30 teams, season ${nextSeason})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
