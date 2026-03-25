"""
Utility functions and database management for NBA Predictor.
"""

import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
import pandas as pd

# Import from database module
from .database import (
    get_db_connection as get_db_connection_ctx,
    get_db_connection_compat,
    init_database,
    read_sql,
    execute_query,
    get_database_mode,
    IS_CLOUD
)

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
MODELS_DIR = PROJECT_ROOT / "models"
DB_PATH = DATA_DIR / "nba.db"
CONFIG_PATH = DATA_DIR / "config.json"

# NBA Team Chinese Names
TEAM_CHINESE_NAMES = {
    'ATL': '老鹰', 'BOS': '凯尔特人', 'BKN': '篮网', 'CHA': '黄蜂',
    'CHI': '公牛', 'CLE': '骑士', 'DAL': '独行侠', 'DEN': '掘金',
    'DET': '活塞', 'GSW': '勇士', 'HOU': '火箭', 'IND': '步行者',
    'LAC': '快船', 'LAL': '湖人', 'MEM': '灰熊', 'MIA': '热火',
    'MIL': '雄鹿', 'MIN': '森林狼', 'NOP': '鹈鹕', 'NYK': '尼克斯',
    'OKC': '雷霆', 'ORL': '魔术', 'PHI': '76人', 'PHX': '太阳',
    'POR': '开拓者', 'SAC': '国王', 'SAS': '马刺', 'TOR': '猛龙',
    'UTA': '爵士', 'WAS': '奇才'
}


def get_chinese_name(abbr: str) -> str:
    """Get Chinese team name from abbreviation."""
    return TEAM_CHINESE_NAMES.get(abbr, abbr)


def ensure_directories():
    """Ensure all required directories exist."""
    DATA_DIR.mkdir(exist_ok=True)
    MODELS_DIR.mkdir(exist_ok=True)


def get_db_connection():
    """Get a connection to the database (SQLite local or Supabase cloud)."""
    ensure_directories()
    return get_db_connection_compat()


# Note: init_database is imported from database module


def get_current_season() -> str:
    """Get the current NBA season string (e.g., '2024-25')."""
    today = datetime.now()
    # NBA season typically starts in October
    if today.month >= 10:
        return f"{today.year}-{str(today.year + 1)[-2:]}"
    else:
        return f"{today.year - 1}-{str(today.year)[-2:]}"


def get_season_from_date(date: datetime) -> str:
    """Get the NBA season string for a given date."""
    if date.month >= 10:
        return f"{date.year}-{str(date.year + 1)[-2:]}"
    else:
        return f"{date.year - 1}-{str(date.year)[-2:]}"


def american_to_decimal(american_odds: int) -> float:
    """Convert American odds to decimal odds."""
    if american_odds > 0:
        return (american_odds / 100) + 1
    else:
        return (100 / abs(american_odds)) + 1


def decimal_to_implied_prob(decimal_odds: float) -> float:
    """Convert decimal odds to implied probability."""
    return 1 / decimal_odds


def american_to_implied_prob(american_odds: int) -> float:
    """Convert American odds directly to implied probability."""
    decimal_odds = american_to_decimal(american_odds)
    return decimal_to_implied_prob(decimal_odds)


def format_game_time(time_str: Optional[str]) -> str:
    """Format game time for display."""
    if not time_str:
        return "TBD"
    try:
        dt = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
        return dt.strftime("%I:%M %p")
    except:
        return time_str


def get_team_name_mapping() -> dict:
    """Get mapping of team abbreviations to full names."""
    conn = get_db_connection()
    df = pd.read_sql("SELECT abbreviation, full_name FROM teams", conn)
    conn.close()
    return dict(zip(df['abbreviation'], df['full_name']))


def get_team_id_mapping() -> dict:
    """Get mapping of team abbreviations to IDs."""
    conn = get_db_connection()
    df = pd.read_sql("SELECT abbreviation, team_id FROM teams", conn)
    conn.close()
    return dict(zip(df['abbreviation'], df['team_id']))


def calculate_rest_days(team_id: int, game_date: str) -> int:
    """Calculate days of rest before a game for a team."""
    conn = get_db_connection()
    query = """
        SELECT MAX(game_date) as last_game
        FROM games
        WHERE (home_team_id = ? OR away_team_id = ?)
        AND game_date < ?
    """
    result = pd.read_sql(query, conn, params=(team_id, team_id, game_date))
    conn.close()

    if result['last_game'].iloc[0] is None:
        return 7  # Default to a week if no previous game found

    last_game = datetime.strptime(result['last_game'].iloc[0], '%Y-%m-%d')
    current_game = datetime.strptime(game_date, '%Y-%m-%d')
    return (current_game - last_game).days


def is_back_to_back(team_id: int, game_date: str) -> bool:
    """Check if this is a back-to-back game for a team."""
    return calculate_rest_days(team_id, game_date) == 1


def save_config(config: dict):
    """Save configuration to file."""
    import json
    ensure_directories()
    with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


def load_config() -> dict:
    """Load configuration from file."""
    import json
    if not CONFIG_PATH.exists():
        return {}
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {}


def save_api_key(key_name: str, key_value: str):
    """Save an API key to config."""
    config = load_config()
    config[key_name] = key_value
    save_config(config)


def load_api_key(key_name: str) -> Optional[str]:
    """Load an API key from config."""
    config = load_config()
    return config.get(key_name)


if __name__ == "__main__":
    # Initialize database when run directly
    init_database()
    print(f"Current NBA season: {get_current_season()}")
