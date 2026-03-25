"""
Utility functions and database management for NBA Predictor.
"""

import sqlite3
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
import pandas as pd


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


def get_db_connection() -> sqlite3.Connection:
    """Get a connection to the SQLite database."""
    ensure_directories()
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize the database with required tables."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Teams table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS teams (
            team_id INTEGER PRIMARY KEY,
            abbreviation TEXT NOT NULL,
            full_name TEXT NOT NULL,
            city TEXT,
            nickname TEXT,
            conference TEXT,
            division TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Games table - historical game results
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS games (
            game_id TEXT PRIMARY KEY,
            game_date DATE NOT NULL,
            season TEXT NOT NULL,
            season_type TEXT,
            home_team_id INTEGER NOT NULL,
            away_team_id INTEGER NOT NULL,
            home_score INTEGER,
            away_score INTEGER,
            home_win INTEGER,
            point_diff INTEGER,
            total_points INTEGER,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (home_team_id) REFERENCES teams(team_id),
            FOREIGN KEY (away_team_id) REFERENCES teams(team_id)
        )
    """)

    # Team stats table - team season statistics
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS team_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_id INTEGER NOT NULL,
            season TEXT NOT NULL,
            games_played INTEGER,
            wins INTEGER,
            losses INTEGER,
            win_pct REAL,
            pts_per_game REAL,
            opp_pts_per_game REAL,
            off_rating REAL,
            def_rating REAL,
            net_rating REAL,
            pace REAL,
            fg_pct REAL,
            fg3_pct REAL,
            ft_pct REAL,
            reb_per_game REAL,
            ast_per_game REAL,
            tov_per_game REAL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams(team_id),
            UNIQUE(team_id, season)
        )
    """)

    # Schedule table - upcoming games
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schedule (
            game_id TEXT PRIMARY KEY,
            game_date DATE NOT NULL,
            game_time TEXT,
            home_team_id INTEGER NOT NULL,
            away_team_id INTEGER NOT NULL,
            status TEXT DEFAULT 'scheduled',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (home_team_id) REFERENCES teams(team_id),
            FOREIGN KEY (away_team_id) REFERENCES teams(team_id)
        )
    """)

    # Predictions table - store our predictions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id TEXT NOT NULL,
            prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            home_win_prob REAL,
            predicted_spread REAL,
            predicted_total REAL,
            model_version TEXT,
            actual_home_win INTEGER,
            actual_spread INTEGER,
            actual_total INTEGER,
            FOREIGN KEY (game_id) REFERENCES games(game_id)
        )
    """)

    # Odds table - store betting odds
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS odds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id TEXT NOT NULL,
            bookmaker TEXT NOT NULL,
            market_type TEXT NOT NULL,
            home_odds REAL,
            away_odds REAL,
            spread_line REAL,
            spread_home_odds REAL,
            spread_away_odds REAL,
            total_line REAL,
            over_odds REAL,
            under_odds REAL,
            fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (game_id) REFERENCES schedule(game_id)
        )
    """)

    # Create indexes for common queries
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_games_teams ON games(home_team_id, away_team_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(game_date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_game ON predictions(game_id)")

    conn.commit()
    conn.close()
    print("Database initialized successfully.")


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
