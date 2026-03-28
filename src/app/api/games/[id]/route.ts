/**
 * Game Detail API Route
 * GET /api/games/[id] - Get a single game with prediction and odds
 */

import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;
    const { id } = await params;

    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      return Response.json({ error: 'Invalid game ID' }, { status: 400 });
    }

    // Fetch game with team info and prediction
    const gameQuery = `
      SELECT
        g.*,
        ht.full_name as home_team,
        at.full_name as away_team,
        ht.abbreviation as home_abbr,
        at.abbreviation as away_abbr,
        ht.name_cn as home_team_cn,
        at.name_cn as away_team_cn,
        p.id as prediction_id,
        p.home_win_prob,
        p.away_win_prob,
        p.predicted_home_score,
        p.predicted_away_score,
        p.predicted_spread,
        p.predicted_total,
        p.confidence,
        p.analysis,
        pr.winner_correct,
        pr.spread_correct,
        pr.total_correct
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      LEFT JOIN predictions p ON g.id = p.game_id
      LEFT JOIN prediction_results pr ON g.id = pr.game_id
      WHERE g.id = ?
    `;

    const gameResult = await db.prepare(gameQuery).bind(gameId).first();

    if (!gameResult) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    // Fetch odds if available
    const oddsQuery = `
      SELECT * FROM odds WHERE game_id = ? ORDER BY updated_at DESC LIMIT 1
    `;
    const oddsResult = await db.prepare(oddsQuery).bind(gameId).first();

    // Structure the response
    const game = {
      id: gameResult.id,
      date: gameResult.date,
      time: gameResult.time,
      status: gameResult.status,
      period: gameResult.period,
      home_team_id: gameResult.home_team_id,
      away_team_id: gameResult.away_team_id,
      home_score: gameResult.home_score,
      away_score: gameResult.away_score,
      season: gameResult.season,
      postseason: gameResult.postseason,
      home_team: gameResult.home_team,
      away_team: gameResult.away_team,
      home_abbr: gameResult.home_abbr,
      away_abbr: gameResult.away_abbr,
      home_team_cn: gameResult.home_team_cn,
      away_team_cn: gameResult.away_team_cn,
      home_win_prob: gameResult.home_win_prob,
      away_win_prob: gameResult.away_win_prob,
      confidence: gameResult.confidence,
      winner_correct: gameResult.winner_correct,
      prediction: gameResult.prediction_id ? {
        id: gameResult.prediction_id,
        home_win_prob: gameResult.home_win_prob,
        away_win_prob: gameResult.away_win_prob,
        predicted_home_score: gameResult.predicted_home_score,
        predicted_away_score: gameResult.predicted_away_score,
        predicted_spread: gameResult.predicted_spread,
        predicted_total: gameResult.predicted_total,
        confidence: gameResult.confidence,
        analysis: gameResult.analysis,
      } : null,
      odds: oddsResult || null,
    };

    return Response.json({ game });
  } catch (error) {
    console.error('Error fetching game:', error);
    return Response.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}
