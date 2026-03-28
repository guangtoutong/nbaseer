/**
 * NBA Data Worker
 * Fetches game data and odds, generates predictions
 * Uses odds data as primary prediction source (most accurate)
 */

export interface Env {
  DB: D1Database;
  ODDS_API_KEY: string;
  BALLDONTLIE_API_KEY?: string;
}

// Team ID mapping
const TEAM_MAPPING: Record<string, number> = {
  'ATL': 1, 'BOS': 2, 'BKN': 3, 'CHA': 4, 'CHI': 5,
  'CLE': 6, 'DAL': 7, 'DEN': 8, 'DET': 9, 'GSW': 10,
  'HOU': 11, 'IND': 12, 'LAC': 13, 'LAL': 14, 'MEM': 15,
  'MIA': 16, 'MIL': 17, 'MIN': 18, 'NOP': 19, 'NYK': 20,
  'OKC': 21, 'ORL': 22, 'PHI': 23, 'PHX': 24, 'POR': 25,
  'SAC': 26, 'SAS': 27, 'TOR': 28, 'UTA': 29, 'WAS': 30,
};

// Team name to abbreviation mapping for odds API
const TEAM_NAME_TO_ABBR: Record<string, string> = {
  'Atlanta Hawks': 'ATL',
  'Boston Celtics': 'BOS',
  'Brooklyn Nets': 'BKN',
  'Charlotte Hornets': 'CHA',
  'Chicago Bulls': 'CHI',
  'Cleveland Cavaliers': 'CLE',
  'Dallas Mavericks': 'DAL',
  'Denver Nuggets': 'DEN',
  'Detroit Pistons': 'DET',
  'Golden State Warriors': 'GSW',
  'Houston Rockets': 'HOU',
  'Indiana Pacers': 'IND',
  'Los Angeles Clippers': 'LAC',
  'Los Angeles Lakers': 'LAL',
  'LA Clippers': 'LAC',
  'LA Lakers': 'LAL',
  'Memphis Grizzlies': 'MEM',
  'Miami Heat': 'MIA',
  'Milwaukee Bucks': 'MIL',
  'Minnesota Timberwolves': 'MIN',
  'New Orleans Pelicans': 'NOP',
  'New York Knicks': 'NYK',
  'Oklahoma City Thunder': 'OKC',
  'Orlando Magic': 'ORL',
  'Philadelphia 76ers': 'PHI',
  'Phoenix Suns': 'PHX',
  'Portland Trail Blazers': 'POR',
  'Sacramento Kings': 'SAC',
  'San Antonio Spurs': 'SAS',
  'Toronto Raptors': 'TOR',
  'Utah Jazz': 'UTA',
  'Washington Wizards': 'WAS',
};

// Convert American odds to implied probability
function americanOddsToProb(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
}

// Convert spread to win probability (rough estimate)
function spreadToWinProb(spread: number): number {
  // Each point of spread is roughly 3% win probability
  // Spread is typically for the favorite, negative means favorite
  const prob = 0.5 - (spread * 0.03);
  return Math.max(0.05, Math.min(0.95, prob));
}

// Fetch games from ESPN API (more reliable than balldontlie)
async function fetchGamesFromESPN(date: string): Promise<any[]> {
  const formattedDate = date.replace(/-/g, '');
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${formattedDate}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`ESPN API error: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching from ESPN:', error);
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
      console.error(`Odds API error: ${response.status}`);
      return [];
    }
    return await response.json() || [];
  } catch (error) {
    console.error('Error fetching odds:', error);
    return [];
  }
}

// Parse ESPN event to our format
function parseESPNEvent(event: any): any {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const homeTeam = competition.competitors?.find((c: any) => c.homeAway === 'home');
  const awayTeam = competition.competitors?.find((c: any) => c.homeAway === 'away');

  if (!homeTeam || !awayTeam) return null;

  const homeAbbr = homeTeam.team?.abbreviation;
  const awayAbbr = awayTeam.team?.abbreviation;

  const statusType = competition.status?.type?.name;
  let status = 'scheduled';
  if (statusType === 'STATUS_FINAL') status = 'final';
  else if (statusType === 'STATUS_IN_PROGRESS' || statusType === 'STATUS_HALFTIME') status = 'live';

  return {
    id: parseInt(event.id),
    date: event.date?.split('T')[0],
    time: status === 'scheduled' ? event.date : (competition.status?.displayClock || null),
    status,
    period: competition.status?.period || 0,
    homeTeamId: TEAM_MAPPING[homeAbbr],
    awayTeamId: TEAM_MAPPING[awayAbbr],
    homeAbbr,
    awayAbbr,
    homeScore: parseInt(homeTeam.score) || 0,
    awayScore: parseInt(awayTeam.score) || 0,
    season: new Date().getMonth() >= 9 ? new Date().getFullYear() + 1 : new Date().getFullYear(),
  };
}

// Update games in database
async function updateGames(db: D1Database, events: any[]): Promise<number> {
  let updated = 0;

  for (const event of events) {
    const game = parseESPNEvent(event);
    if (!game || !game.homeTeamId || !game.awayTeamId) continue;

    try {
      await db.prepare(`
        INSERT INTO games (id, date, time, status, period, home_team_id, away_team_id, home_score, away_score, season, postseason, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          period = excluded.period,
          time = excluded.time,
          home_score = excluded.home_score,
          away_score = excluded.away_score,
          updated_at = datetime('now')
      `).bind(
        game.id,
        game.date,
        game.time,
        game.status,
        game.period,
        game.homeTeamId,
        game.awayTeamId,
        game.homeScore,
        game.awayScore,
        game.season
      ).run();
      updated++;
    } catch (error) {
      console.error(`Error updating game ${game.id}:`, error);
    }
  }

  return updated;
}

// Generate predictions using odds data
async function generatePredictions(db: D1Database, oddsData: any[]): Promise<number> {
  // Create a map of odds by team names
  const oddsMap = new Map<string, any>();
  for (const game of oddsData) {
    const homeTeam = TEAM_NAME_TO_ABBR[game.home_team];
    const awayTeam = TEAM_NAME_TO_ABBR[game.away_team];
    if (homeTeam && awayTeam) {
      oddsMap.set(`${homeTeam}-${awayTeam}`, game);
    }
  }

  // Get scheduled games that need predictions
  const games = await db.prepare(`
    SELECT g.id, g.home_team_id, g.away_team_id,
           h.abbreviation as home_abbr, a.abbreviation as away_abbr
    FROM games g
    JOIN teams h ON g.home_team_id = h.id
    JOIN teams a ON g.away_team_id = a.id
    WHERE g.status = 'scheduled'
  `).all();

  let generated = 0;

  for (const game of games.results || []) {
    const key = `${game.home_abbr}-${game.away_abbr}`;
    const odds = oddsMap.get(key);

    let homeWinProb = 0.5;
    let awayWinProb = 0.5;
    let predictedSpread = 0;
    let predictedTotal = 220;
    let confidence = 0.1;

    if (odds) {
      // Use odds data for prediction
      const bookmaker = odds.bookmakers?.[0];
      if (bookmaker) {
        // Get h2h (moneyline) odds
        const h2hMarket = bookmaker.markets?.find((m: any) => m.key === 'h2h');
        if (h2hMarket) {
          const homeOutcome = h2hMarket.outcomes?.find((o: any) =>
            TEAM_NAME_TO_ABBR[o.name] === game.home_abbr
          );
          const awayOutcome = h2hMarket.outcomes?.find((o: any) =>
            TEAM_NAME_TO_ABBR[o.name] === game.away_abbr
          );

          if (homeOutcome && awayOutcome) {
            const rawHomeProb = americanOddsToProb(homeOutcome.price);
            const rawAwayProb = americanOddsToProb(awayOutcome.price);
            // Normalize to remove vig
            const total = rawHomeProb + rawAwayProb;
            homeWinProb = rawHomeProb / total;
            awayWinProb = rawAwayProb / total;
          }
        }

        // Get spread
        // Spread point is from the team's perspective: +18.5 means underdog, -18.5 means favorite
        // Our predictedSpread = away_score - home_score
        // If home team spread is +18.5 (underdog), they're expected to lose by 18.5
        // So away_score - home_score = +18.5 (no negation needed)
        const spreadsMarket = bookmaker.markets?.find((m: any) => m.key === 'spreads');
        if (spreadsMarket) {
          const homeSpread = spreadsMarket.outcomes?.find((o: any) =>
            TEAM_NAME_TO_ABBR[o.name] === game.home_abbr
          );
          if (homeSpread) {
            predictedSpread = homeSpread.point; // Home +18.5 means away wins by 18.5
          }
        }

        // Get total
        const totalsMarket = bookmaker.markets?.find((m: any) => m.key === 'totals');
        if (totalsMarket) {
          const overOutcome = totalsMarket.outcomes?.find((o: any) => o.name === 'Over');
          if (overOutcome) {
            predictedTotal = overOutcome.point;
          }
        }

        // Higher confidence when we have odds data
        confidence = Math.abs(homeWinProb - 0.5) * 1.5 + 0.3;
        confidence = Math.min(0.95, confidence);
      }
    } else {
      // Fallback: use team stats if no odds
      const homeStats = await db.prepare(`
        SELECT * FROM team_stats WHERE team_id = ? ORDER BY season DESC LIMIT 1
      `).bind(game.home_team_id).first();

      const awayStats = await db.prepare(`
        SELECT * FROM team_stats WHERE team_id = ? ORDER BY season DESC LIMIT 1
      `).bind(game.away_team_id).first();

      if (homeStats && awayStats) {
        const homeWinPct = (homeStats.wins || 0) / Math.max(homeStats.games_played || 1, 1);
        const awayWinPct = (awayStats.wins || 0) / Math.max(awayStats.games_played || 1, 1);

        // Use home/away specific win rates if available
        const homeHomeWinPct = (homeStats.home_wins || 0) / Math.max((homeStats.home_wins || 0) + (homeStats.home_losses || 0), 1);
        const awayAwayWinPct = (awayStats.away_wins || 0) / Math.max((awayStats.away_wins || 0) + (awayStats.away_losses || 0), 1);

        // Weighted combination: overall + home/away specific
        const homeStrength = homeWinPct * 0.4 + homeHomeWinPct * 0.6;
        const awayStrength = awayWinPct * 0.4 + awayAwayWinPct * 0.6;

        homeWinProb = 0.5 + (homeStrength - awayStrength) * 0.8 + 0.03;
        homeWinProb = Math.max(0.15, Math.min(0.85, homeWinProb));
        awayWinProb = 1 - homeWinProb;

        // Predict scores
        const homeAvgPts = homeStats.pts_per_game || 110;
        const awayAvgPts = awayStats.pts_per_game || 110;
        const homeDefense = homeStats.opp_pts_per_game || 110;
        const awayDefense = awayStats.opp_pts_per_game || 110;

        const predictedHomeScore = (homeAvgPts * 0.5 + awayDefense * 0.5);
        const predictedAwayScore = (awayAvgPts * 0.5 + homeDefense * 0.5);

        predictedSpread = predictedAwayScore - predictedHomeScore;
        predictedTotal = predictedHomeScore + predictedAwayScore;
        confidence = 0.3; // Lower confidence without odds
      }
    }

    // Calculate predicted scores from spread and total
    const predictedHomeScore = Math.round((predictedTotal - predictedSpread) / 2);
    const predictedAwayScore = Math.round((predictedTotal + predictedSpread) / 2);

    try {
      await db.prepare(`
        INSERT INTO predictions (game_id, home_win_prob, away_win_prob, predicted_home_score, predicted_away_score, predicted_spread, predicted_total, confidence, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(game_id) DO UPDATE SET
          home_win_prob = excluded.home_win_prob,
          away_win_prob = excluded.away_win_prob,
          predicted_home_score = excluded.predicted_home_score,
          predicted_away_score = excluded.predicted_away_score,
          predicted_spread = excluded.predicted_spread,
          predicted_total = excluded.predicted_total,
          confidence = excluded.confidence,
          updated_at = datetime('now')
      `).bind(
        game.id,
        homeWinProb,
        awayWinProb,
        predictedHomeScore,
        predictedAwayScore,
        predictedSpread,
        predictedTotal,
        confidence
      ).run();
      generated++;
    } catch (error) {
      console.error(`Error creating prediction for game ${game.id}:`, error);
    }
  }

  return generated;
}

// Calculate prediction results for completed games
async function calculateResults(db: D1Database): Promise<number> {
  // Find completed games with predictions but no results
  const games = await db.prepare(`
    SELECT g.id, g.home_score, g.away_score,
           p.home_win_prob, p.predicted_spread, p.predicted_total
    FROM games g
    JOIN predictions p ON g.id = p.game_id
    LEFT JOIN prediction_results pr ON g.id = pr.game_id
    WHERE g.status = 'final'
      AND g.home_score > 0
      AND g.away_score > 0
      AND pr.id IS NULL
  `).all();

  let calculated = 0;

  for (const game of games.results || []) {
    const actualSpread = game.away_score - game.home_score;
    const actualTotal = game.home_score + game.away_score;
    const homeWon = game.home_score > game.away_score;
    const predictedHomeWin = game.home_win_prob > 0.5;

    // Winner correct if we predicted the right team
    const winnerCorrect = (predictedHomeWin === homeWon) ? 1 : 0;

    // Spread correct if we got the direction right
    // If predicted spread < 0 (home favored) and home won by more than spread
    // Or if predicted spread > 0 (away favored) and away won by more than spread
    const spreadCorrect = (
      (game.predicted_spread < 0 && actualSpread < game.predicted_spread) ||
      (game.predicted_spread > 0 && actualSpread > game.predicted_spread) ||
      Math.abs(actualSpread - game.predicted_spread) < 2
    ) ? 1 : 0;

    // Total correct if within 10 points
    const totalCorrect = Math.abs(actualTotal - game.predicted_total) < 10 ? 1 : 0;

    try {
      await db.prepare(`
        INSERT INTO prediction_results (game_id, winner_correct, spread_correct, total_correct, actual_spread, actual_total, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        game.id,
        winnerCorrect,
        spreadCorrect,
        totalCorrect,
        actualSpread,
        actualTotal
      ).run();
      calculated++;
    } catch (error) {
      console.error(`Error calculating results for game ${game.id}:`, error);
    }
  }

  return calculated;
}

// Update team stats from completed games
async function updateTeamStats(db: D1Database): Promise<void> {
  const currentYear = new Date().getFullYear();
  const season = new Date().getMonth() >= 9 ? currentYear + 1 : currentYear;

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
      ROUND(AVG(pts), 1) as pts_per_game,
      ROUND(AVG(opp_pts), 1) as opp_pts_per_game
    FROM (
      SELECT home_team_id as team_id, 1 as is_home, home_score as pts, away_score as opp_pts,
             CASE WHEN home_score > away_score THEN 1 ELSE 0 END as won
      FROM games WHERE status = 'final' AND season = ?
      UNION ALL
      SELECT away_team_id as team_id, 0 as is_home, away_score as pts, home_score as opp_pts,
             CASE WHEN away_score > home_score THEN 1 ELSE 0 END as won
      FROM games WHERE status = 'final' AND season = ?
    )
    GROUP BY team_id
  `).bind(season, season).all();

  for (const stat of stats.results || []) {
    try {
      await db.prepare(`
        INSERT INTO team_stats (team_id, season, games_played, wins, losses, home_wins, home_losses, away_wins, away_losses, pts_per_game, opp_pts_per_game, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
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
          updated_at = datetime('now')
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

// Main scheduled handler
export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('=== Starting NBA Data Update ===');
    const startTime = Date.now();

    // Get dates to fetch
    const today = new Date();
    const dates = [
      new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      today.toISOString().split('T')[0],
      new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ];

    // Fetch games from ESPN
    let totalGames = 0;
    for (const date of dates) {
      console.log(`Fetching games for ${date}...`);
      const events = await fetchGamesFromESPN(date);
      const updated = await updateGames(env.DB, events);
      totalGames += updated;
      console.log(`  Updated ${updated} games`);
    }

    // Fetch odds
    let oddsData: any[] = [];
    if (env.ODDS_API_KEY) {
      console.log('Fetching odds...');
      oddsData = await fetchOdds(env.ODDS_API_KEY);
      console.log(`  Found odds for ${oddsData.length} games`);
    }

    // Generate predictions
    console.log('Generating predictions...');
    const predictions = await generatePredictions(env.DB, oddsData);
    console.log(`  Generated ${predictions} predictions`);

    // Calculate results for completed games
    console.log('Calculating prediction results...');
    const results = await calculateResults(env.DB);
    console.log(`  Calculated ${results} results`);

    // Update team stats
    console.log('Updating team stats...');
    await updateTeamStats(env.DB);

    const elapsed = Date.now() - startTime;
    console.log(`=== Update complete in ${elapsed}ms ===`);
  },

  // HTTP handler
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/sync' || url.pathname === '/update') {
      ctx.waitUntil(this.scheduled({} as ScheduledController, env, ctx));
      return new Response(JSON.stringify({ status: 'Update started', timestamp: new Date().toISOString() }), {
        headers: corsHeaders
      });
    }

    if (url.pathname === '/debug') {
      // Return debug info
      const games = await env.DB.prepare(`
        SELECT g.*, p.home_win_prob, p.predicted_spread, p.confidence,
               pr.winner_correct
        FROM games g
        LEFT JOIN predictions p ON g.id = p.game_id
        LEFT JOIN prediction_results pr ON g.id = pr.game_id
        WHERE g.date >= date('now', '-1 day')
        ORDER BY g.date, g.time
        LIMIT 20
      `).all();

      const stats = await env.DB.prepare(`
        SELECT t.abbr, ts.*
        FROM team_stats ts
        JOIN teams t ON ts.team_id = t.id
        ORDER BY ts.wins DESC
        LIMIT 10
      `).all();

      return new Response(JSON.stringify({
        games: games.results,
        topTeams: stats.results,
        timestamp: new Date().toISOString()
      }, null, 2), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      name: 'NBA Predictor Worker',
      endpoints: ['/sync', '/debug'],
      timestamp: new Date().toISOString()
    }), { headers: corsHeaders });
  }
};
