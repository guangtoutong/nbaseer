/**
 * NBAseer prediction model.
 *
 * Elo with margin-of-victory scaling (the FiveThirtyEight formulation), plus a
 * pace/efficiency estimate for total points. Shared verbatim between the Cloudflare
 * Worker and scripts/backfill.mjs so the backtested numbers describe the model that
 * actually runs in production.
 *
 * Conventions used throughout this codebase:
 *   predicted_spread  = away_score - home_score   (negative => home favoured)
 *   actual_spread     = away_score - home_score
 */

export const MODEL_VERSION = "elo-mov-1.1";

export const TEAM_ID = {
  ATL: 1, BOS: 2, BKN: 3, CHA: 4, CHI: 5,
  CLE: 6, DAL: 7, DEN: 8, DET: 9, GSW: 10,
  HOU: 11, IND: 12, LAC: 13, LAL: 14, MEM: 15,
  MIA: 16, MIL: 17, MIN: 18, NOP: 19, NYK: 20,
  OKC: 21, ORL: 22, PHI: 23, PHX: 24, POR: 25,
  SAC: 26, SAS: 27, TOR: 28, UTA: 29, WAS: 30,
};

/**
 * ESPN abbreviates six teams differently from the three-letter codes stored in the
 * `teams` table. Until this map existed every game involving the Warriors, Knicks,
 * Pelicans, Spurs, Jazz or Wizards was silently discarded — a fifth of the league.
 */
export const ESPN_ABBR_ALIAS = {
  GS: "GSW",
  NO: "NOP",
  NY: "NYK",
  SA: "SAS",
  UTAH: "UTA",
  WSH: "WAS",
};

/** Resolve an ESPN abbreviation to the team id used throughout the database. */
export function resolveTeamId(abbr) {
  if (!abbr) return null;
  return TEAM_ID[ESPN_ABBR_ALIAS[abbr] ?? abbr] ?? null;
}

/** the-odds-api reports full team names; map them back to abbreviations. */
export const TEAM_NAME_TO_ABBR = {
  "Atlanta Hawks": "ATL", "Boston Celtics": "BOS", "Brooklyn Nets": "BKN",
  "Charlotte Hornets": "CHA", "Chicago Bulls": "CHI", "Cleveland Cavaliers": "CLE",
  "Dallas Mavericks": "DAL", "Denver Nuggets": "DEN", "Detroit Pistons": "DET",
  "Golden State Warriors": "GSW", "Houston Rockets": "HOU", "Indiana Pacers": "IND",
  "Los Angeles Clippers": "LAC", "LA Clippers": "LAC",
  "Los Angeles Lakers": "LAL", "LA Lakers": "LAL",
  "Memphis Grizzlies": "MEM", "Miami Heat": "MIA", "Milwaukee Bucks": "MIL",
  "Minnesota Timberwolves": "MIN", "New Orleans Pelicans": "NOP",
  "New York Knicks": "NYK", "Oklahoma City Thunder": "OKC", "Orlando Magic": "ORL",
  "Philadelphia 76ers": "PHI", "Phoenix Suns": "PHX", "Portland Trail Blazers": "POR",
  "Sacramento Kings": "SAC", "San Antonio Spurs": "SAS", "Toronto Raptors": "TOR",
  "Utah Jazz": "UTA", "Washington Wizards": "WAS",
};

// --- tuning constants -------------------------------------------------------

export const INITIAL_ELO = 1500;

/** How far season-end ratings are pulled back toward average for the next season. */
export const SEASON_CARRYOVER = 0.75;

/** A total is scored as a hit when it lands within this many points. */
export const TOTAL_TOLERANCE = 10;

/**
 * Tunable parameters, fitted against the 2025-26 season by scripts/tune.mjs.
 * Exported as a mutable object so that tuner can sweep them without a second
 * copy of the model drifting out of sync with this one.
 */
export const CONFIG = {
  /** Elo points gained/lost per game before the MOV multiplier. */
  K_FACTOR: 24,

  /** 22 Elo ~= 1 point of scoring margin. */
  ELO_PER_POINT: 22,

  /** 55 Elo over 22 Elo/point ~= 2.5 points, the modern NBA home-court edge. */
  HOME_ADV_ELO: 55,

  /** Second night of a back-to-back. Worth about a point. */
  B2B_PENALTY_ELO: 25,

  /** League-average points per team per game, used as the early-season prior. */
  LEAGUE_PPG: 114,

  /** Games of real data needed before a team's own scoring rates outweigh the prior. */
  PPG_PRIOR_GAMES: 20,

  /**
   * "additive" averages the two teams' offensive and defensive rates;
   * "multiplicative" scales offence by the opponent's defence relative to the
   * league. The two are within noise of each other on a season of data; additive
   * wins narrowly and is easier to reason about.
   */
  TOTAL_MODEL: "additive",

  /** Shrink the spread toward zero. 1.0 — shrinking made the spread worse. */
  MARGIN_SHRINK: 1.0,

  /** Weight given to the market when bookmaker odds are available. */
  MARKET_WEIGHT: 0.5,
};

// --- rating state -----------------------------------------------------------

export function newRatingState() {
  const state = { elo: {}, offPpg: {}, defPpg: {}, gamesPlayed: {}, lastGameDate: {} };
  for (const id of Object.values(TEAM_ID)) {
    state.elo[id] = INITIAL_ELO;
    state.offPpg[id] = CONFIG.LEAGUE_PPG;
    state.defPpg[id] = CONFIG.LEAGUE_PPG;
    state.gamesPlayed[id] = 0;
    state.lastGameDate[id] = null;
  }
  return state;
}

/** Rebuild the in-memory state from rows of the team_ratings table. */
export function stateFromRows(rows) {
  const state = newRatingState();
  for (const r of rows || []) {
    const id = r.team_id;
    if (state.elo[id] === undefined) continue;
    if (r.elo != null) state.elo[id] = r.elo;
    if (r.off_ppg != null) state.offPpg[id] = r.off_ppg;
    if (r.def_ppg != null) state.defPpg[id] = r.def_ppg;
    if (r.games_played != null) state.gamesPlayed[id] = r.games_played;
    if (r.last_game_date != null) state.lastGameDate[id] = r.last_game_date;
  }
  return state;
}

function daysBetween(fromDate, toDate) {
  if (!fromDate || !toDate) return null;
  const a = Date.parse(`${String(fromDate).slice(0, 10)}T00:00:00Z`);
  const b = Date.parse(`${String(toDate).slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86400000);
}

function isBackToBack(state, teamId, gameDate) {
  return daysBetween(state.lastGameDate[teamId], gameDate) === 1;
}

/** Blend a team's own scoring rate with the league prior — matters in October. */
function regressed(value, games) {
  const w = games / (games + CONFIG.PPG_PRIOR_GAMES);
  return w * value + (1 - w) * CONFIG.LEAGUE_PPG;
}

// --- prediction -------------------------------------------------------------

/**
 * @param {object} state      rating state
 * @param {object} game       { homeId, awayId, tipoff }
 * @param {object} [market]   optional { home_win_prob, spread, total } from bookmakers
 */
export function predict(state, game, market = null) {
  const { homeId, awayId, tipoff } = game;
  const gameDate = String(tipoff || "").slice(0, 10);

  let eloHome = state.elo[homeId] ?? INITIAL_ELO;
  let eloAway = state.elo[awayId] ?? INITIAL_ELO;

  eloHome += CONFIG.HOME_ADV_ELO;
  if (isBackToBack(state, homeId, gameDate)) eloHome -= CONFIG.B2B_PENALTY_ELO;
  if (isBackToBack(state, awayId, gameDate)) eloAway -= CONFIG.B2B_PENALTY_ELO;

  const eloDiff = eloHome - eloAway;

  let homeWinProb = 1 / (1 + Math.pow(10, -eloDiff / 400));
  let homeMargin = (eloDiff / CONFIG.ELO_PER_POINT) * CONFIG.MARGIN_SHRINK;

  // Expected scoring: what each offence typically produces against this defence.
  const hg = state.gamesPlayed[homeId] ?? 0;
  const ag = state.gamesPlayed[awayId] ?? 0;
  const homeOff = regressed(state.offPpg[homeId] ?? CONFIG.LEAGUE_PPG, hg);
  const homeDef = regressed(state.defPpg[homeId] ?? CONFIG.LEAGUE_PPG, hg);
  const awayOff = regressed(state.offPpg[awayId] ?? CONFIG.LEAGUE_PPG, ag);
  const awayDef = regressed(state.defPpg[awayId] ?? CONFIG.LEAGUE_PPG, ag);

  let total;
  if (CONFIG.TOTAL_MODEL === "multiplicative") {
    total =
      (homeOff * awayDef) / CONFIG.LEAGUE_PPG + (awayOff * homeDef) / CONFIG.LEAGUE_PPG;
  } else {
    total = (homeOff + awayDef) / 2 + (awayOff + homeDef) / 2;
  }

  let source = "model";
  if (market) {
    // The closing line is a strong forecast; let it pull the model toward it
    // rather than replacing it outright.
    const w = CONFIG.MARKET_WEIGHT;
    if (Number.isFinite(market.home_win_prob)) {
      homeWinProb = (1 - w) * homeWinProb + w * market.home_win_prob;
    }
    if (Number.isFinite(market.spread)) {
      homeMargin = (1 - w) * homeMargin + w * -market.spread;
    }
    if (Number.isFinite(market.total) && market.total > 0) {
      total = (1 - w) * total + w * market.total;
    }
    source = "model+market";
  }

  homeWinProb = Math.min(0.97, Math.max(0.03, homeWinProb));
  const awayWinProb = 1 - homeWinProb;

  const predictedHomeScore = Math.round((total + homeMargin) / 2);
  const predictedAwayScore = Math.round((total - homeMargin) / 2);

  return {
    home_win_prob: +homeWinProb.toFixed(4),
    away_win_prob: +awayWinProb.toFixed(4),
    predicted_home_score: predictedHomeScore,
    predicted_away_score: predictedAwayScore,
    predicted_spread: +(-homeMargin).toFixed(1),
    predicted_total: +total.toFixed(1),
    // Confidence is simply the probability assigned to the side we picked, so a
    // coin-flip game reads 50% instead of being dressed up as something firmer.
    confidence: +Math.max(homeWinProb, awayWinProb).toFixed(4),
    model_version: `${MODEL_VERSION}/${source}`,
  };
}

// --- rating updates ---------------------------------------------------------

/** Apply one finished game to the Elo ratings. */
export function applyGameToElo(state, game) {
  const { homeId, awayId, homeScore, awayScore } = game;
  const gameDate = String(game.tipoff || game.date || "").slice(0, 10);

  let eloHome = (state.elo[homeId] ?? INITIAL_ELO) + CONFIG.HOME_ADV_ELO;
  let eloAway = state.elo[awayId] ?? INITIAL_ELO;
  if (isBackToBack(state, homeId, gameDate)) eloHome -= CONFIG.B2B_PENALTY_ELO;
  if (isBackToBack(state, awayId, gameDate)) eloAway -= CONFIG.B2B_PENALTY_ELO;

  const expectedHome = 1 / (1 + Math.pow(10, -(eloHome - eloAway) / 400));
  const homeWon = homeScore > awayScore;
  const actualHome = homeWon ? 1 : 0;

  const mov = Math.abs(homeScore - awayScore);
  // Elo edge from the winner's point of view — damps runaway ratings when a
  // heavy favourite blows someone out.
  const winnerEloDiff = homeWon ? eloHome - eloAway : eloAway - eloHome;
  const movMultiplier = Math.pow(mov + 3, 0.8) / (7.5 + 0.006 * winnerEloDiff);

  const delta = CONFIG.K_FACTOR * movMultiplier * (actualHome - expectedHome);

  state.elo[homeId] = (state.elo[homeId] ?? INITIAL_ELO) + delta;
  state.elo[awayId] = (state.elo[awayId] ?? INITIAL_ELO) - delta;
}

/** Fold a finished game into the running scoring averages and rest tracking. */
export function recordGameForState(state, game) {
  const { homeId, awayId, homeScore, awayScore } = game;
  const gameDate = String(game.tipoff || game.date || "").slice(0, 10);

  for (const [teamId, scored, allowed] of [
    [homeId, homeScore, awayScore],
    [awayId, awayScore, homeScore],
  ]) {
    const n = state.gamesPlayed[teamId] ?? 0;
    state.offPpg[teamId] = ((state.offPpg[teamId] ?? CONFIG.LEAGUE_PPG) * n + scored) / (n + 1);
    state.defPpg[teamId] = ((state.defPpg[teamId] ?? CONFIG.LEAGUE_PPG) * n + allowed) / (n + 1);
    state.gamesPlayed[teamId] = n + 1;
    if (!state.lastGameDate[teamId] || gameDate > state.lastGameDate[teamId]) {
      state.lastGameDate[teamId] = gameDate;
    }
  }
}

// --- grading ----------------------------------------------------------------

/**
 * Grade a prediction against the final score.
 *
 * winner_correct — did we name the winning team?
 * spread_correct — did the side we favoured beat our own number? For a calibrated
 *                  model this sits near 50%, which is the honest expectation.
 * total_correct  — did the final total land within TOTAL_TOLERANCE points?
 */
export function gradePrediction(pred, homeScore, awayScore) {
  const actualSpread = awayScore - homeScore;
  const actualTotal = homeScore + awayScore;

  const actualHomeMargin = homeScore - awayScore;
  const predictedHomeMargin = -pred.predicted_spread;

  const winnerCorrect =
    (pred.home_win_prob > 0.5) === (actualHomeMargin > 0) && actualHomeMargin !== 0 ? 1 : 0;

  let spreadCorrect = 0;
  if (predictedHomeMargin !== 0) {
    spreadCorrect =
      (actualHomeMargin - predictedHomeMargin) * Math.sign(predictedHomeMargin) > 0 ? 1 : 0;
  }

  const totalCorrect =
    Math.abs(actualTotal - pred.predicted_total) <= TOTAL_TOLERANCE ? 1 : 0;

  return {
    winner_correct: winnerCorrect,
    spread_correct: spreadCorrect,
    total_correct: totalCorrect,
    actual_spread: actualSpread,
    actual_total: actualTotal,
  };
}

/** American odds -> implied probability. */
export function americanOddsToProb(odds) {
  if (!Number.isFinite(odds)) return null;
  return odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
}
