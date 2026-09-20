/**
 * Local stand-in for the ESPN scoreboard API.
 *
 * The worker reaches ESPN fine on its own, so this is not a connectivity
 * workaround. It exists to shift real fixtures onto whatever day the worker thinks
 * is today, which is the only way to exercise the full lifecycle — predict before
 * tip-off, settle afterwards, update Elo — outside of the season.
 *
 * Run: node scripts/espn-replay.mjs [port]
 * Then: echo 'ESPN_SCOREBOARD_URL="http://127.0.0.1:8798/scoreboard"' > worker/.dev.vars
 *       cd worker && wrangler dev --port 8811
 */

import { createServer } from "node:http";

const PORT = Number(process.argv[2] || 8798);
const UPSTREAM =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";

const cache = new Map();

/** Optional date shift, so "today" can be moved to a day that has real games. */
const SHIFT_DAYS = Number(process.env.REPLAY_SHIFT_DAYS || 0);

/**
 * Rewind finished games to "not started yet". Lets a test drive the full lifecycle
 * against real fixtures: serve a day as scheduled so the worker records predictions,
 * restart without this flag, and the same games come back final to be graded.
 */
const FORCE_SCHEDULED = process.env.REPLAY_FORCE_SCHEDULED === "1";

/**
 * Move event timestamps back onto the date the worker actually asked for, keeping
 * the time of day. Without this the worker stores games dated months away from its
 * own query window and every downstream date filter misses them — an artefact of
 * the harness, not of production, where the two always agree.
 */
function realignDates(payload, requestedYmd) {
  const day = `${requestedYmd.slice(0, 4)}-${requestedYmd.slice(4, 6)}-${requestedYmd.slice(6, 8)}`;
  for (const evt of payload.events || []) {
    const timeOfDay = String(evt.date).slice(10); // "T23:00Z"
    evt.date = `${day}${timeOfDay}`;
    for (const comp of evt.competitions || []) {
      if (comp.date) comp.date = evt.date;
    }
  }
  return payload;
}

function rewindToScheduled(payload) {
  for (const evt of payload.events || []) {
    for (const comp of evt.competitions || []) {
      comp.status = {
        ...comp.status,
        period: 0,
        displayClock: "0.0",
        type: { ...comp.status?.type, name: "STATUS_SCHEDULED", completed: false },
      };
      for (const c of comp.competitors || []) c.score = "0";
    }
  }
  return payload;
}

function shift(yyyymmdd) {
  if (!SHIFT_DAYS) return yyyymmdd;
  const y = +yyyymmdd.slice(0, 4);
  const m = +yyyymmdd.slice(4, 6) - 1;
  const d = +yyyymmdd.slice(6, 8);
  const shifted = new Date(Date.UTC(y, m, d + SHIFT_DAYS));
  return shifted.toISOString().slice(0, 10).replace(/-/g, "");
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const requested = url.searchParams.get("dates") || "";
  const dates = shift(requested);

  try {
    if (!cache.has(dates)) {
      const upstream = await fetch(`${UPSTREAM}?dates=${dates}`);
      if (!upstream.ok) throw new Error(`upstream HTTP ${upstream.status}`);
      cache.set(dates, await upstream.json());
      console.log(`  fetched ${dates}${requested !== dates ? ` (for ${requested})` : ""}`);
    }

    let payload = structuredClone(cache.get(dates));
    if (requested && requested !== dates) payload = realignDates(payload, requested);
    if (FORCE_SCHEDULED) payload = rewindToScheduled(payload);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  } catch (err) {
    console.error(`  ! ${dates}: ${err.message}`);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}).listen(PORT, "127.0.0.1", () => {
  console.log(`ESPN replay on http://127.0.0.1:${PORT}/scoreboard`);
  if (SHIFT_DAYS) console.log(`  shifting every requested date by ${SHIFT_DAYS} days`);
  if (FORCE_SCHEDULED) console.log("  rewinding all games to STATUS_SCHEDULED");
});
