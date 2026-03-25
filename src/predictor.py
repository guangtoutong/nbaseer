"""
Predictor Interface Module.
High-level interface for making predictions and generating reports.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, List
import pandas as pd
import numpy as np

from .utils import get_db_connection, american_to_implied_prob, get_chinese_name, get_current_season
from .data_collector import get_scheduled_games, fetch_schedule, fetch_game_logs, process_and_store_games
from .feature_engineer import FeatureEngineer
from .models import NBAPredictor, load_predictor
from .odds_collector import get_odds_for_display


class GamePredictor:
    """High-level interface for NBA game predictions."""

    def __init__(self):
        self.model = None
        self.feature_engineer = FeatureEngineer()
        self._load_model()

    def _load_model(self):
        """Load the trained model if available."""
        try:
            self.model = load_predictor()
            self.feature_engineer.feature_names = self.model.feature_names
        except FileNotFoundError:
            print("No trained model found. Please train a model first.")
            self.model = None

    def is_ready(self) -> bool:
        """Check if predictor is ready to make predictions."""
        return self.model is not None

    def predict_game(
        self,
        home_team_id: int,
        away_team_id: int,
        game_date: str
    ) -> Dict:
        """
        Predict outcome of a single game.

        Args:
            home_team_id: Home team ID
            away_team_id: Away team ID
            game_date: Game date 'YYYY-MM-DD'

        Returns:
            Dictionary with predictions
        """
        if not self.is_ready():
            raise RuntimeError("Model not trained. Please train first.")

        # Generate features
        features = self.feature_engineer.prepare_game_features(
            home_team_id, away_team_id, game_date
        )

        # Make prediction
        prediction = self.model.predict_single(features)

        # Add derived values
        prediction['away_win_prob'] = 1 - prediction['home_win_prob']
        prediction['predicted_winner'] = 'home' if prediction['home_win_prob'] > 0.5 else 'away'
        prediction['confidence'] = max(prediction['home_win_prob'], prediction['away_win_prob'])

        return prediction

    def predict_games(self, date: str, refresh_schedule: bool = False) -> pd.DataFrame:
        """
        Predict all games for a given date.

        Args:
            date: Date string 'YYYY-MM-DD'
            refresh_schedule: Whether to fetch fresh schedule

        Returns:
            DataFrame with predictions for all games
        """
        if not self.is_ready():
            raise RuntimeError("Model not trained. Please train first.")

        # Get schedule
        if refresh_schedule:
            fetch_schedule(date)

        games = get_scheduled_games(date)

        if games.empty:
            return pd.DataFrame()

        predictions = []

        for _, game in games.iterrows():
            try:
                pred = self.predict_game(
                    game['home_team_id'],
                    game['away_team_id'],
                    date
                )

                predictions.append({
                    'game_id': game['game_id'],
                    'game_date': date,
                    'home_team': game['home_name'],
                    'home_abbr': game['home_abbr'],
                    'away_team': game['away_name'],
                    'away_abbr': game['away_abbr'],
                    'home_win_prob': pred['home_win_prob'],
                    'away_win_prob': pred['away_win_prob'],
                    'predicted_spread': pred['predicted_spread'],
                    'predicted_total': pred['predicted_total'],
                    'predicted_winner': pred['predicted_winner'],
                    'confidence': pred['confidence']
                })

            except Exception as e:
                print(f"Error predicting game {game['game_id']}: {e}")
                continue

        return pd.DataFrame(predictions)

    def compare_with_odds(self, predictions: pd.DataFrame, date: str) -> pd.DataFrame:
        """
        Compare predictions with betting odds.

        Args:
            predictions: DataFrame with predictions
            date: Date string

        Returns:
            DataFrame with predictions and odds comparison
        """
        odds = get_odds_for_display(date)

        if odds.empty or predictions.empty:
            return predictions

        # Merge predictions with odds
        merged = predictions.merge(
            odds[['game_id', 'home_ml', 'away_ml', 'spread', 'total',
                  'home_implied_prob', 'away_implied_prob']],
            on='game_id',
            how='left'
        )

        # Calculate value indicators
        merged['ml_value'] = None
        merged['spread_value'] = None
        merged['total_value'] = None

        for idx, row in merged.iterrows():
            # Moneyline value
            if pd.notna(row.get('home_implied_prob')):
                if row['home_win_prob'] > row['home_implied_prob'] + 0.03:
                    merged.at[idx, 'ml_value'] = 'home'
                elif row['away_win_prob'] > row['away_implied_prob'] + 0.03:
                    merged.at[idx, 'ml_value'] = 'away'

            # Spread value
            if pd.notna(row.get('spread')):
                spread_diff = row['predicted_spread'] - (-row['spread'])  # Adjust for sign convention
                if spread_diff > 2:
                    merged.at[idx, 'spread_value'] = 'home'
                elif spread_diff < -2:
                    merged.at[idx, 'spread_value'] = 'away'

            # Total value
            if pd.notna(row.get('total')):
                total_diff = row['predicted_total'] - row['total']
                if total_diff > 3:
                    merged.at[idx, 'total_value'] = 'over'
                elif total_diff < -3:
                    merged.at[idx, 'total_value'] = 'under'

        return merged

    def generate_report(self, date: str) -> str:
        """
        Generate a text report for game predictions.

        Args:
            date: Date string 'YYYY-MM-DD'

        Returns:
            Formatted text report
        """
        predictions = self.predict_games(date)
        predictions = self.compare_with_odds(predictions, date)

        if predictions.empty:
            return f"No games scheduled for {date}"

        lines = [
            f"=== NBA预测报告 {date} ===",
            ""
        ]

        for _, game in predictions.iterrows():
            lines.append(f"比赛: {game['home_team']} vs {game['away_team']}")
            lines.append("━" * 35)

            winner = game['home_abbr'] if game['predicted_winner'] == 'home' else game['away_abbr']
            prob = game['home_win_prob'] if game['predicted_winner'] == 'home' else game['away_win_prob']

            lines.append(f"预测胜负: {winner} (概率: {prob*100:.1f}%)")

            spread_team = game['home_abbr'] if game['predicted_spread'] > 0 else game['away_abbr']
            spread_val = abs(game['predicted_spread'])
            lines.append(f"预测分差: {spread_team} +{spread_val:.1f}")

            lines.append(f"预测总分: {game['predicted_total']:.1f}")

            # Odds comparison if available
            if pd.notna(game.get('spread')):
                lines.append("")
                lines.append("与赔率对比:")

                if game.get('ml_value'):
                    value_team = game['home_abbr'] if game['ml_value'] == 'home' else game['away_abbr']
                    lines.append(f"  - 胜负: {value_team} 有价值")

                if game.get('spread_value'):
                    value_team = game['home_abbr'] if game['spread_value'] == 'home' else game['away_abbr']
                    lines.append(f"  - 让分: {value_team} 让分有价值")

                if game.get('total_value'):
                    lines.append(f"  - 大小分: {game['total_value'].upper()}")

            lines.append("")
            lines.append("")

        return "\n".join(lines)

    def store_predictions(self, predictions: pd.DataFrame):
        """Store predictions in database for tracking."""
        if predictions.empty:
            return

        conn = get_db_connection()

        for _, row in predictions.iterrows():
            try:
                conn.execute("""
                    INSERT INTO predictions
                    (game_id, home_win_prob, predicted_spread, predicted_total, model_version)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    row['game_id'],
                    row['home_win_prob'],
                    row['predicted_spread'],
                    row['predicted_total'],
                    self.model.model_version if self.model else None
                ))
            except Exception as e:
                print(f"Error storing prediction: {e}")

        conn.commit()
        conn.close()

    def get_prediction_history(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Get historical predictions with actual results.

        Args:
            start_date: Start date
            end_date: End date

        Returns:
            DataFrame with predictions and actuals
        """
        conn = get_db_connection()

        query = """
            SELECT
                p.*,
                g.home_win as actual_home_win,
                g.point_diff as actual_spread,
                g.total_points as actual_total,
                g.game_date,
                ht.full_name as home_team,
                at.full_name as away_team
            FROM predictions p
            JOIN games g ON p.game_id = g.game_id
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.home_score IS NOT NULL
        """

        params = []
        if start_date:
            query += " AND g.game_date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND g.game_date <= ?"
            params.append(end_date)

        query += " ORDER BY g.game_date DESC"

        df = pd.read_sql(query, conn, params=params)
        conn.close()

        if not df.empty:
            # Calculate accuracy metrics
            df['win_correct'] = (
                (df['home_win_prob'] > 0.5) == (df['actual_home_win'] == 1)
            ).astype(int)

            df['spread_error'] = abs(df['predicted_spread'] - df['actual_spread'])
            df['total_error'] = abs(df['predicted_total'] - df['actual_total'])

        return df

    def get_accuracy_stats(self) -> Dict:
        """Calculate overall prediction accuracy statistics."""
        history = self.get_prediction_history()

        if history.empty:
            return {}

        return {
            'win_accuracy': history['win_correct'].mean(),
            'spread_mae': history['spread_error'].mean(),
            'total_mae': history['total_error'].mean(),
            'total_predictions': len(history),
            'spread_within_5': (history['spread_error'] <= 5).mean(),
            'total_within_10': (history['total_error'] <= 10).mean()
        }

    def update_game_results(self, progress_callback=None) -> Dict:
        """
        Fetch latest game results from NBA API and update database.
        This allows comparing predictions with actual results.

        Returns:
            Dict with update statistics
        """
        if progress_callback:
            progress_callback("正在获取最新比赛结果...")

        # Fetch recent games from NBA API
        season = get_current_season()
        games_df = fetch_game_logs(season)

        if games_df.empty:
            return {'updated': 0, 'error': '无法获取比赛数据'}

        if progress_callback:
            progress_callback("正在更新数据库...")

        # Store the results
        process_and_store_games(games_df, season)

        # Count how many predictions now have results
        conn = get_db_connection()
        result = conn.execute("""
            SELECT COUNT(*) as count FROM predictions p
            JOIN games g ON p.game_id = g.game_id
            WHERE g.home_score IS NOT NULL
        """).fetchone()
        conn.close()

        return {
            'updated': result['count'] if result else 0,
            'message': '比赛结果已更新'
        }

    def get_predictions_with_results(self, date: Optional[str] = None) -> pd.DataFrame:
        """
        Get predictions alongside actual results for comparison.

        Args:
            date: Optional specific date to filter

        Returns:
            DataFrame with predictions and actual results
        """
        conn = get_db_connection()

        query = """
            SELECT
                p.game_id,
                g.game_date,
                ht.abbreviation as home_abbr,
                at.abbreviation as away_abbr,
                ht.full_name as home_team,
                at.full_name as away_team,
                p.home_win_prob,
                p.predicted_spread,
                p.predicted_total,
                g.home_score,
                g.away_score,
                g.home_win as actual_home_win,
                g.point_diff as actual_spread,
                g.total_points as actual_total
            FROM predictions p
            JOIN games g ON p.game_id = g.game_id
            JOIN teams ht ON g.home_team_id = ht.team_id
            JOIN teams at ON g.away_team_id = at.team_id
            WHERE g.home_score IS NOT NULL
        """

        params = []
        if date:
            query += " AND g.game_date = ?"
            params.append(date)

        query += " ORDER BY g.game_date DESC, p.id DESC"

        df = pd.read_sql(query, conn, params=params if params else None)
        conn.close()

        if not df.empty:
            # Add Chinese names
            df['home_cn'] = df['home_abbr'].apply(get_chinese_name)
            df['away_cn'] = df['away_abbr'].apply(get_chinese_name)

            # Calculate predicted scores
            df['predicted_home_score'] = (df['predicted_total'] + df['predicted_spread']) / 2
            df['predicted_away_score'] = (df['predicted_total'] - df['predicted_spread']) / 2

            # Determine prediction results
            df['predicted_winner'] = df['home_win_prob'].apply(lambda x: 'home' if x > 0.5 else 'away')
            df['actual_winner'] = df['actual_home_win'].apply(lambda x: 'home' if x == 1 else 'away')

            # Check if predictions were correct
            df['win_correct'] = (df['predicted_winner'] == df['actual_winner']).astype(int)
            df['spread_error'] = abs(df['predicted_spread'] - df['actual_spread'])
            df['total_error'] = abs(df['predicted_total'] - df['actual_total'])

            # Spread bet result (did we beat the spread?)
            # This compares if actual spread exceeded predicted spread in the right direction
            df['spread_correct'] = (
                ((df['predicted_spread'] > 0) & (df['actual_spread'] > 0)) |
                ((df['predicted_spread'] < 0) & (df['actual_spread'] < 0))
            ).astype(int)

            # Total bet result
            df['total_correct'] = (
                ((df['predicted_total'] > df['actual_total']) & (df['actual_total'] < df['predicted_total'])) |
                ((df['predicted_total'] < df['actual_total']) & (df['actual_total'] > df['predicted_total']))
            ).astype(int)

        return df


def predict_today() -> pd.DataFrame:
    """Convenience function to predict today's games."""
    predictor = GamePredictor()
    today = datetime.now().strftime('%Y-%m-%d')
    return predictor.predict_games(today, refresh_schedule=True)


def predict_tomorrow() -> pd.DataFrame:
    """Convenience function to predict tomorrow's games."""
    predictor = GamePredictor()
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    return predictor.predict_games(tomorrow, refresh_schedule=True)


if __name__ == "__main__":
    # Test predictor
    print("Testing predictor...")

    predictor = GamePredictor()

    if predictor.is_ready():
        today = datetime.now().strftime('%Y-%m-%d')
        print(f"\nPredictions for {today}:")
        print(predictor.generate_report(today))
    else:
        print("Model not ready. Train the model first.")
