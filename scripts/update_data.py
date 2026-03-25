#!/usr/bin/env python3
"""
Scheduled data update script for NBAseer.
This script is designed to run via GitHub Actions.

Usage:
    python scripts/update_data.py [--schedule] [--results] [--all]

Options:
    --schedule  Fetch today's game schedule and odds
    --results   Update yesterday's game results
    --all       Run all updates (default)
"""

import os
import sys
import argparse
from datetime import datetime, timedelta

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database import init_database, get_database_mode
from src.data_collector import (
    fetch_schedule,
    update_database,
    fetch_team_info,
    fetch_game_results
)
from src.predictor import GamePredictor


def log(message: str):
    """Print timestamped log message."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")


def update_schedule():
    """Fetch today's and tomorrow's game schedule."""
    log("Updating game schedule...")

    today = datetime.now().strftime("%Y-%m-%d")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    try:
        # Fetch today's schedule
        log(f"Fetching schedule for {today}")
        fetch_schedule(today)

        # Fetch tomorrow's schedule
        log(f"Fetching schedule for {tomorrow}")
        fetch_schedule(tomorrow)

        log("Schedule update complete")
        return True
    except Exception as e:
        log(f"Error updating schedule: {e}")
        return False


def update_results():
    """Update game results for completed games."""
    log("Updating game results...")

    try:
        predictor = GamePredictor()
        result = predictor.update_game_results()

        if 'error' in result:
            log(f"Error: {result['error']}")
            return False

        log(f"Updated {result.get('updated', 0)} game results")
        return True
    except Exception as e:
        log(f"Error updating results: {e}")
        return False


def update_team_data():
    """Update team information and stats."""
    log("Updating team data...")

    try:
        fetch_team_info()
        log("Team data update complete")
        return True
    except Exception as e:
        log(f"Error updating team data: {e}")
        return False


def generate_predictions():
    """Generate predictions for upcoming games."""
    log("Generating predictions...")

    try:
        predictor = GamePredictor()
        if not predictor.is_ready():
            log("Model not ready, skipping predictions")
            return False

        today = datetime.now().strftime("%Y-%m-%d")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

        # Generate predictions for today and tomorrow
        for date in [today, tomorrow]:
            predictions = predictor.predict_games(date)
            if not predictions.empty:
                log(f"Generated {len(predictions)} predictions for {date}")

        return True
    except Exception as e:
        log(f"Error generating predictions: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="NBAseer Data Update Script")
    parser.add_argument("--schedule", action="store_true", help="Update schedule only")
    parser.add_argument("--results", action="store_true", help="Update results only")
    parser.add_argument("--all", action="store_true", help="Run all updates")
    args = parser.parse_args()

    # Default to all if no specific option
    run_all = args.all or (not args.schedule and not args.results)

    log("=" * 50)
    log("NBAseer Data Update Started")
    log(f"Database Mode: {get_database_mode()}")
    log("=" * 50)

    # Initialize database (creates tables if not exist)
    init_database()

    success = True

    if run_all or args.results:
        # Update results first (for yesterday's games)
        if not update_results():
            success = False

    if run_all or args.schedule:
        # Update team data periodically
        if not update_team_data():
            success = False

        # Update schedule
        if not update_schedule():
            success = False

        # Generate predictions
        if not generate_predictions():
            success = False

    log("=" * 50)
    log(f"Update {'completed successfully' if success else 'completed with errors'}")
    log("=" * 50)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
