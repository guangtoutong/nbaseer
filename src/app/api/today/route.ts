/**
 * Today's Games API Route
 * GET /api/today - Get today's games with predictions
 */

import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    // The worker stores each game under the UTC day of its tipoff instant, so the
    // windows below are computed in UTC too. Mixing in a Beijing-shifted "today"
    // used to hide evening games: a 7:30pm ET tipoff is filed under the previous
    // UTC day but falls on the next day in Beijing.
    const utcDay = (offset: number) =>
      new Date(Date.now() + offset * 86400000).toISOString().split('T')[0];

    const today = utcDay(0);
    const windowStart = utcDay(-2);   // completed games worth showing
    const liveStart = utcDay(-1);     // a live game can only be today or yesterday
    const windowEnd = utcDay(3);      // upcoming games

    // Get live games
    const liveGames = await db.prepare(`
      SELECT
        g.*,
        ht.full_name as home_team,
        at.full_name as away_team,
        ht.abbreviation as home_abbr,
        at.abbreviation as away_abbr,
        ht.name_cn as home_team_cn,
        at.name_cn as away_team_cn,
        p.home_win_prob,
        p.away_win_prob,
        p.predicted_home_score,
        p.predicted_away_score,
        p.predicted_spread,
        p.predicted_total,
        p.confidence,
        p.model_version,
        hr.elo as home_elo,
        ar.elo as away_elo,
        o.bookmaker as odds_book,
        o.home_ml, o.away_ml, o.spread_home, o.total_over
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN predictions p ON g.id = p.game_id
      LEFT JOIN team_ratings hr ON hr.team_id = g.home_team_id AND hr.season = g.season
      LEFT JOIN team_ratings ar ON ar.team_id = g.away_team_id AND ar.season = g.season
      LEFT JOIN odds o ON o.game_id = g.id
      WHERE g.status = 'live' AND g.date >= ?
      ORDER BY g.time ASC
    `).bind(liveStart).all();

    // Get today's scheduled games
    const scheduledGames = await db.prepare(`
      SELECT
        g.*,
        ht.full_name as home_team,
        at.full_name as away_team,
        ht.abbreviation as home_abbr,
        at.abbreviation as away_abbr,
        ht.name_cn as home_team_cn,
        at.name_cn as away_team_cn,
        p.home_win_prob,
        p.away_win_prob,
        p.predicted_home_score,
        p.predicted_away_score,
        p.predicted_spread,
        p.predicted_total,
        p.confidence,
        p.model_version,
        hr.elo as home_elo,
        ar.elo as away_elo,
        o.bookmaker as odds_book,
        o.home_ml, o.away_ml, o.spread_home, o.total_over
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN predictions p ON g.id = p.game_id
      LEFT JOIN team_ratings hr ON hr.team_id = g.home_team_id AND hr.season = g.season
      LEFT JOIN team_ratings ar ON ar.team_id = g.away_team_id AND ar.season = g.season
      LEFT JOIN odds o ON o.game_id = g.id
      WHERE g.status = 'scheduled' AND g.date BETWEEN ? AND ?
      ORDER BY g.date ASC, g.time ASC
    `).bind(liveStart, windowEnd).all();

    // Get completed games (today and yesterday)
    const completedGames = await db.prepare(`
      SELECT
        g.*,
        ht.full_name as home_team,
        at.full_name as away_team,
        ht.abbreviation as home_abbr,
        at.abbreviation as away_abbr,
        ht.name_cn as home_team_cn,
        at.name_cn as away_team_cn,
        p.home_win_prob,
        p.away_win_prob,
        p.predicted_home_score,
        p.predicted_away_score,
        p.predicted_spread,
        p.predicted_total,
        p.confidence,
        p.model_version,
        hr.elo as home_elo,
        ar.elo as away_elo,
        pr.winner_correct
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN predictions p ON g.id = p.game_id
      LEFT JOIN team_ratings hr ON hr.team_id = g.home_team_id AND hr.season = g.season
      LEFT JOIN team_ratings ar ON ar.team_id = g.away_team_id AND ar.season = g.season
      LEFT JOIN prediction_results pr ON g.id = pr.game_id
      WHERE g.status = 'final' AND g.date >= ?
      ORDER BY g.date DESC, g.time DESC
      LIMIT 30
    `).bind(windowStart).all();

    return Response.json({
      date: today,
      live: liveGames.results || [],
      scheduled: scheduledGames.results || [],
      completed: completedGames.results || [],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching today games:', error);
    return Response.json({ error: 'Failed to fetch today games' }, { status: 500 });
  }
}
