/**
 * Parameter sweep for the prediction model.
 *
 * Replays the cached season walk-forward under each candidate setting and reports
 * the metrics side by side. Reads the cache written by scripts/backfill.mjs, so run
 * that first.
 *
 * Run: node scripts/tune.mjs [startDate] [endDate]
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONFIG,
  predict,
  applyGameToElo,
  gradePrediction,
  newRatingState,
  recordGameForState,
} from "../worker/model.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const START = process.argv[2] || "2025-10-21";
const END = process.argv[3] || "2026-06-27";
const CACHE = join(__dirname, "..", "db", `games-cache-${START}_${END}.json`);

if (!existsSync(CACHE)) {
  console.error(`No cache at ${CACHE}\nRun: node scripts/backfill.mjs ${START} ${END}`);
  process.exit(1);
}

const GAMES = JSON.parse(readFileSync(CACHE, "utf8"));
const WARMUP = Math.min(150, Math.floor(GAMES.length * 0.12));

function evaluate(overrides) {
  const saved = { ...CONFIG };
  Object.assign(CONFIG, overrides);

  const state = newRatingState();
  const rows = [];

  for (const g of GAMES) {
    const pred = predict(state, { homeId: g.homeId, awayId: g.awayId, tipoff: g.tipoff });
    rows.push({ pred, result: gradePrediction(pred, g.homeScore, g.awayScore) });
    applyGameToElo(state, g);
    recordGameForState(state, g);
  }

  Object.assign(CONFIG, saved);

  const ev = rows.slice(WARMUP);
  const n = ev.length;
  const sum = (f) => ev.reduce((a, x) => a + f(x), 0);

  return {
    winner: (sum((e) => e.result.winner_correct) / n) * 100,
    ats: (sum((e) => e.result.spread_correct) / n) * 100,
    totalHit: (sum((e) => e.result.total_correct) / n) * 100,
    spreadMae: sum((e) => Math.abs(e.result.actual_spread - e.pred.predicted_spread)) / n,
    totalMae: sum((e) => Math.abs(e.result.actual_total - e.pred.predicted_total)) / n,
    brier:
      sum((e) => {
        const homeWon = e.result.actual_spread < 0 ? 1 : 0;
        return (e.pred.home_win_prob - homeWon) ** 2;
      }) / n,
  };
}

function report(label, m) {
  console.log(
    `  ${label.padEnd(34)} ` +
      `win ${m.winner.toFixed(1)}%  ` +
      `brier ${m.brier.toFixed(4)}  ` +
      `sprMAE ${m.spreadMae.toFixed(2)}  ` +
      `totMAE ${m.totalMae.toFixed(2)}  ` +
      `totHit ${m.totalHit.toFixed(1)}%`
  );
}

function sweep(title, key, values, base = {}) {
  console.log(`\n=== ${title} ===`);
  const results = values.map((v) => ({ v, m: evaluate({ ...base, [key]: v }) }));
  for (const { v, m } of results) report(`${key}=${v}`, m);
  return results;
}

console.log(`Tuning on ${GAMES.length} games (${WARMUP} warmup excluded, ${GAMES.length - WARMUP} evaluated)`);

console.log("\n=== baseline (current CONFIG) ===");
const baseline = evaluate({});
report("baseline", baseline);

sweep("total points formula", "TOTAL_MODEL", ["additive", "multiplicative"]);
sweep("scoring prior strength", "PPG_PRIOR_GAMES", [4, 8, 12, 20, 30]);
sweep("home court (Elo)", "HOME_ADV_ELO", [40, 55, 70, 85, 100]);
sweep("back-to-back penalty", "B2B_PENALTY_ELO", [0, 20, 35, 50, 70]);
sweep("K factor", "K_FACTOR", [12, 16, 20, 24, 30]);
sweep("Elo per point", "ELO_PER_POINT", [22, 25, 28, 32, 36]);
sweep("margin shrink", "MARGIN_SHRINK", [0.7, 0.8, 0.9, 1.0]);

console.log("\nPick by: winner% and brier for the probabilities, sprMAE for the spread,");
console.log("totMAE for the total. Ignore ats% — it hovers near 50 by construction.\n");

// --- joint grid over the parameters that actually moved the metrics -----------
// Univariate sweeps hide interactions, and with ~1,200 games a 0.5pp difference
// in win rate is inside the noise, so the grid is for spotting a stable region
// rather than crowning a single winner.
if (process.argv.includes("--grid")) {
  console.log("\n=== joint grid ===");
  const results = [];
  for (const HOME_ADV_ELO of [40, 55, 70])
    for (const K_FACTOR of [20, 24, 28])
      for (const ELO_PER_POINT of [22, 25, 28])
        for (const B2B_PENALTY_ELO of [0, 25, 40]) {
          const overrides = {
            HOME_ADV_ELO, K_FACTOR, ELO_PER_POINT, B2B_PENALTY_ELO,
            TOTAL_MODEL: "additive", PPG_PRIOR_GAMES: 20,
          };
          results.push({ overrides, m: evaluate(overrides) });
        }

  console.log("\n top 10 by Brier score (probability quality):");
  for (const r of [...results].sort((a, b) => a.m.brier - b.m.brier).slice(0, 10)) {
    const o = r.overrides;
    report(`hca${o.HOME_ADV_ELO} k${o.K_FACTOR} epp${o.ELO_PER_POINT} b2b${o.B2B_PENALTY_ELO}`, r.m);
  }

  console.log("\n top 10 by spread MAE:");
  for (const r of [...results].sort((a, b) => a.m.spreadMae - b.m.spreadMae).slice(0, 10)) {
    const o = r.overrides;
    report(`hca${o.HOME_ADV_ELO} k${o.K_FACTOR} epp${o.ELO_PER_POINT} b2b${o.B2B_PENALTY_ELO}`, r.m);
  }
}
