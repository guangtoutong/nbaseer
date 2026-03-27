/**
 * Stats API Route
 * GET /api/stats - Get prediction accuracy statistics
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

    // Get overall prediction accuracy
    const overallStats = await db.prepare(`
      SELECT
        COUNT(*) as total_predictions,
        SUM(winner_correct) as correct_winners,
        SUM(spread_correct) as correct_spreads,
        SUM(total_correct) as correct_totals,
        ROUND(AVG(winner_correct) * 100, 1) as winner_accuracy,
        ROUND(AVG(spread_correct) * 100, 1) as spread_accuracy,
        ROUND(AVG(total_correct) * 100, 1) as total_accuracy
      FROM prediction_results
    `).first();

    // Get monthly stats
    const monthlyStats = await db.prepare(`
      SELECT
        strftime('%Y-%m', g.date) as month,
        COUNT(*) as total,
        SUM(pr.winner_correct) as correct,
        ROUND(AVG(pr.winner_correct) * 100, 1) as accuracy
      FROM prediction_results pr
      JOIN games g ON pr.game_id = g.id
      GROUP BY strftime('%Y-%m', g.date)
      ORDER BY month DESC
      LIMIT 12
    `).all();

    // Get recent predictions (last 10)
    const recentPredictions = await db.prepare(`
      SELECT
        g.date,
        ht.name_cn as home_team,
        at.name_cn as away_team,
        p.home_win_prob,
        g.home_score,
        g.away_score,
        pr.winner_correct
      FROM prediction_results pr
      JOIN games g ON pr.game_id = g.id
      JOIN predictions p ON pr.game_id = p.game_id
      JOIN teams ht ON g.home_team_id = ht.id
      JOIN teams at ON g.away_team_id = at.id
      ORDER BY g.date DESC
      LIMIT 10
    `).all();

    // Get game counts by status
    const gameCounts = await db.prepare(`
      SELECT
        status,
        COUNT(*) as count
      FROM games
      GROUP BY status
    `).all();

    return Response.json({
      overall: overallStats || {
        total_predictions: 0,
        correct_winners: 0,
        winner_accuracy: 0,
        spread_accuracy: 0,
        total_accuracy: 0
      },
      monthly: monthlyStats.results || [],
      recent: recentPredictions.results || [],
      games: gameCounts.results || []
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
