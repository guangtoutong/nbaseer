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

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
        p.predicted_spread,
        p.predicted_total,
        p.confidence
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN predictions p ON g.id = p.game_id
      WHERE g.status = 'live'
      ORDER BY g.time ASC
    `).all();

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
        p.predicted_spread,
        p.predicted_total,
        p.confidence
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN predictions p ON g.id = p.game_id
      WHERE g.status = 'scheduled' AND (g.date = ? OR g.date = ?)
      ORDER BY g.date ASC, g.time ASC
    `).bind(today, tomorrow).all();

    // Get today's completed games
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
        p.predicted_spread,
        p.predicted_total,
        p.confidence,
        pr.winner_correct
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN predictions p ON g.id = p.game_id
      LEFT JOIN prediction_results pr ON g.id = pr.game_id
      WHERE g.status = 'final' AND g.date = ?
      ORDER BY g.time DESC
    `).bind(today).all();

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
