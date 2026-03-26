"""
Feature Engineering Module.
Transforms raw data into features for prediction models.
Optimized for cloud database - preloads all data to memory.
"""

from datetime import datetime, timedelta
from typing import Dict, Tuple, List, Optional
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


class FeatureEngineer:
    """Feature engineering for NBA game predictions."""

    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = []
        self._all_games = None  # Cache for all games

    def _load_all_games(self):
        """Load all games into memory once."""
        if self._all_games is not None:
            return self._all_games

        from .database import read_sql

        query = """
            SELECT
                g.game_id,
                g.game_date,
                g.home_team_id,
                g.away_team_id,
                g.home_score,
                g.away_score,
                g.home_win,
                g.point_diff,
                g.total_points
            FROM games g
            WHERE g.home_score IS NOT NULL
            ORDER BY g.game_date
        """
        self._all_games = read_sql(query)

        # Ensure proper types
        if not self._all_games.empty:
            self._all_games['game_date'] = self._all_games['game_date'].astype(str)
            # Ensure numeric columns are numeric
            for col in ['home_team_id', 'away_team_id', 'home_score', 'away_score',
                        'home_win', 'point_diff', 'total_points']:
                if col in self._all_games.columns:
                    self._all_games[col] = pd.to_numeric(self._all_games[col], errors='coerce').fillna(0)

        return self._all_games

    def _get_team_games_before_date(self, team_id: int, as_of_date: str) -> pd.DataFrame:
        """Get all games for a team before a specific date from cached data."""
        all_games = self._load_all_games()

        # Filter games for this team before the date
        mask = (
            ((all_games['home_team_id'] == team_id) | (all_games['away_team_id'] == team_id)) &
            (all_games['game_date'] < as_of_date)
        )
        team_games = all_games[mask].copy()

        if team_games.empty:
            return team_games

        # Add computed columns
        team_games['location'] = team_games.apply(
            lambda x: 'home' if x['home_team_id'] == team_id else 'away', axis=1
        )
        team_games['team_score'] = team_games.apply(
            lambda x: x['home_score'] if x['home_team_id'] == team_id else x['away_score'], axis=1
        )
        team_games['opp_score'] = team_games.apply(
            lambda x: x['away_score'] if x['home_team_id'] == team_id else x['home_score'], axis=1
        )
        team_games['team_win'] = team_games.apply(
            lambda x: x['home_win'] if x['home_team_id'] == team_id else (1 - x['home_win']), axis=1
        )

        # Sort by date descending (most recent first)
        team_games = team_games.sort_values('game_date', ascending=False)

        return team_games

    def _calculate_rest_days_from_cache(self, team_id: int, as_of_date: str) -> int:
        """Calculate rest days from cached data."""
        all_games = self._load_all_games()

        # Find last game before this date
        mask = (
            ((all_games['home_team_id'] == team_id) | (all_games['away_team_id'] == team_id)) &
            (all_games['game_date'] < as_of_date)
        )
        team_games = all_games[mask]

        if team_games.empty:
            return 7  # Default

        last_game_date = team_games['game_date'].max()

        try:
            last_game = datetime.strptime(str(last_game_date)[:10], '%Y-%m-%d')
            current_game = datetime.strptime(str(as_of_date)[:10], '%Y-%m-%d')
            return (current_game - last_game).days
        except:
            return 2  # Default

    def calculate_team_features(self, team_id: int, as_of_date: str) -> Dict:
        """
        Calculate features for a single team as of a specific date.
        Uses cached data for performance.
        """
        games = self._get_team_games_before_date(team_id, as_of_date)

        if games.empty:
            return self._default_team_features()

        features = {}

        def safe_float(val, default=0.0):
            try:
                if val is None or (isinstance(val, float) and np.isnan(val)):
                    return default
                return float(val)
            except:
                return default

        # Overall record
        total_games = len(games)
        total_wins = safe_float(games['team_win'].sum(), 0)
        features['win_pct'] = safe_float(total_wins / total_games if total_games > 0 else 0.5)

        # Home/Away splits
        home_games = games[games['location'] == 'home']
        away_games = games[games['location'] == 'away']

        features['home_win_pct'] = safe_float(
            home_games['team_win'].mean() if len(home_games) > 0 else 0.5, 0.5
        )
        features['away_win_pct'] = safe_float(
            away_games['team_win'].mean() if len(away_games) > 0 else 0.5, 0.5
        )

        # Recent form (last 5, 10 games)
        last_5 = games.head(5)
        last_10 = games.head(10)

        features['last_5_win_pct'] = safe_float(
            last_5['team_win'].mean() if len(last_5) > 0 else 0.5, 0.5
        )
        features['last_10_win_pct'] = safe_float(
            last_10['team_win'].mean() if len(last_10) > 0 else 0.5, 0.5
        )

        # Streak calculation
        features['current_streak'] = safe_float(self._calculate_streak(games), 0)

        # Scoring metrics
        features['pts_per_game'] = safe_float(games['team_score'].mean(), 110)
        features['opp_pts_per_game'] = safe_float(games['opp_score'].mean(), 110)
        features['point_diff_avg'] = safe_float(features['pts_per_game'] - features['opp_pts_per_game'], 0)

        # Recent scoring (last 5 games)
        features['last_5_pts'] = safe_float(last_5['team_score'].mean() if len(last_5) > 0 else features['pts_per_game'], 110)
        features['last_5_opp_pts'] = safe_float(last_5['opp_score'].mean() if len(last_5) > 0 else features['opp_pts_per_game'], 110)

        # Scoring consistency
        features['pts_std'] = safe_float(games['team_score'].std() if len(games) > 1 else 10, 10)
        features['opp_pts_std'] = safe_float(games['opp_score'].std() if len(games) > 1 else 10, 10)

        # Total points tendency
        total_pts = games['team_score'] + games['opp_score']
        features['total_pts_avg'] = safe_float(total_pts.mean(), 220)

        # Rest days (from cache)
        rest_days = self._calculate_rest_days_from_cache(team_id, as_of_date)
        features['rest_days'] = float(rest_days)
        features['is_b2b'] = 1.0 if rest_days == 1 else 0.0

        return features

    def _calculate_streak(self, games: pd.DataFrame) -> float:
        """Calculate current win/loss streak. Positive = wins, negative = losses."""
        if games.empty or 'team_win' not in games.columns:
            return 0.0

        streak = 0
        try:
            # Get the team_win values as a list
            wins = games['team_win'].tolist()
            if not wins:
                return 0.0

            first_result = 1 if float(wins[0]) > 0.5 else 0

            for win_val in wins:
                current_result = 1 if float(win_val) > 0.5 else 0
                if current_result == first_result:
                    streak += 1
                else:
                    break

            return float(streak) if first_result == 1 else float(-streak)
        except Exception:
            return 0.0

    def _default_team_features(self) -> Dict:
        """Return default features when no historical data available."""
        return {
            'win_pct': 0.5,
            'home_win_pct': 0.5,
            'away_win_pct': 0.5,
            'last_5_win_pct': 0.5,
            'last_10_win_pct': 0.5,
            'current_streak': 0.0,
            'pts_per_game': 110.0,
            'opp_pts_per_game': 110.0,
            'point_diff_avg': 0.0,
            'last_5_pts': 110.0,
            'last_5_opp_pts': 110.0,
            'pts_std': 10.0,
            'opp_pts_std': 10.0,
            'total_pts_avg': 220.0,
            'rest_days': 2.0,
            'is_b2b': 0.0
        }

    def calculate_matchup_features(
        self,
        home_team_id: int,
        away_team_id: int,
        as_of_date: str
    ) -> Dict:
        """Calculate head-to-head features for a matchup using cached data."""
        all_games = self._load_all_games()

        # Get historical matchups
        mask = (
            (
                ((all_games['home_team_id'] == home_team_id) & (all_games['away_team_id'] == away_team_id)) |
                ((all_games['home_team_id'] == away_team_id) & (all_games['away_team_id'] == home_team_id))
            ) &
            (all_games['game_date'] < as_of_date)
        )
        h2h = all_games[mask].copy()
        h2h = h2h.sort_values('game_date', ascending=False).head(10)

        features = {}

        def safe_float(val, default=0.0):
            try:
                if val is None or (isinstance(val, float) and np.isnan(val)):
                    return default
                return float(val)
            except:
                return default

        if h2h.empty:
            features['h2h_games'] = 0.0
            features['h2h_home_win_pct'] = 0.5
            features['h2h_avg_spread'] = 0.0
            features['h2h_avg_total'] = 220.0
        else:
            features['h2h_games'] = float(len(h2h))

            # Add is_home column
            h2h['is_home'] = (h2h['home_team_id'] == home_team_id).astype(int)

            # Home team's win rate in head-to-head
            home_wins = safe_float(h2h[h2h['is_home'] == 1]['home_win'].sum(), 0)
            away_wins = float(len(h2h[h2h['is_home'] == 0])) - safe_float(h2h[h2h['is_home'] == 0]['home_win'].sum(), 0)
            total_home_team_wins = home_wins + away_wins

            features['h2h_home_win_pct'] = safe_float(total_home_team_wins / len(h2h), 0.5)

            # Average point differential (from home team perspective)
            h2h['adjusted_diff'] = h2h.apply(
                lambda x: safe_float(x['point_diff'], 0) if x['is_home'] == 1 else -safe_float(x['point_diff'], 0),
                axis=1
            )
            features['h2h_avg_spread'] = safe_float(h2h['adjusted_diff'].mean(), 0)
            features['h2h_avg_total'] = safe_float(h2h['total_points'].mean(), 220)

        return features

    def prepare_game_features(
        self,
        home_team_id: int,
        away_team_id: int,
        game_date: str
    ) -> np.ndarray:
        """Prepare all features for a single game prediction."""
        # Ensure date is string
        game_date = str(game_date)[:10]

        # Get team features
        home_features = self.calculate_team_features(home_team_id, game_date)
        away_features = self.calculate_team_features(away_team_id, game_date)

        # Get matchup features
        matchup_features = self.calculate_matchup_features(
            home_team_id, away_team_id, game_date
        )

        # Combine features
        combined = {}

        # Home team features (prefix with 'home_')
        for key, value in home_features.items():
            combined[f'home_{key}'] = value

        # Away team features (prefix with 'away_')
        for key, value in away_features.items():
            combined[f'away_{key}'] = value

        # Differential features (home - away)
        combined['diff_win_pct'] = home_features['win_pct'] - away_features['win_pct']
        combined['diff_pts'] = home_features['pts_per_game'] - away_features['pts_per_game']
        combined['diff_opp_pts'] = home_features['opp_pts_per_game'] - away_features['opp_pts_per_game']
        combined['diff_recent_form'] = home_features['last_5_win_pct'] - away_features['last_5_win_pct']
        combined['diff_streak'] = home_features['current_streak'] - away_features['current_streak']
        combined['diff_rest'] = home_features['rest_days'] - away_features['rest_days']

        # Matchup features
        for key, value in matchup_features.items():
            combined[key] = value

        # Store feature names
        self.feature_names = list(combined.keys())

        # Ensure all values are float (fix XGBoost String-8 error)
        values = []
        for v in combined.values():
            try:
                values.append(float(v) if v is not None else 0.0)
            except (TypeError, ValueError):
                values.append(0.0)

        return np.array(values, dtype=np.float32).reshape(1, -1)

    def prepare_training_data(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        min_games: int = 10
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Prepare training data from historical games.
        Optimized: loads all data once, then processes in memory.
        """
        print("Loading all games into memory...")
        all_games = self._load_all_games()

        if all_games.empty:
            print("No games found in database!")
            return np.array([]), np.array([]), np.array([]), np.array([])

        print(f"Loaded {len(all_games)} games into memory.")

        # Filter by date if specified
        games = all_games.copy()
        if start_date:
            games = games[games['game_date'] >= start_date]
        if end_date:
            games = games[games['game_date'] <= end_date]

        if games.empty:
            print("No games in specified date range!")
            return np.array([]), np.array([]), np.array([]), np.array([])

        X_list = []
        y_win_list = []
        y_spread_list = []
        y_total_list = []

        total_games = len(games)
        print(f"Processing {total_games} games for training data...")

        for i, (idx, row) in enumerate(games.iterrows()):
            if i % 500 == 0:
                print(f"  Processing game {i+1}/{total_games} ({100*i//total_games}%)...")

            try:
                features = self.prepare_game_features(
                    int(row['home_team_id']),
                    int(row['away_team_id']),
                    str(row['game_date'])
                )

                X_list.append(features.flatten())
                # Ensure proper type conversion
                y_win_list.append(1 if float(row['home_win']) > 0.5 else 0)
                y_spread_list.append(float(row['point_diff']) if row['point_diff'] is not None else 0.0)
                y_total_list.append(float(row['total_points']) if row['total_points'] is not None else 0.0)

            except Exception as e:
                print(f"  Error processing game {row.get('game_id', idx)}: {e}")
                continue

        if not X_list:
            print("No valid training samples generated!")
            return np.array([]), np.array([]), np.array([]), np.array([])

        # Ensure proper float types for XGBoost
        X = np.array(X_list, dtype=np.float32)
        y_win = np.array(y_win_list, dtype=np.int32)
        y_spread = np.array(y_spread_list, dtype=np.float32)
        y_total = np.array(y_total_list, dtype=np.float32)

        print(f"Prepared {len(X)} samples with {X.shape[1]} features each.")

        return X, y_win, y_spread, y_total

    def fit_scaler(self, X: np.ndarray) -> np.ndarray:
        """Fit the scaler and transform features."""
        return self.scaler.fit_transform(X)

    def transform(self, X: np.ndarray) -> np.ndarray:
        """Transform features using fitted scaler."""
        return self.scaler.transform(X)

    def get_feature_importance_df(
        self,
        importances: np.ndarray
    ) -> pd.DataFrame:
        """Create a DataFrame of feature importances."""
        df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': importances
        })
        return df.sort_values('importance', ascending=False)


def get_training_data(
    seasons: Optional[List[str]] = None,
    progress_callback=None
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Convenience function to get training data."""
    engineer = FeatureEngineer()

    if progress_callback:
        progress_callback("Preparing training features...")

    X, y_win, y_spread, y_total = engineer.prepare_training_data()

    return X, y_win, y_spread, y_total, engineer


if __name__ == "__main__":
    # Test feature engineering
    print("Testing feature engineering...")

    engineer = FeatureEngineer()

    # Test with sample team IDs (Lakers=1610612747, Warriors=1610612744)
    features = engineer.prepare_game_features(
        home_team_id=1610612747,
        away_team_id=1610612744,
        game_date='2024-03-01'
    )

    print(f"\nGenerated {features.shape[1]} features")
    print(f"Feature names: {engineer.feature_names[:10]}...")
