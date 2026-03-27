/**
 * Shared TypeScript types for NBA Predictor
 */

export interface Team {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  full_name: string;
  name_cn: string;
  conference: string;
  division: string;
}

export interface TeamStats {
  team_id: number;
  season: number;
  games_played: number;
  wins: number;
  losses: number;
  home_wins: number;
  home_losses: number;
  away_wins: number;
  away_losses: number;
  pts_per_game: number;
  opp_pts_per_game: number;
  last_10_wins: number;
  streak: number;
}

export interface Game {
  id: number;
  date: string;
  time: string | null;
  status: 'scheduled' | 'live' | 'final';
  period: number;
  time_remaining?: string;
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
  home_team_cn?: string;
  away_team_cn?: string;
  // Prediction fields
  home_win_prob?: number;
  away_win_prob?: number;
  predicted_spread?: number;
  predicted_total?: number;
  confidence?: number;
  winner_correct?: number;
}

export interface Prediction {
  id: number;
  game_id: number;
  home_win_prob: number;
  away_win_prob: number;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_spread: number;
  predicted_total: number;
  confidence: number;
  analysis?: string;
  created_at: string;
}

export interface PredictionResult {
  id: number;
  game_id: number;
  predicted_winner_id: number;
  actual_winner_id: number;
  predicted_spread: number;
  actual_spread: number;
  predicted_total: number;
  actual_total: number;
  winner_correct: number;
  spread_correct: number;
  total_correct: number;
}

export interface Odds {
  id: number;
  game_id: number;
  bookmaker: string;
  home_ml: number;
  away_ml: number;
  spread_home: number;
  spread_home_price: number;
  spread_away: number;
  spread_away_price: number;
  total_over: number;
  total_over_price: number;
  total_under: number;
  total_under_price: number;
  updated_at: string;
}

export interface OverallStats {
  total_predictions: number;
  correct_winners: number;
  correct_spreads: number;
  correct_totals: number;
  winner_accuracy: number;
  spread_accuracy: number;
  total_accuracy: number;
}

export interface MonthlyStats {
  month: string;
  total: number;
  correct: number;
  accuracy: number;
}

// API Response types
export interface GamesResponse {
  games: Game[];
  total: number;
}

export interface TodayResponse {
  date: string;
  live: Game[];
  scheduled: Game[];
  completed: Game[];
  lastUpdated: string;
}

export interface TeamsResponse {
  teams: (Team & Partial<TeamStats>)[];
}

export interface StatsResponse {
  overall: OverallStats;
  monthly: MonthlyStats[];
  recent: any[];
  games: { status: string; count: number }[];
}

export interface PredictionsResponse {
  predictions: (Prediction & {
    date: string;
    home_team: string;
    away_team: string;
    home_team_cn: string;
    away_team_cn: string;
  })[];
}
