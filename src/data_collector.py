"""
NBA Data Collector Module.
Fetches data from NBA API and stores in local database.
"""

import time
from datetime import datetime, timedelta
from typing import Optional, List
import pandas as pd

from nba_api.stats.static import teams
from nba_api.stats.endpoints import (
    leaguegamefinder,
    teamdashboardbygeneralsplits,
    leaguestandings,
    scoreboardv2,
    teamgamelog
)

from .utils import (
    get_db_connection,
    init_database,
    get_current_season,
    get_season_from_date,
    DB_PATH
)
from .database import execute_query, IS_CLOUD, adapt_query


# Rate limiting delay (seconds) to avoid API throttling
API_DELAY = 0.6


def fetch_all_teams() -> pd.DataFrame:
    """
    Fetch all NBA teams and store in database.

    Returns:
        DataFrame with team information
    """
    nba_teams = teams.get_teams()
    df = pd.DataFrame(nba_teams)

    # Rename columns to match our schema
    df = df.rename(columns={
        'id': 'team_id',
        'full_name': 'full_name',
        'abbreviation': 'abbreviation',
        'nickname': 'nickname',
        'city': 'city',
        'state': 'state'
    })

    # Store in database
    for _, row in df.iterrows():
        if IS_CLOUD:
            execute_query("""
                INSERT INTO teams (team_id, abbreviation, full_name, city, nickname)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (team_id) DO UPDATE SET
                    abbreviation = EXCLUDED.abbreviation,
                    full_name = EXCLUDED.full_name,
                    city = EXCLUDED.city,
                    nickname = EXCLUDED.nickname
            """, (row['team_id'], row['abbreviation'], row['full_name'],
                  row['city'], row['nickname']), fetch=False)
        else:
            execute_query("""
                INSERT OR REPLACE INTO teams (team_id, abbreviation, full_name, city, nickname)
                VALUES (?, ?, ?, ?, ?)
            """, (row['team_id'], row['abbreviation'], row['full_name'],
                  row['city'], row['nickname']), fetch=False)

    print(f"Fetched and stored {len(df)} teams.")
    return df


def fetch_team_stats(season: str, team_id: Optional[int] = None) -> pd.DataFrame:
    """
    Fetch team statistics for a season.

    Args:
        season: NBA season string (e.g., '2024-25')
        team_id: Optional specific team ID

    Returns:
        DataFrame with team statistics
    """
    try:
        standings = leaguestandings.LeagueStandings(
            season=season,
            season_type='Regular Season'
        )
        time.sleep(API_DELAY)

        df = standings.get_data_frames()[0]

        if team_id:
            df = df[df['TeamID'] == team_id]

        return df
    except Exception as e:
        print(f"Error fetching team stats: {e}")
        return pd.DataFrame()


def fetch_game_logs(season: str, season_type: str = 'Regular Season') -> pd.DataFrame:
    """
    Fetch all game logs for a season.

    Args:
        season: NBA season string (e.g., '2024-25')
        season_type: 'Regular Season' or 'Playoffs'

    Returns:
        DataFrame with game results
    """
    try:
        game_finder = leaguegamefinder.LeagueGameFinder(
            season_nullable=season,
            season_type_nullable=season_type,
            league_id_nullable='00'  # NBA
        )
        time.sleep(API_DELAY)

        df = game_finder.get_data_frames()[0]
        return df
    except Exception as e:
        print(f"Error fetching game logs: {e}")
        return pd.DataFrame()


def process_and_store_games(games_df: pd.DataFrame, season: str):
    """
    Process raw game data and store in database.
    Each game appears twice (home and away perspective), so we need to deduplicate.

    Args:
        games_df: Raw game data from API
        season: NBA season string
    """
    if games_df.empty:
        return

    # Group by GAME_ID to get both teams' data
    game_groups = games_df.groupby('GAME_ID')
    games_stored = 0

    for game_id, group in game_groups:
        if len(group) != 2:
            continue  # Skip incomplete data

        # Determine home and away teams
        home_row = group[group['MATCHUP'].str.contains(' vs. ')].iloc[0] if any(group['MATCHUP'].str.contains(' vs. ')) else None
        away_row = group[group['MATCHUP'].str.contains(' @ ')].iloc[0] if any(group['MATCHUP'].str.contains(' @ ')) else None

        if home_row is None or away_row is None:
            continue

        # Convert numpy types to Python native types
        home_team_id = int(home_row['TEAM_ID'])
        away_team_id = int(away_row['TEAM_ID'])
        home_score = int(home_row['PTS'])
        away_score = int(away_row['PTS'])
        game_date = str(home_row['GAME_DATE'])

        # Determine winner
        home_win = 1 if home_score > away_score else 0
        point_diff = int(home_score - away_score)
        total_points = int(home_score + away_score)

        try:
            if IS_CLOUD:
                execute_query("""
                    INSERT INTO games
                    (game_id, game_date, season, home_team_id, away_team_id,
                     home_score, away_score, home_win, point_diff, total_points)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (game_id) DO UPDATE SET
                        home_score = EXCLUDED.home_score,
                        away_score = EXCLUDED.away_score,
                        home_win = EXCLUDED.home_win,
                        point_diff = EXCLUDED.point_diff,
                        total_points = EXCLUDED.total_points
                """, (str(game_id), game_date, season, home_team_id, away_team_id,
                      home_score, away_score, home_win, point_diff, total_points), fetch=False)
            else:
                execute_query("""
                    INSERT OR REPLACE INTO games
                    (game_id, game_date, season, home_team_id, away_team_id,
                     home_score, away_score, home_win, point_diff, total_points)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (str(game_id), game_date, season, home_team_id, away_team_id,
                      home_score, away_score, home_win, point_diff, total_points), fetch=False)
            games_stored += 1
        except Exception as e:
            print(f"Error storing game {game_id}: {e}")

    print(f"Stored {games_stored} games for season {season}.")


def fetch_team_advanced_stats(team_id: int, season: str) -> dict:
    """
    Fetch advanced statistics for a specific team.

    Args:
        team_id: NBA team ID
        season: NBA season string

    Returns:
        Dictionary with advanced stats
    """
    try:
        dashboard = teamdashboardbygeneralsplits.TeamDashboardByGeneralSplits(
            team_id=team_id,
            season=season,
            season_type_all_star='Regular Season'
        )
        time.sleep(API_DELAY)

        df = dashboard.get_data_frames()[0]

        if df.empty:
            return {}

        row = df.iloc[0]
        return {
            'team_id': team_id,
            'season': season,
            'games_played': row.get('GP', 0),
            'wins': row.get('W', 0),
            'losses': row.get('L', 0),
            'win_pct': row.get('W_PCT', 0),
            'pts_per_game': row.get('PTS', 0) / max(row.get('GP', 1), 1),
            'fg_pct': row.get('FG_PCT', 0),
            'fg3_pct': row.get('FG3_PCT', 0),
            'ft_pct': row.get('FT_PCT', 0),
            'reb_per_game': row.get('REB', 0) / max(row.get('GP', 1), 1),
            'ast_per_game': row.get('AST', 0) / max(row.get('GP', 1), 1),
            'tov_per_game': row.get('TOV', 0) / max(row.get('GP', 1), 1),
        }
    except Exception as e:
        print(f"Error fetching advanced stats for team {team_id}: {e}")
        return {}


def store_team_stats(stats: dict):
    """Store team statistics in database."""
    if not stats:
        return

    try:
        if IS_CLOUD:
            execute_query("""
                INSERT INTO team_stats
                (team_id, season, games_played, wins, losses, win_pct,
                 pts_per_game, fg_pct, fg3_pct, ft_pct, reb_per_game,
                 ast_per_game, tov_per_game)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (team_id, season) DO UPDATE SET
                    games_played = EXCLUDED.games_played,
                    wins = EXCLUDED.wins,
                    losses = EXCLUDED.losses,
                    win_pct = EXCLUDED.win_pct,
                    pts_per_game = EXCLUDED.pts_per_game,
                    fg_pct = EXCLUDED.fg_pct,
                    fg3_pct = EXCLUDED.fg3_pct,
                    ft_pct = EXCLUDED.ft_pct,
                    reb_per_game = EXCLUDED.reb_per_game,
                    ast_per_game = EXCLUDED.ast_per_game,
                    tov_per_game = EXCLUDED.tov_per_game
            """, (stats['team_id'], stats['season'], stats.get('games_played'),
                  stats.get('wins'), stats.get('losses'), stats.get('win_pct'),
                  stats.get('pts_per_game'), stats.get('fg_pct'), stats.get('fg3_pct'),
                  stats.get('ft_pct'), stats.get('reb_per_game'), stats.get('ast_per_game'),
                  stats.get('tov_per_game')), fetch=False)
        else:
            execute_query("""
                INSERT OR REPLACE INTO team_stats
                (team_id, season, games_played, wins, losses, win_pct,
                 pts_per_game, fg_pct, fg3_pct, ft_pct, reb_per_game,
                 ast_per_game, tov_per_game)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (stats['team_id'], stats['season'], stats.get('games_played'),
                  stats.get('wins'), stats.get('losses'), stats.get('win_pct'),
                  stats.get('pts_per_game'), stats.get('fg_pct'), stats.get('fg3_pct'),
                  stats.get('ft_pct'), stats.get('reb_per_game'), stats.get('ast_per_game'),
                  stats.get('tov_per_game')), fetch=False)
    except Exception as e:
        print(f"Error storing team stats: {e}")


def fetch_schedule(date: str) -> pd.DataFrame:
    """
    Fetch games scheduled for a specific date.

    Args:
        date: Date string in format 'YYYY-MM-DD'

    Returns:
        DataFrame with scheduled games
    """
    try:
        # Convert date format for API
        date_obj = datetime.strptime(date, '%Y-%m-%d')
        game_date = date_obj.strftime('%m/%d/%Y')

        scoreboard = scoreboardv2.ScoreboardV2(game_date=game_date)
        time.sleep(API_DELAY)

        games_df = scoreboard.get_data_frames()[0]  # GameHeader

        if games_df.empty:
            return pd.DataFrame()

        # Store in schedule table
        for _, row in games_df.iterrows():
            game_id = row['GAME_ID']
            home_team_id = row['HOME_TEAM_ID']
            away_team_id = row['VISITOR_TEAM_ID']
            game_status = row.get('GAME_STATUS_TEXT', 'Scheduled')

            if IS_CLOUD:
                execute_query("""
                    INSERT INTO schedule
                    (game_id, game_date, home_team_id, away_team_id, status)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (game_id) DO UPDATE SET
                        game_date = EXCLUDED.game_date,
                        home_team_id = EXCLUDED.home_team_id,
                        away_team_id = EXCLUDED.away_team_id,
                        status = EXCLUDED.status
                """, (game_id, date, home_team_id, away_team_id, game_status), fetch=False)
            else:
                execute_query("""
                    INSERT OR REPLACE INTO schedule
                    (game_id, game_date, home_team_id, away_team_id, status)
                    VALUES (?, ?, ?, ?, ?)
                """, (game_id, date, home_team_id, away_team_id, game_status), fetch=False)

        return games_df

    except Exception as e:
        print(f"Error fetching schedule for {date}: {e}")
        return pd.DataFrame()


def fetch_recent_team_games(team_id: int, num_games: int = 10) -> pd.DataFrame:
    """
    Fetch recent games for a specific team.

    Args:
        team_id: NBA team ID
        num_games: Number of recent games to fetch

    Returns:
        DataFrame with recent game results
    """
    try:
        season = get_current_season()
        game_log = teamgamelog.TeamGameLog(
            team_id=team_id,
            season=season,
            season_type_all_star='Regular Season'
        )
        time.sleep(API_DELAY)

        df = game_log.get_data_frames()[0]
        return df.head(num_games)

    except Exception as e:
        print(f"Error fetching recent games for team {team_id}: {e}")
        return pd.DataFrame()


def update_database(seasons: Optional[List[str]] = None, progress_callback=None):
    """
    Full database update - fetch all required data.

    Args:
        seasons: List of seasons to fetch. Defaults to current and previous 2 seasons.
        progress_callback: Optional callback function for progress updates
    """
    if seasons is None:
        current = get_current_season()
        year = int(current.split('-')[0])
        seasons = [
            current,
            f"{year-1}-{str(year)[-2:]}",
            f"{year-2}-{str(year-1)[-2:]}"
        ]

    # Initialize database
    init_database()

    # Step 1: Fetch teams
    if progress_callback:
        progress_callback("Fetching team information...")
    teams_df = fetch_all_teams()

    # Step 2: Fetch games for each season
    for i, season in enumerate(seasons):
        if progress_callback:
            progress_callback(f"Fetching games for season {season}...")

        games_df = fetch_game_logs(season)
        process_and_store_games(games_df, season)

    # Step 3: Fetch team stats
    if progress_callback:
        progress_callback("Fetching team statistics...")

    current_season = get_current_season()
    for _, team in teams_df.iterrows():
        team_id = team['team_id']
        stats = fetch_team_advanced_stats(team_id, current_season)
        store_team_stats(stats)

    # Step 4: Fetch today's and tomorrow's schedule
    if progress_callback:
        progress_callback("Fetching schedule...")

    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

    fetch_schedule(today)
    fetch_schedule(tomorrow)

    if progress_callback:
        progress_callback("Database update complete!")

    print("Database update complete!")


def get_scheduled_games(date: str) -> pd.DataFrame:
    """
    Get scheduled games for a date from database.

    Args:
        date: Date string in format 'YYYY-MM-DD'

    Returns:
        DataFrame with scheduled games and team info
    """
    from .database import read_sql

    query = """
        SELECT
            s.game_id,
            s.game_date,
            s.game_time,
            s.status,
            s.home_team_id,
            s.away_team_id,
            ht.abbreviation as home_abbr,
            ht.full_name as home_name,
            at.abbreviation as away_abbr,
            at.full_name as away_name
        FROM schedule s
        JOIN teams ht ON s.home_team_id = ht.team_id
        JOIN teams at ON s.away_team_id = at.team_id
        WHERE s.game_date = ?
    """

    return read_sql(query, params=(date,))


def get_historical_games(start_date: str, end_date: str) -> pd.DataFrame:
    """
    Get historical games within a date range from database.

    Args:
        start_date: Start date string 'YYYY-MM-DD'
        end_date: End date string 'YYYY-MM-DD'

    Returns:
        DataFrame with historical games
    """
    from .database import read_sql

    query = """
        SELECT
            g.*,
            ht.abbreviation as home_abbr,
            ht.full_name as home_name,
            at.abbreviation as away_abbr,
            at.full_name as away_name
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.team_id
        JOIN teams at ON g.away_team_id = at.team_id
        WHERE g.game_date BETWEEN ? AND ?
        ORDER BY g.game_date DESC
    """

    return read_sql(query, params=(start_date, end_date))


def fix_home_win_values():
    """
    Fix home_win values in the database by recalculating from scores.
    Run this if home_win values are all 0.
    """
    from .database import read_sql, execute_query, IS_CLOUD

    print("Checking current home_win distribution...")
    result = read_sql("SELECT home_win, COUNT(*) as cnt FROM games GROUP BY home_win")
    print(f"Current distribution: {result.to_dict()}")

    print("Fixing home_win values from scores...")

    if IS_CLOUD:
        # PostgreSQL: Update all at once
        execute_query("""
            UPDATE games
            SET home_win = CASE WHEN home_score > away_score THEN 1 ELSE 0 END
            WHERE home_score IS NOT NULL AND away_score IS NOT NULL
        """, fetch=False)
    else:
        # SQLite
        execute_query("""
            UPDATE games
            SET home_win = CASE WHEN home_score > away_score THEN 1 ELSE 0 END
            WHERE home_score IS NOT NULL AND away_score IS NOT NULL
        """, fetch=False)

    print("Verifying fix...")
    result = read_sql("SELECT home_win, COUNT(*) as cnt FROM games GROUP BY home_win")
    print(f"After fix distribution: {result.to_dict()}")

    return result


if __name__ == "__main__":
    # Run a full database update
    print("Starting full database update...")
    update_database()
