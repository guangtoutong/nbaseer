"""
Database adapter for NBA Predictor.
Supports both SQLite (local) and Supabase PostgreSQL (cloud).
"""

import os
import sqlite3
from pathlib import Path
from typing import Optional, Union
from contextlib import contextmanager
import pandas as pd

# Check if we're in cloud mode
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_DB_PASSWORD = os.environ.get('SUPABASE_DB_PASSWORD')

# Project paths for local mode
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DB_PATH = DATA_DIR / "nba.db"

# Database mode
IS_CLOUD = bool(SUPABASE_URL and SUPABASE_DB_PASSWORD)


def get_supabase_connection():
    """Get PostgreSQL connection to Supabase."""
    import psycopg2
    from psycopg2.extras import RealDictCursor

    # Extract project ref from URL
    # URL format: https://xxxxx.supabase.co
    project_ref = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

    conn = psycopg2.connect(
        host=f"db.{project_ref}.supabase.co",
        port=5432,
        database="postgres",
        user="postgres",
        password=SUPABASE_DB_PASSWORD,
        cursor_factory=RealDictCursor
    )
    return conn


def get_sqlite_connection():
    """Get SQLite connection for local development."""
    DATA_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db_connection():
    """Get database connection (auto-selects based on environment)."""
    if IS_CLOUD:
        conn = get_supabase_connection()
    else:
        conn = get_sqlite_connection()

    try:
        yield conn
    finally:
        conn.close()


def execute_query(query: str, params: tuple = None, fetch: bool = True) -> Optional[list]:
    """Execute a query and optionally fetch results."""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Adapt query syntax for PostgreSQL vs SQLite
        if IS_CLOUD:
            # Convert SQLite ? placeholders to PostgreSQL %s
            query = query.replace('?', '%s')
            # Convert AUTOINCREMENT to SERIAL
            query = query.replace('AUTOINCREMENT', '')
            query = query.replace('INTEGER PRIMARY KEY', 'SERIAL PRIMARY KEY')

        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        if fetch:
            results = cursor.fetchall()
            if IS_CLOUD:
                return [dict(row) for row in results]
            else:
                return [dict(row) for row in results]
        else:
            conn.commit()
            return None


def read_sql(query: str, params: tuple = None) -> pd.DataFrame:
    """Read SQL query into DataFrame."""
    with get_db_connection() as conn:
        if IS_CLOUD:
            query = query.replace('?', '%s')
        return pd.read_sql(query, conn, params=params)


def init_database():
    """Initialize the database with required tables."""

    # SQL for creating tables (PostgreSQL compatible)
    tables_sql = """
    -- Teams table
    CREATE TABLE IF NOT EXISTS teams (
        team_id INTEGER PRIMARY KEY,
        abbreviation TEXT NOT NULL,
        full_name TEXT NOT NULL,
        city TEXT,
        nickname TEXT,
        conference TEXT,
        division TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Games table
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Team stats table
    CREATE TABLE IF NOT EXISTS team_stats (
        id SERIAL PRIMARY KEY,
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
        UNIQUE(team_id, season)
    );

    -- Schedule table
    CREATE TABLE IF NOT EXISTS schedule (
        game_id TEXT PRIMARY KEY,
        game_date DATE NOT NULL,
        game_time TEXT,
        home_team_id INTEGER NOT NULL,
        away_team_id INTEGER NOT NULL,
        status TEXT DEFAULT 'scheduled',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Predictions table
    CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        game_id TEXT NOT NULL,
        prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        home_win_prob REAL,
        predicted_spread REAL,
        predicted_total REAL,
        model_version TEXT,
        actual_home_win INTEGER,
        actual_spread INTEGER,
        actual_total INTEGER
    );

    -- Odds table
    CREATE TABLE IF NOT EXISTS odds (
        id SERIAL PRIMARY KEY,
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
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
    CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(game_date);
    CREATE INDEX IF NOT EXISTS idx_predictions_game ON predictions(game_id);
    """

    with get_db_connection() as conn:
        cursor = conn.cursor()

        if IS_CLOUD:
            # PostgreSQL: execute statements one by one
            statements = [s.strip() for s in tables_sql.split(';') if s.strip()]
            for stmt in statements:
                try:
                    cursor.execute(stmt)
                except Exception as e:
                    # Ignore "already exists" errors
                    if 'already exists' not in str(e).lower():
                        print(f"Warning: {e}")
        else:
            # SQLite: adapt syntax
            sqlite_sql = tables_sql.replace('SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT')
            cursor.executescript(sqlite_sql)

        conn.commit()

    print(f"Database initialized successfully ({'Cloud' if IS_CLOUD else 'Local'} mode)")


def get_database_mode() -> str:
    """Get current database mode."""
    return "Supabase (Cloud)" if IS_CLOUD else "SQLite (Local)"


# For backwards compatibility
def get_db_connection_compat():
    """Get connection for backwards compatibility (non-context manager)."""
    if IS_CLOUD:
        return get_supabase_connection()
    else:
        return get_sqlite_connection()
