/**
 * Games API Route
 * GET /api/games - Get games with optional filters
 * Query params:
 *   - date: specific date (YYYY-MM-DD)
 *   - status: scheduled | live | final
 *   - limit: number of games to return
 */

import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface Game {
  id: number;
  date: string;
  time: string | null;
  status: string;
  period: number;
  home_team_id: number;
  away_team_id: number;
  home_score: number;
  away_score: number;
  season: number;
  postseason: number;
  // Joined fields
  home_team?: string;
  away_team?: string;
  home_abbr?: string;
  away_abbr?: string;
  // Prediction fields
  home_win_prob?: number;
  away_win_prob?: number;
  predicted_spread?: number;
  predicted_total?: number;
  confidence?: number;
}

export async function GET(request: Request) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = `
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
        p.confidence
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN predictions p ON g.id = p.game_id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (date) {
      query += ` AND g.date = ?`;
      params.push(date);
    }

    if (status) {
      query += ` AND g.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY g.date DESC, g.time ASC LIMIT ?`;
    params.push(limit);

    const result = await db.prepare(query).bind(...params).all();

    return Response.json({
      games: result.results || [],
      total: result.results?.length || 0
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return Response.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
