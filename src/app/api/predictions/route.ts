/**
 * Predictions API Route
 * GET /api/predictions - Get predictions with results
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
    const gameId = url.searchParams.get('game_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const includeResults = url.searchParams.get('results') === 'true';

    let query: string;
    const params: (string | number)[] = [];

    if (includeResults) {
      // Get predictions with their results (for completed games)
      query = `
        SELECT
          p.*,
          g.date,
          g.status,
          g.home_score as actual_home_score,
          g.away_score as actual_away_score,
          ht.full_name as home_team,
          at.full_name as away_team,
          ht.name_cn as home_team_cn,
          at.name_cn as away_team_cn,
          pr.winner_correct,
          pr.spread_correct,
          pr.total_correct
        FROM predictions p
        JOIN games g ON p.game_id = g.id
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        LEFT JOIN prediction_results pr ON p.game_id = pr.game_id
        WHERE g.status = 'final'
      `;
    } else {
      query = `
        SELECT
          p.*,
          g.date,
          g.time,
          g.status,
          ht.full_name as home_team,
          at.full_name as away_team,
          ht.name_cn as home_team_cn,
          at.name_cn as away_team_cn
        FROM predictions p
        JOIN games g ON p.game_id = g.id
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        WHERE 1=1
      `;
    }

    if (gameId) {
      query += ` AND p.game_id = ?`;
      params.push(parseInt(gameId));
    }

    query += ` ORDER BY g.date DESC LIMIT ?`;
    params.push(limit);

    const result = await db.prepare(query).bind(...params).all();

    return Response.json({
      predictions: result.results || []
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return Response.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}
