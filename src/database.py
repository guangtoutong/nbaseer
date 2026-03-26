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
# Try to get from Streamlit secrets first, then fall back to environment variables
def get_secret(key: str, default=None):
    """Get secret from Streamlit secrets or environment variables."""
    try:
        import streamlit as st
        if hasattr(st, 'secrets') and key in st.secrets:
            return st.secrets[key]
    except:
        pass
    return os.environ.get(key, default)

SUPABASE_URL = get_secret('SUPABASE_URL')
SUPABASE_DB_PASSWORD = get_secret('SUPABASE_DB_PASSWORD')
DATABASE_URL = get_secret('DATABASE_URL')  # Full connection string (preferred)

# Project paths for local mode
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DB_PATH = DATA_DIR / "nba.db"

# Database mode
IS_CLOUD = bool(DATABASE_URL or (SUPABASE_URL and SUPABASE_DB_PASSWORD))


def get_supabase_connection():
    """Get PostgreSQL connection to Supabase."""
    import psycopg2
    from psycopg2.extras import RealDictCursor
    from urllib.parse import urlparse, unquote

    # Prefer DATABASE_URL if provided (connection pooler URL from Supabase dashboard)
    if DATABASE_URL:
        # Parse the URL into components for more reliable connection
        parsed = urlparse(DATABASE_URL)

        # Extract components
        host = parsed.hostname
        port = parsed.port or 6543
        database = parsed.path.lstrip('/') or 'postgres'
        user = unquote(parsed.username) if parsed.username else 'postgres'
        password = unquote(parsed.password) if parsed.password else ''

        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                database=database,
                user=user,
                password=password,
                sslmode='require',
                connect_timeout=10,
                cursor_factory=RealDictCursor
            )
            return conn
        except psycopg2.OperationalError as e:
            # Re-raise with more context
            raise psycopg2.OperationalError(
                f"Failed to connect to database. Host={host}, Port={port}, User={user}, DB={database}. Error: {e}"
            ) from e

    # Fallback: construct connection from SUPABASE_URL and password
    # Extract project ref from URL: https://xxxxx.supabase.co
    project_ref = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

    # Use direct connection with SSL mode
    conn = psycopg2.connect(
        host=f"db.{project_ref}.supabase.co",
        port=5432,
        database="postgres",
        user="postgres",
        password=SUPABASE_DB_PASSWORD,
        sslmode='require',
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


def adapt_query(query: str) -> str:
    """Adapt SQL query for the current database backend."""
    if IS_CLOUD:
        # Convert SQLite ? placeholders to PostgreSQL %s
        query = query.replace('?', '%s')
        # Convert AUTOINCREMENT to SERIAL
        query = query.replace('AUTOINCREMENT', '')
        query = query.replace('INTEGER PRIMARY KEY', 'SERIAL PRIMARY KEY')
        # Convert INSERT OR REPLACE to PostgreSQL UPSERT
        if 'INSERT OR REPLACE INTO' in query.upper():
            # Extract table name and convert to ON CONFLICT
            query = query.replace('INSERT OR REPLACE INTO', 'INSERT INTO')
            query = query.replace('insert or replace into', 'INSERT INTO')
    return query


def execute_query(query: str, params: tuple = None, fetch: bool = True) -> Optional[list]:
    """Execute a query and optionally fetch results."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = adapt_query(query)

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
    if IS_CLOUD:
        # For PostgreSQL, create a connection WITHOUT RealDictCursor
        # because pd.read_sql needs a regular cursor
        import psycopg2
        from urllib.parse import urlparse, unquote

        parsed = urlparse(DATABASE_URL)
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 6543,
            database=parsed.path.lstrip('/') or 'postgres',
            user=unquote(parsed.username) if parsed.username else 'postgres',
            password=unquote(parsed.password) if parsed.password else '',
            sslmode='require',
            connect_timeout=10
            # Note: NO cursor_factory here - use default cursor for pandas
        )
        query = query.replace('?', '%s')
        try:
            df = pd.read_sql(query, conn, params=params)
            return df
        finally:
            conn.close()
    else:
        # SQLite - use context manager
        with get_db_connection() as conn:
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

    results = {'success': False, 'tables_created': [], 'errors': []}

    with get_db_connection() as conn:
        cursor = conn.cursor()

        if IS_CLOUD:
            # PostgreSQL: execute statements one by one
            statements = [s.strip() for s in tables_sql.split(';') if s.strip()]
            for stmt in statements:
                try:
                    cursor.execute(stmt)
                    # Extract table name for logging
                    if 'CREATE TABLE' in stmt.upper():
                        table_name = stmt.split('EXISTS')[1].split('(')[0].strip() if 'EXISTS' in stmt.upper() else 'unknown'
                        results['tables_created'].append(table_name)
                except Exception as e:
                    error_msg = str(e)
                    # Ignore "already exists" errors
                    if 'already exists' not in error_msg.lower():
                        results['errors'].append(error_msg)
        else:
            # SQLite: adapt syntax
            sqlite_sql = tables_sql.replace('SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT')
            cursor.executescript(sqlite_sql)
            results['tables_created'] = ['teams', 'games', 'team_stats', 'schedule', 'predictions', 'odds']

        conn.commit()
        results['success'] = True

    results['mode'] = 'Cloud' if IS_CLOUD else 'Local'
    return results


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


def test_connection() -> dict:
    """Test database connection and return status info."""
    from urllib.parse import urlparse

    result = {
        'mode': 'Cloud' if IS_CLOUD else 'Local',
        'database_url_set': bool(DATABASE_URL),
        'success': False,
        'error': None,
        'details': {}
    }

    if DATABASE_URL:
        parsed = urlparse(DATABASE_URL)
        result['details'] = {
            'host': parsed.hostname,
            'port': parsed.port,
            'user': parsed.username,
            'database': parsed.path.lstrip('/'),
        }

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result['success'] = True
    except Exception as e:
        result['error'] = str(e)

    return result
