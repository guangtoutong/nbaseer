"""
Odds Collector Module.
Fetches betting odds from API or allows manual input.
Supports: API-Sports, The Odds API, or manual input.
"""

import os
import requests
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import pandas as pd

from .utils import get_db_connection, american_to_implied_prob


# API Configuration - supports multiple providers
ODDS_API_BASE_URL = "https://api.the-odds-api.com/v4"
SPORT_KEY = "basketball_nba"

# API-Sports Configuration
API_SPORTS_BASE_URL = "https://v1.basketball.api-sports.io"
API_SPORTS_NBA_LEAGUE = 12  # NBA league ID in API-Sports


def get_api_key() -> Optional[str]:
    """Get API key from environment variable."""
    return os.environ.get('ODDS_API_KEY')


def get_api_sports_key() -> Optional[str]:
    """Get API-Sports key from environment variable."""
    return os.environ.get('API_SPORTS_KEY')


# ============== API-Sports Functions ==============

def fetch_api_sports_games(date: str, api_key: Optional[str] = None) -> Dict:
    """
    Fetch NBA games from API-Sports for a specific date.

    Args:
        date: Date string 'YYYY-MM-DD'
        api_key: API key (uses env var if not provided)

    Returns:
        Dictionary with games data
    """
    if api_key is None:
        api_key = get_api_sports_key()

    if api_key is None:
        return {'error': 'No API key. Set API_SPORTS_KEY environment variable.'}

    url = f"{API_SPORTS_BASE_URL}/games"

    headers = {
        'x-apisports-key': api_key
    }

    params = {
        'date': date,
        'league': API_SPORTS_NBA_LEAGUE,
        'season': '2024-2025'  # Current NBA season
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()

        # Get remaining requests from response
        remaining = data.get('results', 0)

        return {
            'games': data.get('response', []),
            'results': remaining,
            'errors': data.get('errors', [])
        }

    except requests.exceptions.RequestException as e:
        return {'error': str(e)}


def fetch_api_sports_odds(game_id: int, api_key: Optional[str] = None) -> Dict:
    """
    Fetch odds for a specific game from API-Sports.

    Args:
        game_id: API-Sports game ID
        api_key: API key

    Returns:
        Dictionary with odds data
    """
    if api_key is None:
        api_key = get_api_sports_key()

    if api_key is None:
        return {'error': 'No API key. Set API_SPORTS_KEY environment variable.'}

    url = f"{API_SPORTS_BASE_URL}/odds"

    headers = {
        'x-apisports-key': api_key
    }

    params = {
        'game': game_id
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()

        return {
            'odds': data.get('response', []),
            'errors': data.get('errors', [])
        }

    except requests.exceptions.RequestException as e:
        return {'error': str(e)}


def fetch_api_sports_odds_by_date(date: str, api_key: Optional[str] = None) -> Dict:
    """
    Fetch all NBA odds for a specific date from API-Sports.

    Args:
        date: Date string 'YYYY-MM-DD'
        api_key: API key

    Returns:
        Dictionary with all odds for the date
    """
    if api_key is None:
        api_key = get_api_sports_key()

    if api_key is None:
        return {'error': 'No API key. Set API_SPORTS_KEY environment variable.'}

    # First get games for this date
    games_result = fetch_api_sports_games(date, api_key)

    if 'error' in games_result:
        return games_result

    games = games_result.get('games', [])

    if not games:
        return {'games': [], 'message': 'No games found for this date'}

    all_odds = []

    for game in games:
        game_id = game.get('id')
        home_team = game.get('teams', {}).get('home', {}).get('name', '')
        away_team = game.get('teams', {}).get('away', {}).get('name', '')

        # Fetch odds for this game
        odds_result = fetch_api_sports_odds(game_id, api_key)

        if 'error' not in odds_result and odds_result.get('odds'):
            for odds_data in odds_result['odds']:
                bookmakers = odds_data.get('bookmakers', [])

                for bookie in bookmakers:
                    bookie_name = bookie.get('name', 'unknown')

                    for bet in bookie.get('bets', []):
                        bet_name = bet.get('name', '')

                        odds_entry = {
                            'game_id': game_id,
                            'home_team': home_team,
                            'away_team': away_team,
                            'bookmaker': bookie_name
                        }

                        # Parse different bet types
                        if bet_name == 'Home/Away':
                            # Moneyline
                            for value in bet.get('values', []):
                                if value.get('value') == 'Home':
                                    odds_entry['home_ml'] = decimal_to_american(float(value.get('odd', 0)))
                                elif value.get('value') == 'Away':
                                    odds_entry['away_ml'] = decimal_to_american(float(value.get('odd', 0)))

                        elif bet_name == 'Asian Handicap' or 'Handicap' in bet_name:
                            # Spread/Handicap
                            for value in bet.get('values', []):
                                handicap = value.get('value', '')
                                if 'Home' in str(handicap):
                                    try:
                                        odds_entry['home_spread'] = float(handicap.replace('Home ', ''))
                                        odds_entry['home_spread_odds'] = decimal_to_american(float(value.get('odd', 0)))
                                    except:
                                        pass
                                elif 'Away' in str(handicap):
                                    try:
                                        odds_entry['away_spread'] = float(handicap.replace('Away ', ''))
                                        odds_entry['away_spread_odds'] = decimal_to_american(float(value.get('odd', 0)))
                                    except:
                                        pass

                        elif 'Over/Under' in bet_name or 'Total' in bet_name:
                            # Total points
                            for value in bet.get('values', []):
                                val = value.get('value', '')
                                if 'Over' in str(val):
                                    try:
                                        odds_entry['total_line'] = float(val.replace('Over ', ''))
                                        odds_entry['over_odds'] = decimal_to_american(float(value.get('odd', 0)))
                                    except:
                                        pass
                                elif 'Under' in str(val):
                                    try:
                                        odds_entry['under_odds'] = decimal_to_american(float(value.get('odd', 0)))
                                    except:
                                        pass

                        if any(k in odds_entry for k in ['home_ml', 'home_spread', 'total_line']):
                            all_odds.append(odds_entry)

    return {
        'games': all_odds,
        'game_count': len(games)
    }


def decimal_to_american(decimal_odds: float) -> int:
    """Convert decimal odds to American odds."""
    if decimal_odds >= 2.0:
        return int((decimal_odds - 1) * 100)
    else:
        return int(-100 / (decimal_odds - 1))


def parse_api_sports_odds(odds_data: Dict) -> pd.DataFrame:
    """
    Parse API-Sports odds data into DataFrame.

    Args:
        odds_data: Raw data from API-Sports

    Returns:
        DataFrame with parsed odds
    """
    if 'error' in odds_data:
        print(f"Error in odds data: {odds_data['error']}")
        return pd.DataFrame()

    games = odds_data.get('games', [])
    if not games:
        return pd.DataFrame()

    return pd.DataFrame(games)


def fetch_and_store_api_sports_odds(api_key: Optional[str] = None) -> Dict:
    """
    Fetch odds from API-Sports and store in database.

    Args:
        api_key: API key (optional, uses env var)

    Returns:
        Dictionary with status
    """
    from .data_collector import get_scheduled_games

    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

    results = []

    for date in [today, tomorrow]:
        result = fetch_api_sports_odds_by_date(date, api_key)

        if 'error' in result:
            return result

        odds_df = parse_api_sports_odds(result)

        if not odds_df.empty:
            schedule = get_scheduled_games(date)
            if not schedule.empty:
                store_api_sports_odds(odds_df, schedule)
                results.append(f"{date}: {len(odds_df)} odds entries")

    return {
        'status': 'success',
        'details': results
    }


def store_api_sports_odds(odds_df: pd.DataFrame, schedule_df: pd.DataFrame):
    """Store API-Sports odds in database."""
    if odds_df.empty or schedule_df.empty:
        return

    conn = get_db_connection()

    # Team name mapping (API-Sports uses different names)
    teams_df = pd.read_sql("SELECT team_id, full_name, nickname FROM teams", conn)

    # Create flexible matching
    def find_team_id(name):
        name_lower = name.lower()
        for _, row in teams_df.iterrows():
            if (name_lower in row['full_name'].lower() or
                row['full_name'].lower() in name_lower or
                (row['nickname'] and name_lower in row['nickname'].lower())):
                return row['team_id']
        return None

    for _, row in odds_df.iterrows():
        home_team = row.get('home_team', '')
        away_team = row.get('away_team', '')

        home_id = find_team_id(home_team)
        away_id = find_team_id(away_team)

        if home_id is None or away_id is None:
            continue

        # Find matching game
        match = schedule_df[
            (schedule_df['home_team_id'] == home_id) &
            (schedule_df['away_team_id'] == away_id)
        ]

        if match.empty:
            continue

        game_id = match['game_id'].iloc[0]

        try:
            # Delete old odds for this game
            conn.execute("DELETE FROM odds WHERE game_id = ?", (game_id,))

            conn.execute("""
                INSERT INTO odds
                (game_id, bookmaker, market_type, home_odds, away_odds,
                 spread_line, total_line)
                VALUES (?, ?, 'all', ?, ?, ?, ?)
            """, (
                game_id,
                row.get('bookmaker', 'api-sports'),
                row.get('home_ml'),
                row.get('away_ml'),
                row.get('home_spread'),
                row.get('total_line')
            ))
        except Exception as e:
            print(f"Error storing odds: {e}")

    conn.commit()
    conn.close()


# ============== End API-Sports Functions ==============


def save_manual_odds(
    game_id: str,
    home_ml: Optional[float] = None,
    away_ml: Optional[float] = None,
    spread: Optional[float] = None,
    total: Optional[float] = None
) -> bool:
    """
    Manually save odds for a game.

    Args:
        game_id: Game ID from schedule
        home_ml: Home team moneyline (American odds, e.g., -150)
        away_ml: Away team moneyline (American odds, e.g., +130)
        spread: Point spread for home team (e.g., -5.5)
        total: Over/under total points line (e.g., 225.5)

    Returns:
        True if saved successfully
    """
    conn = get_db_connection()

    try:
        # Delete existing odds for this game
        conn.execute("DELETE FROM odds WHERE game_id = ?", (game_id,))

        # Insert new odds
        conn.execute("""
            INSERT INTO odds
            (game_id, bookmaker, market_type, home_odds, away_odds,
             spread_line, total_line)
            VALUES (?, 'manual', 'all', ?, ?, ?, ?)
        """, (game_id, home_ml, away_ml, spread, total))

        conn.commit()
        conn.close()
        return True

    except Exception as e:
        print(f"Error saving manual odds: {e}")
        conn.close()
        return False


def get_manual_odds(game_id: str) -> Dict:
    """
    Get manually entered odds for a game.

    Args:
        game_id: Game ID

    Returns:
        Dictionary with odds data
    """
    conn = get_db_connection()

    query = """
        SELECT home_odds, away_odds, spread_line, total_line
        FROM odds
        WHERE game_id = ?
        ORDER BY fetched_at DESC
        LIMIT 1
    """

    result = pd.read_sql(query, conn, params=(game_id,))
    conn.close()

    if result.empty:
        return {}

    row = result.iloc[0]
    return {
        'home_ml': row['home_odds'],
        'away_ml': row['away_odds'],
        'spread': row['spread_line'],
        'total': row['total_line']
    }


def fetch_odds(
    api_key: Optional[str] = None,
    markets: List[str] = None,
    regions: str = 'us',
    bookmakers: Optional[List[str]] = None
) -> Dict:
    """
    Fetch current NBA odds from The Odds API.

    Args:
        api_key: API key (uses env var if not provided)
        markets: List of markets to fetch ('h2h', 'spreads', 'totals')
        regions: Region for odds format ('us', 'eu', 'uk', 'au')
        bookmakers: List of specific bookmakers (optional)

    Returns:
        Dictionary with odds data and remaining quota info
    """
    if api_key is None:
        api_key = get_api_key()

    if api_key is None:
        return {'error': 'No API key provided. Set ODDS_API_KEY environment variable.'}

    if markets is None:
        markets = ['h2h', 'spreads', 'totals']

    url = f"{ODDS_API_BASE_URL}/sports/{SPORT_KEY}/odds"

    params = {
        'apiKey': api_key,
        'regions': regions,
        'markets': ','.join(markets),
        'oddsFormat': 'american'
    }

    if bookmakers:
        params['bookmakers'] = ','.join(bookmakers)

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()

        data = response.json()

        # Get quota info from headers
        remaining = response.headers.get('x-requests-remaining', 'Unknown')
        used = response.headers.get('x-requests-used', 'Unknown')

        return {
            'games': data,
            'requests_remaining': remaining,
            'requests_used': used
        }

    except requests.exceptions.RequestException as e:
        return {'error': str(e)}


def parse_odds_data(odds_data: Dict) -> pd.DataFrame:
    """
    Parse raw odds data into a structured DataFrame.

    Args:
        odds_data: Raw data from The Odds API

    Returns:
        DataFrame with parsed odds
    """
    if 'error' in odds_data:
        print(f"Error in odds data: {odds_data['error']}")
        return pd.DataFrame()

    games = odds_data.get('games', [])
    if not games:
        return pd.DataFrame()

    parsed_games = []

    for game in games:
        game_id = game.get('id')
        commence_time = game.get('commence_time')
        home_team = game.get('home_team')
        away_team = game.get('away_team')

        bookmakers = game.get('bookmakers', [])

        for bookmaker in bookmakers:
            bookmaker_name = bookmaker.get('key')
            markets = bookmaker.get('markets', [])

            game_odds = {
                'api_game_id': game_id,
                'commence_time': commence_time,
                'home_team': home_team,
                'away_team': away_team,
                'bookmaker': bookmaker_name
            }

            for market in markets:
                market_key = market.get('key')
                outcomes = market.get('outcomes', [])

                if market_key == 'h2h':
                    # Moneyline odds
                    for outcome in outcomes:
                        if outcome.get('name') == home_team:
                            game_odds['home_ml'] = outcome.get('price')
                        elif outcome.get('name') == away_team:
                            game_odds['away_ml'] = outcome.get('price')

                elif market_key == 'spreads':
                    # Point spread
                    for outcome in outcomes:
                        if outcome.get('name') == home_team:
                            game_odds['home_spread'] = outcome.get('point')
                            game_odds['home_spread_odds'] = outcome.get('price')
                        elif outcome.get('name') == away_team:
                            game_odds['away_spread'] = outcome.get('point')
                            game_odds['away_spread_odds'] = outcome.get('price')

                elif market_key == 'totals':
                    # Over/Under
                    for outcome in outcomes:
                        if outcome.get('name') == 'Over':
                            game_odds['total_line'] = outcome.get('point')
                            game_odds['over_odds'] = outcome.get('price')
                        elif outcome.get('name') == 'Under':
                            game_odds['under_odds'] = outcome.get('price')

            parsed_games.append(game_odds)

    return pd.DataFrame(parsed_games)


def get_best_odds(odds_df: pd.DataFrame) -> pd.DataFrame:
    """
    Get best odds across all bookmakers for each game.

    Args:
        odds_df: DataFrame with odds from multiple bookmakers

    Returns:
        DataFrame with best odds per game
    """
    if odds_df.empty:
        return pd.DataFrame()

    best_odds = []

    for (home, away), group in odds_df.groupby(['home_team', 'away_team']):
        best = {
            'home_team': home,
            'away_team': away,
            'commence_time': group['commence_time'].iloc[0]
        }

        # Best moneyline (highest odds = best for bettor)
        if 'home_ml' in group.columns:
            best['best_home_ml'] = group['home_ml'].max()
            best['best_away_ml'] = group['away_ml'].max()

        # Best spread (most favorable line + best odds)
        if 'home_spread' in group.columns:
            # For home team: highest spread is best (e.g., -3 better than -5)
            best_home_spread_idx = group['home_spread'].idxmax()
            best['home_spread'] = group.loc[best_home_spread_idx, 'home_spread']
            best['home_spread_odds'] = group.loc[best_home_spread_idx, 'home_spread_odds']

            best_away_spread_idx = group['away_spread'].idxmax()
            best['away_spread'] = group.loc[best_away_spread_idx, 'away_spread']
            best['away_spread_odds'] = group.loc[best_away_spread_idx, 'away_spread_odds']

        # Best total (use consensus line and best odds)
        if 'total_line' in group.columns:
            # Most common total line
            best['total_line'] = group['total_line'].mode().iloc[0] if len(group['total_line'].mode()) > 0 else group['total_line'].mean()
            best['best_over_odds'] = group['over_odds'].max()
            best['best_under_odds'] = group['under_odds'].max()

        best_odds.append(best)

    return pd.DataFrame(best_odds)


def calculate_implied_probabilities(odds_df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate implied probabilities from odds.

    Args:
        odds_df: DataFrame with odds

    Returns:
        DataFrame with added implied probability columns
    """
    df = odds_df.copy()

    # Moneyline implied probabilities
    if 'home_ml' in df.columns:
        df['home_implied_prob'] = df['home_ml'].apply(
            lambda x: american_to_implied_prob(x) if pd.notna(x) else None
        )
        df['away_implied_prob'] = df['away_ml'].apply(
            lambda x: american_to_implied_prob(x) if pd.notna(x) else None
        )

    return df


def store_odds(odds_df: pd.DataFrame, schedule_df: pd.DataFrame):
    """
    Store odds in database, matching with scheduled games.

    Args:
        odds_df: DataFrame with odds data
        schedule_df: DataFrame with scheduled games
    """
    if odds_df.empty or schedule_df.empty:
        return

    conn = get_db_connection()

    # Create team name to ID mapping
    teams_df = pd.read_sql("SELECT team_id, full_name FROM teams", conn)
    team_name_to_id = dict(zip(teams_df['full_name'], teams_df['team_id']))

    for _, row in odds_df.iterrows():
        home_team = row['home_team']
        away_team = row['away_team']

        # Match to scheduled game
        home_id = team_name_to_id.get(home_team)
        away_id = team_name_to_id.get(away_team)

        if home_id is None or away_id is None:
            continue

        # Find matching game in schedule
        match = schedule_df[
            (schedule_df['home_team_id'] == home_id) &
            (schedule_df['away_team_id'] == away_id)
        ]

        if match.empty:
            continue

        game_id = match['game_id'].iloc[0]

        try:
            conn.execute("""
                INSERT INTO odds
                (game_id, bookmaker, market_type, home_odds, away_odds,
                 spread_line, spread_home_odds, spread_away_odds,
                 total_line, over_odds, under_odds)
                VALUES (?, ?, 'all', ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                game_id,
                row.get('bookmaker', 'consensus'),
                row.get('home_ml'),
                row.get('away_ml'),
                row.get('home_spread'),
                row.get('home_spread_odds'),
                row.get('away_spread_odds'),
                row.get('total_line'),
                row.get('over_odds'),
                row.get('under_odds')
            ))
        except Exception as e:
            print(f"Error storing odds: {e}")

    conn.commit()
    conn.close()


def get_stored_odds(game_id: str) -> pd.DataFrame:
    """
    Get stored odds for a specific game.

    Args:
        game_id: Game ID

    Returns:
        DataFrame with odds data
    """
    conn = get_db_connection()

    query = """
        SELECT * FROM odds
        WHERE game_id = ?
        ORDER BY fetched_at DESC
    """

    df = pd.read_sql(query, conn, params=(game_id,))
    conn.close()

    return df


def fetch_and_store_current_odds(api_key: Optional[str] = None) -> Dict:
    """
    Fetch current odds and store in database.

    Args:
        api_key: API key (optional, uses env var)

    Returns:
        Dictionary with status and quota info
    """
    # Fetch odds
    result = fetch_odds(api_key)

    if 'error' in result:
        return result

    # Parse odds
    odds_df = parse_odds_data(result)

    if odds_df.empty:
        return {'status': 'No games found', **result}

    # Get schedule to match games
    from .data_collector import get_scheduled_games
    from datetime import datetime, timedelta

    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

    schedule_today = get_scheduled_games(today)
    schedule_tomorrow = get_scheduled_games(tomorrow)

    schedule = pd.concat([schedule_today, schedule_tomorrow], ignore_index=True)

    # Store odds
    store_odds(odds_df, schedule)

    return {
        'status': 'success',
        'games_fetched': len(odds_df['home_team'].unique()),
        'requests_remaining': result.get('requests_remaining'),
        'requests_used': result.get('requests_used')
    }


def get_odds_for_display(date: str) -> pd.DataFrame:
    """
    Get odds formatted for display in the app.

    Args:
        date: Date string 'YYYY-MM-DD'

    Returns:
        DataFrame with odds ready for display
    """
    from .database import read_sql, IS_CLOUD

    # Use DISTINCT ON for PostgreSQL, or simple query for SQLite
    if IS_CLOUD:
        query = """
            SELECT DISTINCT ON (s.game_id)
                s.game_id,
                s.game_date,
                ht.full_name as home_team,
                at.full_name as away_team,
                o.home_odds as home_ml,
                o.away_odds as away_ml,
                o.spread_line as spread,
                o.total_line as total,
                o.over_odds,
                o.under_odds,
                o.fetched_at
            FROM schedule s
            JOIN teams ht ON s.home_team_id = ht.team_id
            JOIN teams at ON s.away_team_id = at.team_id
            LEFT JOIN odds o ON s.game_id = o.game_id
            WHERE s.game_date = ?
            ORDER BY s.game_id, o.fetched_at DESC NULLS LAST
        """
    else:
        query = """
            SELECT
                s.game_id,
                s.game_date,
                ht.full_name as home_team,
                at.full_name as away_team,
                o.home_odds as home_ml,
                o.away_odds as away_ml,
                o.spread_line as spread,
                o.total_line as total,
                o.over_odds,
                o.under_odds,
                o.fetched_at
            FROM schedule s
            JOIN teams ht ON s.home_team_id = ht.team_id
            JOIN teams at ON s.away_team_id = at.team_id
            LEFT JOIN odds o ON s.game_id = o.game_id
            WHERE s.game_date = ?
            GROUP BY s.game_id
        """

    df = read_sql(query, params=(date,))

    # Calculate implied probabilities
    if not df.empty and 'home_ml' in df.columns:
        df = calculate_implied_probabilities(df)

    return df


if __name__ == "__main__":
    # Test fetching odds
    print("Fetching NBA odds...")
    result = fetch_odds()

    if 'error' not in result:
        odds_df = parse_odds_data(result)
        print(f"\nFetched odds for {len(odds_df['home_team'].unique())} games")
        print(f"Requests remaining: {result['requests_remaining']}")

        if not odds_df.empty:
            best = get_best_odds(odds_df)
            print("\nBest odds per game:")
            print(best[['home_team', 'away_team', 'best_home_ml', 'best_away_ml']].to_string())
    else:
        print(f"Error: {result['error']}")
