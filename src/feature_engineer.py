"""
Feature Engineering Module.
Transforms raw data into features for prediction models.
"""

from datetime import datetime, timedelta
from typing import Dict, Tuple, List, Optional
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

from .utils import get_db_connection, calculate_rest_days, is_back_to_back


class FeatureEngineer:
    """Feature engineering for NBA game predictions."""

    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = []

    def calculate_team_features(self, team_id: int, as_of_date: str) -> Dict:
        """
        Calculate features for a single team as of a specific date.

        Args:
            team_id: NBA team ID
            as_of_date: Date string 'YYYY-MM-DD'

        Returns:
            Dictionary with team features
        """
        conn = get_db_connection()

        # Get all games before this date for the team
        query = """
            SELECT
                g.*,
                CASE WHEN g.home_team_id = ? THEN 'home' ELSE 'away' END as location,
                CASE WHEN g.home_team_id = ? THEN g.home_score ELSE g.away_score END as team_score,
                CASE WHEN g.home_team_id = ? THEN g.away_score ELSE g.home_score END as opp_score,
                CASE WHEN g.home_team_id = ? THEN g.home_win ELSE (1 - g.home_win) END as team_win
            FROM games g
            WHERE (g.home_team_id = ? OR g.away_team_id = ?)
            AND g.game_date < ?
            ORDER BY g.game_date DESC
        """

        games = pd.read_sql(query, conn, params=(
            team_id, team_id, team_id, team_id, team_id, team_id, as_of_date
        ))
        conn.close()

        if games.empty:
            return self._default_team_features()

        features = {}

        # Helper function to safely convert to float
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
        games['total_pts'] = games['team_score'] + games['opp_score']
        features['total_pts_avg'] = safe_float(games['total_pts'].mean(), 220)

        # Rest days
        features['rest_days'] = safe_float(calculate_rest_days(team_id, as_of_date), 2)
        features['is_b2b'] = 1.0 if is_back_to_back(team_id, as_of_date) else 0.0

        return features

    def _calculate_streak(self, games: pd.DataFrame) -> float:
        """Calculate current win/loss streak. Positive = wins, negative = losses."""
        if games.empty:
            return 0.0

        streak = 0
        try:
            first_result = int(games.iloc[0]['team_win'])
        except:
            return 0.0

        for _, game in games.iterrows():
            try:
                if int(game['team_win']) == first_result:
                    streak += 1
                else:
                    break
            except:
                break

        return float(streak) if first_result == 1 else float(-streak)

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
        """
        Calculate head-to-head features for a matchup.

        Args:
            home_team_id: Home team ID
            away_team_id: Away team ID
            as_of_date: Date string 'YYYY-MM-DD'

        Returns:
            Dictionary with matchup features
        """
        conn = get_db_connection()

        # Get historical matchups
        query = """
            SELECT
                g.*,
                CASE WHEN g.home_team_id = ? THEN 1 ELSE 0 END as is_home
            FROM games g
            WHERE ((g.home_team_id = ? AND g.away_team_id = ?)
                   OR (g.home_team_id = ? AND g.away_team_id = ?))
            AND g.game_date < ?
            ORDER BY g.game_date DESC
            LIMIT 10
        """

        h2h = pd.read_sql(query, conn, params=(
            home_team_id, home_team_id, away_team_id,
            away_team_id, home_team_id, as_of_date
        ))
        conn.close()

        features = {}

        # Helper function to safely convert to float
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
        """
        Prepare all features for a single game prediction.

        Args:
            home_team_id: Home team ID
            away_team_id: Away team ID
            game_date: Game date string 'YYYY-MM-DD'

        Returns:
            NumPy array of features
        """
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

        Args:
            start_date: Start date for training data
            end_date: End date for training data
            min_games: Minimum games each team should have played

        Returns:
            Tuple of (X, y_win, y_spread, y_total)
        """
        conn = get_db_connection()

        # Get historical games
        query = """
            SELECT
                g.game_id,
                g.game_date,
                g.home_team_id,
                g.away_team_id,
                g.home_win,
                g.point_diff,
                g.total_points
            FROM games g
            WHERE g.home_score IS NOT NULL
        """

        params = []
        if start_date:
            query += " AND g.game_date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND g.game_date <= ?"
            params.append(end_date)

        query += " ORDER BY g.game_date"

        games = pd.read_sql(query, conn, params=params)
        conn.close()

        if games.empty:
            return np.array([]), np.array([]), np.array([]), np.array([])

        X_list = []
        y_win_list = []
        y_spread_list = []
        y_total_list = []

        print(f"Processing {len(games)} games for training data...")

        for i, row in games.iterrows():
            if i % 100 == 0:
                print(f"  Processing game {i+1}/{len(games)}...")

            try:
                features = self.prepare_game_features(
                    row['home_team_id'],
                    row['away_team_id'],
                    row['game_date']
                )

                X_list.append(features.flatten())
                y_win_list.append(row['home_win'])
                y_spread_list.append(row['point_diff'])
                y_total_list.append(row['total_points'])

            except Exception as e:
                print(f"  Error processing game {row['game_id']}: {e}")
                continue

        if not X_list:
            return np.array([]), np.array([]), np.array([]), np.array([])

        # Ensure proper float types for XGBoost
        X = np.array(X_list, dtype=np.float32)
        y_win = np.array(y_win_list, dtype=np.int32)
        y_spread = np.array(y_spread_list, dtype=np.float32)
        y_total = np.array(y_total_list, dtype=np.float32)

        print(f"Prepared {len(X)} samples with {X.shape[1]} features each.")

        return X, y_win, y_spread, y_total

    def fit_scaler(self, X: np.ndarray) -> np.ndarray:
        """
        Fit the scaler and transform features.

        Args:
            X: Feature matrix

        Returns:
            Scaled feature matrix
        """
        return self.scaler.fit_transform(X)

    def transform(self, X: np.ndarray) -> np.ndarray:
        """
        Transform features using fitted scaler.

        Args:
            X: Feature matrix

        Returns:
            Scaled feature matrix
        """
        return self.scaler.transform(X)

    def get_feature_importance_df(
        self,
        importances: np.ndarray
    ) -> pd.DataFrame:
        """
        Create a DataFrame of feature importances.

        Args:
            importances: Array of feature importances

        Returns:
            DataFrame sorted by importance
        """
        df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': importances
        })
        return df.sort_values('importance', ascending=False)


def get_training_data(
    seasons: Optional[List[str]] = None,
    progress_callback=None
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Convenience function to get training data.

    Args:
        seasons: List of seasons to include
        progress_callback: Optional callback for progress updates

    Returns:
        Tuple of (X, y_win, y_spread, y_total)
    """
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
