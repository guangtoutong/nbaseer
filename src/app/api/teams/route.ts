/**
 * Teams API Route
 * GET /api/teams - Get all NBA teams
 *   ?conference=East|West  filter by conference
 *   ?stats=true            include this season's record, scoring and Elo rating
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

    const params: string[] = [];
    let query: string;

    if (withStats) {
      // Records are derived from the games table rather than read from team_stats,
      // which nothing has ever populated. team_ratings supplies the Elo.
      query = `
        WITH played AS (
          SELECT home_team_id AS team_id, season, 1 AS is_home,
                 home_score AS pts, away_score AS opp_pts,
                 CASE WHEN home_score > away_score THEN 1 ELSE 0 END AS won
          FROM games WHERE status = 'final' AND (home_score > 0 OR away_score > 0)
          UNION ALL
          SELECT away_team_id AS team_id, season, 0 AS is_home,
                 away_score AS pts, home_score AS opp_pts,
                 CASE WHEN away_score > home_score THEN 1 ELSE 0 END AS won
          FROM games WHERE status = 'final' AND (home_score > 0 OR away_score > 0)
        ),
        current AS (SELECT MAX(season) AS season FROM games),
        agg AS (
          SELECT team_id,
                 COUNT(*) AS games_played,
                 SUM(won) AS wins,
                 COUNT(*) - SUM(won) AS losses,
                 SUM(CASE WHEN is_home = 1 AND won = 1 THEN 1 ELSE 0 END) AS home_wins,
                 SUM(CASE WHEN is_home = 1 AND won = 0 THEN 1 ELSE 0 END) AS home_losses,
                 SUM(CASE WHEN is_home = 0 AND won = 1 THEN 1 ELSE 0 END) AS away_wins,
                 SUM(CASE WHEN is_home = 0 AND won = 0 THEN 1 ELSE 0 END) AS away_losses,
                 ROUND(AVG(pts), 1) AS pts_per_game,
                 ROUND(AVG(opp_pts), 1) AS opp_pts_per_game
          FROM played WHERE season = (SELECT season FROM current)
          GROUP BY team_id
        )
        SELECT t.*,
               COALESCE(agg.games_played, 0) AS games_played,
               COALESCE(agg.wins, 0) AS wins,
               COALESCE(agg.losses, 0) AS losses,
               agg.home_wins, agg.home_losses, agg.away_wins, agg.away_losses,
               agg.pts_per_game, agg.opp_pts_per_game,
               ROUND(tr.elo, 1) AS elo
        FROM teams t
        LEFT JOIN agg ON agg.team_id = t.id
        LEFT JOIN team_ratings tr
          ON tr.team_id = t.id AND tr.season = (SELECT season FROM current)
        WHERE 1=1
      `;
    } else {
      // The alias matters: the ORDER BY below references it, and without it this
      // endpoint returned 500 for every request that did not ask for stats.
      query = `SELECT t.* FROM teams t WHERE 1=1`;
    }

    if (conference) {
      query += ` AND t.conference = ?`;
      params.push(conference);
    }

    query += withStats ? ` ORDER BY wins DESC, t.full_name ASC` : ` ORDER BY t.full_name ASC`;

    const result = await db.prepare(query).bind(...params).all();

    return Response.json({
      teams: result.results || []
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return Response.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
