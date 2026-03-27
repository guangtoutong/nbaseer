/**
 * Teams API Route
 * GET /api/teams - Get all NBA teams with stats
 */

import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    const url = new URL(request.url);
    const conference = url.searchParams.get('conference');
    const withStats = url.searchParams.get('stats') === 'true';

    let query: string;
    const params: string[] = [];

    if (withStats) {
      query = `
        SELECT
          t.*,
          ts.games_played,
          ts.wins,
          ts.losses,
          ts.home_wins,
          ts.home_losses,
          ts.away_wins,
          ts.away_losses,
          ts.pts_per_game,
          ts.opp_pts_per_game,
          ts.last_10_wins,
          ts.streak
        FROM teams t
        LEFT JOIN team_stats ts ON t.id = ts.team_id
        WHERE 1=1
      `;
    } else {
      query = `SELECT * FROM teams WHERE 1=1`;
    }

    if (conference) {
      query += ` AND t.conference = ?`;
      params.push(conference);
    }

    query += ` ORDER BY t.full_name ASC`;

    const result = await db.prepare(query).bind(...params).all();

    return Response.json({
      teams: result.results || []
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return Response.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
