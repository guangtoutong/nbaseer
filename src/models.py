"""
Prediction Models Module.
XGBoost models for win probability, spread, and total predictions.
"""

import os
import pickle
from datetime import datetime
from typing import Dict, Tuple, Optional
import numpy as np
import pandas as pd

from xgboost import XGBClassifier, XGBRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, roc_auc_score, log_loss,
    mean_absolute_error, mean_squared_error, r2_score
)

from .utils import MODELS_DIR


class NBAPredictor:
    """
    Ensemble of models for NBA game predictions.
    - Win probability (classification)
    - Point spread (regression)
    - Total points (regression)
    """

    def __init__(self):
        self.win_model = None
        self.spread_model = None
        self.total_model = None

        self.win_metrics = {}
        self.spread_metrics = {}
        self.total_metrics = {}

        self.feature_names = []
        self.trained_at = None
        self.model_version = None

    def _create_win_model(self) -> XGBClassifier:
        """Create win probability classifier."""
        return XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1,
            random_state=42,
            eval_metric='logloss',
            use_label_encoder=False
        )

    def _create_spread_model(self) -> XGBRegressor:
        """Create spread prediction regressor."""
        return XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1,
            random_state=42
        )

    def _create_total_model(self) -> XGBRegressor:
        """Create total points regressor."""
        return XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1,
            random_state=42
        )

    def train(
        self,
        X: np.ndarray,
        y_win: np.ndarray,
        y_spread: np.ndarray,
        y_total: np.ndarray,
        feature_names: list = None,
        test_size: float = 0.2,
        progress_callback=None
    ) -> Dict:
        """
        Train all three models.

        Args:
            X: Feature matrix
            y_win: Win labels (0/1)
            y_spread: Point spread values
            y_total: Total points values
            feature_names: List of feature names
            test_size: Fraction for test set
            progress_callback: Optional callback for progress

        Returns:
            Dictionary with training metrics
        """
        if feature_names:
            self.feature_names = feature_names

        # Check label distribution before training
        unique_labels = np.unique(y_win)
        print(f"DEBUG: y_win unique labels: {unique_labels}, counts: {np.bincount(y_win.astype(int))}")

        if len(unique_labels) < 2:
            raise ValueError(
                f"Training data must contain both win (1) and loss (0) labels. "
                f"Found only: {unique_labels}. Check home_win values in database."
            )

        # Split data with stratification to ensure both classes in test set
        X_train, X_test, y_win_train, y_win_test = train_test_split(
            X, y_win, test_size=test_size, random_state=42, stratify=y_win
        )
        _, _, y_spread_train, y_spread_test = train_test_split(
            X, y_spread, test_size=test_size, random_state=42
        )
        _, _, y_total_train, y_total_test = train_test_split(
            X, y_total, test_size=test_size, random_state=42
        )

        print(f"DEBUG: y_win_train distribution: {np.bincount(y_win_train.astype(int))}")
        print(f"DEBUG: y_win_test distribution: {np.bincount(y_win_test.astype(int))}")

        # Train win model
        if progress_callback:
            progress_callback("Training win probability model...")

        self.win_model = self._create_win_model()
        self.win_model.fit(X_train, y_win_train)

        # Evaluate win model
        y_win_pred = self.win_model.predict(X_test)
        y_win_prob = self.win_model.predict_proba(X_test)[:, 1]

        self.win_metrics = {
            'accuracy': accuracy_score(y_win_test, y_win_pred),
            'auc': roc_auc_score(y_win_test, y_win_prob),
            'log_loss': log_loss(y_win_test, y_win_prob, labels=[0, 1])
        }

        # Train spread model
        if progress_callback:
            progress_callback("Training spread prediction model...")

        self.spread_model = self._create_spread_model()
        self.spread_model.fit(X_train, y_spread_train)

        # Evaluate spread model
        y_spread_pred = self.spread_model.predict(X_test)

        self.spread_metrics = {
            'mae': mean_absolute_error(y_spread_test, y_spread_pred),
            'rmse': np.sqrt(mean_squared_error(y_spread_test, y_spread_pred)),
            'r2': r2_score(y_spread_test, y_spread_pred)
        }

        # Train total model
        if progress_callback:
            progress_callback("Training total points model...")

        self.total_model = self._create_total_model()
        self.total_model.fit(X_train, y_total_train)

        # Evaluate total model
        y_total_pred = self.total_model.predict(X_test)

        self.total_metrics = {
            'mae': mean_absolute_error(y_total_test, y_total_pred),
            'rmse': np.sqrt(mean_squared_error(y_total_test, y_total_pred)),
            'r2': r2_score(y_total_test, y_total_pred)
        }

        self.trained_at = datetime.now()
        self.model_version = self.trained_at.strftime('%Y%m%d_%H%M%S')

        if progress_callback:
            progress_callback("Training complete!")

        return {
            'win': self.win_metrics,
            'spread': self.spread_metrics,
            'total': self.total_metrics,
            'samples': len(X),
            'features': X.shape[1],
            'trained_at': self.trained_at.isoformat()
        }

    def predict(self, X: np.ndarray) -> Dict:
        """
        Make predictions for games.

        Args:
            X: Feature matrix

        Returns:
            Dictionary with predictions
        """
        if self.win_model is None:
            raise ValueError("Models not trained. Call train() first.")

        win_prob = self.win_model.predict_proba(X)[:, 1]
        spread = self.spread_model.predict(X)
        total = self.total_model.predict(X)

        return {
            'home_win_prob': win_prob,
            'predicted_spread': spread,
            'predicted_total': total
        }

    def predict_single(self, X: np.ndarray) -> Dict:
        """
        Make prediction for a single game.

        Args:
            X: Feature vector (1, n_features)

        Returns:
            Dictionary with single prediction
        """
        preds = self.predict(X)

        return {
            'home_win_prob': float(preds['home_win_prob'][0]),
            'predicted_spread': float(preds['predicted_spread'][0]),
            'predicted_total': float(preds['predicted_total'][0])
        }

    def get_feature_importance(self) -> pd.DataFrame:
        """
        Get feature importances from all models.

        Returns:
            DataFrame with feature importances
        """
        if not self.feature_names:
            return pd.DataFrame()

        importance_data = []

        for name in self.feature_names:
            idx = self.feature_names.index(name)
            importance_data.append({
                'feature': name,
                'win_importance': self.win_model.feature_importances_[idx] if self.win_model else 0,
                'spread_importance': self.spread_model.feature_importances_[idx] if self.spread_model else 0,
                'total_importance': self.total_model.feature_importances_[idx] if self.total_model else 0
            })

        df = pd.DataFrame(importance_data)
        df['avg_importance'] = (
            df['win_importance'] + df['spread_importance'] + df['total_importance']
        ) / 3

        return df.sort_values('avg_importance', ascending=False)

    def save_model(self, path: Optional[str] = None):
        """
        Save trained models to disk.

        Args:
            path: Optional path to save directory
        """
        if path is None:
            path = MODELS_DIR

        os.makedirs(path, exist_ok=True)

        model_data = {
            'win_model': self.win_model,
            'spread_model': self.spread_model,
            'total_model': self.total_model,
            'win_metrics': self.win_metrics,
            'spread_metrics': self.spread_metrics,
            'total_metrics': self.total_metrics,
            'feature_names': self.feature_names,
            'trained_at': self.trained_at,
            'model_version': self.model_version
        }

        # Always save as latest (this file should be committed to git)
        latest_path = os.path.join(path, 'nba_predictor_latest.pkl')
        with open(latest_path, 'wb') as f:
            pickle.dump(model_data, f)

        print(f"Model saved to {latest_path}")
        return latest_path

    def load_model(self, path: Optional[str] = None):
        """
        Load trained models from disk.

        Args:
            path: Path to model file or directory
        """
        if path is None:
            path = os.path.join(MODELS_DIR, 'nba_predictor_latest.pkl')
        elif os.path.isdir(path):
            path = os.path.join(path, 'nba_predictor_latest.pkl')

        if not os.path.exists(path):
            raise FileNotFoundError(f"No model found at {path}")

        with open(path, 'rb') as f:
            model_data = pickle.load(f)

        self.win_model = model_data['win_model']
        self.spread_model = model_data['spread_model']
        self.total_model = model_data['total_model']
        self.win_metrics = model_data['win_metrics']
        self.spread_metrics = model_data['spread_metrics']
        self.total_metrics = model_data['total_metrics']
        self.feature_names = model_data['feature_names']
        self.trained_at = model_data['trained_at']
        self.model_version = model_data['model_version']

        print(f"Model loaded (version: {self.model_version})")

    def get_metrics_summary(self) -> Dict:
        """Get summary of model performance metrics."""
        return {
            'win': self.win_metrics,
            'spread': self.spread_metrics,
            'total': self.total_metrics,
            'trained_at': self.trained_at.isoformat() if self.trained_at else None,
            'version': self.model_version
        }

    @staticmethod
    def model_exists(path: Optional[str] = None) -> bool:
        """Check if a trained model exists."""
        if path is None:
            path = os.path.join(MODELS_DIR, 'nba_predictor_latest.pkl')
        return os.path.exists(path)


def train_models(
    X: np.ndarray,
    y_win: np.ndarray,
    y_spread: np.ndarray,
    y_total: np.ndarray,
    feature_names: list = None,
    save: bool = True,
    progress_callback=None
) -> NBAPredictor:
    """
    Convenience function to train and save models.

    Args:
        X: Feature matrix
        y_win: Win labels
        y_spread: Spread values
        y_total: Total values
        feature_names: Feature names
        save: Whether to save model
        progress_callback: Progress callback

    Returns:
        Trained NBAPredictor instance
    """
    predictor = NBAPredictor()

    metrics = predictor.train(
        X, y_win, y_spread, y_total,
        feature_names=feature_names,
        progress_callback=progress_callback
    )

    print("\n=== Training Results ===")
    print(f"Win Model - Accuracy: {metrics['win']['accuracy']:.3f}, AUC: {metrics['win']['auc']:.3f}")
    print(f"Spread Model - MAE: {metrics['spread']['mae']:.2f}, RMSE: {metrics['spread']['rmse']:.2f}")
    print(f"Total Model - MAE: {metrics['total']['mae']:.2f}, RMSE: {metrics['total']['rmse']:.2f}")

    if save:
        predictor.save_model()

    return predictor


def load_predictor() -> NBAPredictor:
    """Load the latest trained predictor."""
    predictor = NBAPredictor()
    predictor.load_model()
    return predictor


if __name__ == "__main__":
    # Test model creation
    print("Testing model creation...")

    predictor = NBAPredictor()

    # Create some dummy data for testing
    np.random.seed(42)
    X_test = np.random.randn(100, 40)
    y_win_test = np.random.randint(0, 2, 100)
    y_spread_test = np.random.randn(100) * 10
    y_total_test = 220 + np.random.randn(100) * 15

    metrics = predictor.train(X_test, y_win_test, y_spread_test, y_total_test)
    print(f"\nTraining metrics: {metrics}")

    # Test prediction
    pred = predictor.predict_single(X_test[:1])
    print(f"\nSample prediction: {pred}")
