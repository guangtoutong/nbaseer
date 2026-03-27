/**
 * NBA Data Worker
 * Fetches game data from balldontlie.io and odds from the-odds-api.com
 * Runs on a schedule (every 30 minutes)
 */

export interface Env {
  DB: D1Database;
  ODDS_API_KEY: string;
}

// Team ID mapping from balldontlie to our DB
const TEAM_MAPPING: Record<string, number> = {
  'ATL': 1, 'BOS': 2, 'BKN': 3, 'CHA': 4, 'CHI': 5,
  'CLE': 6, 'DAL': 7, 'DEN': 8, 'DET': 9, 'GSW': 10,
  'HOU': 11, 'IND': 12, 'LAC': 13, 'LAL': 14, 'MEM': 15,
  'MIA': 16, 'MIL': 17, 'MIN': 18, 'NOP': 19, 'NYK': 20,
  'OKC': 21, 'ORL': 22, 'PHI': 23, 'PHX': 24, 'POR': 25,
  'SAC': 26, 'SAS': 27, 'TOR': 28, 'UTA': 29, 'WAS': 30,
};

// Fetch games from balldontlie.io
async function fetchGames(date: string): Promise<any[]> {
  const url = `https://api.balldontlie.io/v1/games?dates[]=${date}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'null' // balldontlie v1 is free
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch games: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

// Fetch odds from the-odds-api.com
async function fetchOdds(apiKey: string): Promise<any[]> {
  if (!apiKey) {
    console.log('No ODDS_API_KEY configured');
    return [];
  }

  const url = `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch odds: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching odds:', error);
    return [];
  }
}

// Convert balldontlie game status to our status
function mapGameStatus(status: string, period: number): string {
  if (status === 'Final') return 'final';
  if (period > 0) return 'live';
  return 'scheduled';
}

// Get team ID from abbreviation
function getTeamId(abbreviation: string): number | null {
  return TEAM_MAPPING[abbreviation] || null;
}

// Update games in database
async function updateGames(db: D1Database, games: any[]): Promise<void> {
  for (const game of games) {
    const homeTeamId = getTeamId(game.home_team?.abbreviation);
    const awayTeamId = getTeamId(game.visitor_team?.abbreviation);

    if (!homeTeamId || !awayTeamId) {
      console.log(`Unknown team: ${game.home_team?.abbreviation} or ${game.visitor_team?.abbreviation}`);
      continue;
    }

    const status = mapGameStatus(game.status, game.period);
    const gameDate = game.date?.split('T')[0];
    const gameTime = game.status === 'Final' ? null : game.time;

    try {
      await db.prepare(`
        INSERT INTO games (id, date, time, status, period, home_team_id, away_team_id, home_score, away_score, season, postseason, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          period = excluded.period,
          home_score = excluded.home_score,
          away_score = excluded.away_score,
          updated_at = CURRENT_TIMESTAMP
      `).bind(
        game.id,
        gameDate,
        gameTime,
        status,
        game.period || 0,
        homeTeamId,
        awayTeamId,
        game.home_team_score || 0,
        game.visitor_team_score || 0,
        game.season,
        game.postseason ? 1 : 0
      ).run();
    } catch (error) {
      console.error(`Error updating game ${game.id}:`, error);
    }
  }
}

// Generate simple prediction based on team stats
async function generatePredictions(db: D1Database): Promise<void> {
  // Get games that need predictions (scheduled games without predictions)
  const games = await db.prepare(`
    SELECT g.id, g.home_team_id, g.away_team_id
    FROM games g
    LEFT JOIN predictions p ON g.id = p.game_id
    WHERE g.status = 'scheduled' AND p.id IS NULL
  `).all();

  for (const game of games.results || []) {
    // Get team stats
    const homeStats = await db.prepare(`
      SELECT * FROM team_stats WHERE team_id = ? ORDER BY season DESC LIMIT 1
    `).bind(game.home_team_id).first();

    const awayStats = await db.prepare(`
      SELECT * FROM team_stats WHERE team_id = ? ORDER BY season DESC LIMIT 1
    `).bind(game.away_team_id).first();

    // Simple prediction model
    let homeWinProb = 0.5;
    let predictedHomeScore = 110;
    let predictedAwayScore = 108;

    if (homeStats && awayStats) {
      // Home court advantage + win percentage difference
      const homeWinPct = homeStats.wins / Math.max(homeStats.games_played, 1);
      const awayWinPct = awayStats.wins / Math.max(awayStats.games_played, 1);

      homeWinProb = 0.5 + (homeWinPct - awayWinPct) * 0.5 + 0.03; // 3% home advantage
      homeWinProb = Math.max(0.1, Math.min(0.9, homeWinProb)); // Clamp between 10% and 90%

      predictedHomeScore = Math.round((homeStats.pts_per_game || 110) * 0.6 + (awayStats.opp_pts_per_game || 110) * 0.4);
      predictedAwayScore = Math.round((awayStats.pts_per_game || 108) * 0.6 + (homeStats.opp_pts_per_game || 108) * 0.4);
    }

    const predictedSpread = predictedAwayScore - predictedHomeScore;
    const predictedTotal = predictedHomeScore + predictedAwayScore;
    const confidence = Math.abs(homeWinProb - 0.5) * 2; // Higher when more certain

    try {
      await db.prepare(`
        INSERT INTO predictions (game_id, home_win_prob, away_win_prob, predicted_home_score, predicted_away_score, predicted_spread, predicted_total, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        game.id,
        homeWinProb,
        1 - homeWinProb,
        predictedHomeScore,
        predictedAwayScore,
        predictedSpread,
        predictedTotal,
        confidence
      ).run();
    } catch (error) {
      console.error(`Error creating prediction for game ${game.id}:`, error);
    }
  }
}

// Update team stats from game results
async function updateTeamStats(db: D1Database): Promise<void> {
  const currentYear = new Date().getFullYear();
  const season = new Date().getMonth() >= 9 ? currentYear : currentYear - 1; // NBA season starts in October

  // Get all completed games for the season
  const stats = await db.prepare(`
    SELECT
      team_id,
      COUNT(*) as games_played,
      SUM(CASE WHEN won = 1 THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN won = 0 THEN 1 ELSE 0 END) as losses,
      SUM(CASE WHEN is_home = 1 AND won = 1 THEN 1 ELSE 0 END) as home_wins,
      SUM(CASE WHEN is_home = 1 AND won = 0 THEN 1 ELSE 0 END) as home_losses,
      SUM(CASE WHEN is_home = 0 AND won = 1 THEN 1 ELSE 0 END) as away_wins,
      SUM(CASE WHEN is_home = 0 AND won = 0 THEN 1 ELSE 0 END) as away_losses,
      AVG(pts) as pts_per_game,
      AVG(opp_pts) as opp_pts_per_game
    FROM (
      SELECT
        home_team_id as team_id,
        1 as is_home,
        home_score as pts,
        away_score as opp_pts,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END as won
      FROM games WHERE status = 'final' AND season = ?
      UNION ALL
      SELECT
        away_team_id as team_id,
        0 as is_home,
        away_score as pts,
        home_score as opp_pts,
        CASE WHEN away_score > home_score THEN 1 ELSE 0 END as won
      FROM games WHERE status = 'final' AND season = ?
    )
    GROUP BY team_id
  `).bind(season, season).all();

  for (const stat of stats.results || []) {
    try {
      await db.prepare(`
        INSERT INTO team_stats (team_id, season, games_played, wins, losses, home_wins, home_losses, away_wins, away_losses, pts_per_game, opp_pts_per_game, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(team_id, season) DO UPDATE SET
          games_played = excluded.games_played,
          wins = excluded.wins,
          losses = excluded.losses,
          home_wins = excluded.home_wins,
          home_losses = excluded.home_losses,
          away_wins = excluded.away_wins,
          away_losses = excluded.away_losses,
          pts_per_game = excluded.pts_per_game,
          opp_pts_per_game = excluded.opp_pts_per_game,
          updated_at = CURRENT_TIMESTAMP
      `).bind(
        stat.team_id,
        season,
        stat.games_played,
        stat.wins,
        stat.losses,
        stat.home_wins,
        stat.home_losses,
        stat.away_wins,
        stat.away_losses,
        stat.pts_per_game,
        stat.opp_pts_per_game
      ).run();
    } catch (error) {
      console.error(`Error updating stats for team ${stat.team_id}:`, error);
    }
  }
}

// Scheduled handler - runs every 30 minutes
export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Starting scheduled data update...');

    // Get dates to fetch (yesterday, today, tomorrow)
    const today = new Date();
    const dates = [
      new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      today.toISOString().split('T')[0],
      new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ];

    // Fetch and update games for each date
    for (const date of dates) {
      console.log(`Fetching games for ${date}...`);
      const games = await fetchGames(date);
      console.log(`Found ${games.length} games`);
      await updateGames(env.DB, games);
    }

    // Update team stats
    console.log('Updating team stats...');
    await updateTeamStats(env.DB);

    // Generate predictions for new games
    console.log('Generating predictions...');
    await generatePredictions(env.DB);

    // Fetch odds (optional, requires API key)
    if (env.ODDS_API_KEY) {
      console.log('Fetching odds...');
      const odds = await fetchOdds(env.ODDS_API_KEY);
      console.log(`Found odds for ${odds.length} games`);
      // TODO: Match odds to games and store
    }

    console.log('Data update complete!');
  },

  // HTTP handler for manual triggers
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/update') {
      // Trigger manual update
      ctx.waitUntil(this.scheduled({} as ScheduledController, env, ctx));
      return new Response(JSON.stringify({ status: 'Update started' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('NBA Data Worker', { status: 200 });
  }
};
