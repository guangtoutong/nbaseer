"""
NBAseer - NBA Prediction System
NBA先知 - NBA比赛预测系统

Main Streamlit Application with bilingual support.
Public frontend for predictions, admin backend for management.
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import os
import sys

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.utils import init_database, DB_PATH, get_chinese_name, load_api_key
from src.data_collector import fetch_schedule, get_scheduled_games
from src.models import NBAPredictor
from src.predictor import GamePredictor
from src.i18n import Translator, LANGUAGES
from src.styles import COMMON_CSS

# Page configuration
st.set_page_config(
    page_title="NBAseer | NBA先知",
    page_icon="🏀",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# PWA Meta Tags + AdSense Script
st.markdown("""
<link rel="manifest" href="/static/manifest.json">
<meta name="theme-color" content="#1e3a5f">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="NBAseer">
<meta name="description" content="NBA Game Prediction System - Data Insights, Game Predictions">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7786364053868586" crossorigin="anonymous"></script>
""", unsafe_allow_html=True)

# Apply shared styles
st.markdown(COMMON_CSS, unsafe_allow_html=True)


def init_session_state():
    """Initialize session state variables."""
    if 'lang' not in st.session_state:
        # Check URL query parameter for language
        query_lang = st.query_params.get('lang', 'zh')
        st.session_state.lang = query_lang if query_lang in ['zh', 'en'] else 'zh'
    if 'selected_date' not in st.session_state:
        st.session_state.selected_date = datetime.now().date()


def render_header(t: Translator):
    """Render the branded header with language switcher."""
    # Brand header with gradient background
    lang = st.session_state.lang
    lang_toggle = "EN" if lang == 'zh' else "中"

    st.markdown(f"""
    <div class="brand-header">
        <div class="brand-logo">🏀 {t('brand_name')}</div>
        <div class="brand-slogan">{t('brand_slogan')}</div>
    </div>
    """, unsafe_allow_html=True)

    # Language toggle button (compact)
    col1, col2, col3 = st.columns([1, 4, 1])
    with col3:
        if st.button(f"🌐 {lang_toggle}", key="lang_toggle", help="Switch language"):
            st.session_state.lang = 'en' if lang == 'zh' else 'zh'
            st.rerun()


def render_date_navigation(t: Translator):
    """Render date navigation."""
    col1, col2, col3, col4, col5 = st.columns([1, 1, 2, 1, 1])

    with col1:
        if st.button("◀️", help="Previous day"):
            st.session_state.selected_date -= timedelta(days=1)
            st.rerun()

    with col2:
        if st.button(t('today_games').split()[0] if st.session_state.lang == 'en' else "今日"):
            st.session_state.selected_date = datetime.now().date()
            st.rerun()

    with col3:
        new_date = st.date_input(
            t('select_date'),
            value=st.session_state.selected_date,
            label_visibility="collapsed"
        )
        if new_date != st.session_state.selected_date:
            st.session_state.selected_date = new_date
            st.rerun()

    with col4:
        if st.button("Tomorrow" if st.session_state.lang == 'en' else "明日"):
            st.session_state.selected_date = datetime.now().date() + timedelta(days=1)
            st.rerun()

    with col5:
        if st.button("▶️", help="Next day"):
            st.session_state.selected_date += timedelta(days=1)
            st.rerun()


def render_game_card(game: pd.Series, t: Translator, has_result: bool = False):
    """Render a single game prediction card - mobile optimized."""
    lang = st.session_state.lang

    # Get team names
    if lang == 'zh':
        home_name = get_chinese_name(game['home_abbr'])
        away_name = get_chinese_name(game['away_abbr'])
    else:
        home_name = game['home_abbr']
        away_name = game['away_abbr']

    # Calculate predicted scores
    predicted_total = game['predicted_total']
    predicted_spread = game['predicted_spread']
    home_pred_score = (predicted_total + predicted_spread) / 2
    away_pred_score = (predicted_total - predicted_spread) / 2

    # Determine winner and confidence
    pred_winner = home_name if game['predicted_winner'] == 'home' else away_name
    if game['confidence'] > 0.65:
        conf = t('confidence_high')
        conf_color = "#28a745"
    elif game['confidence'] > 0.55:
        conf = t('confidence_medium')
        conf_color = "#ffc107"
    else:
        conf = t('confidence_low')
        conf_color = "#dc3545"

    # Probability values
    home_prob = game['home_win_prob']
    away_prob = game['away_win_prob']

    # Spread display
    spread_team = home_name if game['predicted_spread'] > 0 else away_name
    spread_val = abs(game['predicted_spread'])

    # Get game time
    game_time = game.get('game_time', '')
    if game_time:
        # Convert to more readable format if needed
        time_display = game_time
    else:
        time_display = ''

    # Build card using Streamlit components for better rendering
    with st.container(border=True):
        # Team header with game time
        time_html = f'<div style="font-size: 0.75rem; margin-top: 0.3rem; opacity: 0.9;">⏰ {time_display}</div>' if time_display else ''
        header_html = f'''<div class="game-card-header"><div style="text-align: left;"><div class="team-name">{away_name}</div><div class="team-abbr">{game['away_abbr']}</div></div><div style="text-align: center;"><div class="vs-badge">VS</div>{time_html}</div><div style="text-align: right;"><div class="team-name">{home_name}</div><div class="team-abbr">{game['home_abbr']}</div></div></div>'''
        st.markdown(header_html, unsafe_allow_html=True)

        # Probability bar
        st.markdown(f"""
        <div class="prob-bar">
            <div class="prob-away" style="width: {away_prob*100}%;">{away_prob*100:.0f}%</div>
            <div class="prob-home" style="width: {home_prob*100}%;">{home_prob*100:.0f}%</div>
        </div>
        """, unsafe_allow_html=True)

        # Predicted score
        st.markdown(f"""
        <div class="score-display">
            <b>{away_pred_score:.0f}</b> : <b>{home_pred_score:.0f}</b>
        </div>
        """, unsafe_allow_html=True)

        # Add result if available
        if has_result and 'home_score' in game and pd.notna(game.get('home_score')):
            actual_winner = 'home' if game['actual_home_win'] == 1 else 'away'
            is_correct = game['predicted_winner'] == actual_winner

            if is_correct:
                st.markdown(f"""
                <div class="result-correct">
                    ✅ {t('prediction_correct')} | {t('actual_score')}: {int(game['away_score'])} - {int(game['home_score'])}
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="result-wrong">
                    ❌ {t('prediction_wrong')} | {t('actual_score')}: {int(game['away_score'])} - {int(game['home_score'])}
                </div>
                """, unsafe_allow_html=True)

        # Prediction metrics
        st.markdown(f"""
        <div class="pred-metrics">
            <div class="pred-item">
                <div class="pred-label">{t('predicted_winner')}</div>
                <div class="pred-value">{pred_winner}</div>
                <div class="pred-conf" style="color: {conf_color};">{conf}</div>
            </div>
            <div class="pred-item">
                <div class="pred-label">{t('predicted_spread')}</div>
                <div class="pred-value">{spread_team} +{spread_val:.1f}</div>
            </div>
            <div class="pred-item">
                <div class="pred-label">{t('predicted_total')}</div>
                <div class="pred-value">{game['predicted_total']:.1f}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)


def render_games_list(t: Translator):
    """Render the games list for selected date."""
    date_str = st.session_state.selected_date.strftime('%Y-%m-%d')

    # Check system status
    from src.database import IS_CLOUD, read_sql
    if not IS_CLOUD and not DB_PATH.exists():
        st.warning(t('not_initialized') if st.session_state.lang == 'en' else "系统未初始化，请联系管理员")
        return

    # For cloud mode, check if database has data
    if IS_CLOUD:
        try:
            check = read_sql("SELECT COUNT(*) as cnt FROM teams")
            if check.empty or check.iloc[0]['cnt'] == 0:
                st.warning(t('not_initialized') if st.session_state.lang == 'en' else "系统未初始化，请联系管理员")
                return
        except:
            st.warning(t('not_initialized') if st.session_state.lang == 'en' else "系统未初始化，请联系管理员")
            return

    if not NBAPredictor.model_exists():
        st.warning(t('not_trained') if st.session_state.lang == 'en' else "模型未训练，请联系管理员")
        return

    # Get games
    games = get_scheduled_games(date_str)

    if games.empty:
        # Try fetching
        fetch_schedule(date_str)
        games = get_scheduled_games(date_str)

    if games.empty:
        st.info(t('no_games_today') if st.session_state.selected_date == datetime.now().date()
                else f"{date_str} - " + (t('no_games_today').replace("today", "this date") if st.session_state.lang == 'en' else "没有比赛安排"))
        return

    # Get predictions
    try:
        predictor = GamePredictor()
        if predictor.is_ready():
            predictions = predictor.predict_games(date_str)
            predictions = predictor.compare_with_odds(predictions, date_str)

            # Check if we have results
            comparison = predictor.get_predictions_with_results(date_str)
            has_results = not comparison.empty

            if has_results:
                # Merge with results
                predictions = predictions.merge(
                    comparison[['game_id', 'home_score', 'away_score', 'actual_home_win', 'spread_error', 'total_error']],
                    on='game_id',
                    how='left'
                )

            # Display header with relative date indicator
            today = datetime.now().date()
            selected = st.session_state.selected_date
            if selected == today:
                date_label = "Today" if st.session_state.lang == 'en' else "今天"
            elif selected == today + timedelta(days=1):
                date_label = "Tomorrow" if st.session_state.lang == 'en' else "明天"
            elif selected == today - timedelta(days=1):
                date_label = "Yesterday" if st.session_state.lang == 'en' else "昨天"
            else:
                date_label = ""

            header_text = f"📅 {date_str}"
            if date_label:
                header_text += f" ({date_label})"
            header_text += f" - {t('games_count', count=len(predictions))}"
            st.subheader(header_text)

            # Display games with inline ads every 4 games
            for idx, (_, game) in enumerate(predictions.iterrows()):
                render_game_card(game, t, has_results)

                # Insert inline ad every 4 games
                if (idx + 1) % 4 == 0 and idx < len(predictions) - 1:
                    render_ad_slot("inline")

        else:
            st.warning(t('not_trained') if st.session_state.lang == 'en' else "模型未准备好")

    except Exception as e:
        st.error(f"{t('error')}: {e}")


def render_ad_slot(slot_id: str = "header"):
    """Render Google AdSense ad slot.

    Ad slots:
    - header: Below brand header (728x90 or responsive)
    - inline: Between game cards (300x250 or responsive)
    - footer: Above footer (728x90 or responsive)
    """
    # Load AdSense settings from config
    ad_client = load_api_key('ADSENSE_CLIENT') or ''

    # Load slot IDs from config
    slot_keys = {
        'header': 'ADSENSE_SLOT_HEADER',
        'inline': 'ADSENSE_SLOT_INLINE',
        'footer': 'ADSENSE_SLOT_FOOTER',
    }
    ad_slot = load_api_key(slot_keys.get(slot_id, 'ADSENSE_SLOT_INLINE')) or ''

    # Only show ads if configured with real publisher ID
    if ad_client and ad_client.startswith('ca-pub-') and not ad_client.startswith('ca-pub-XXXX'):
        # Production AdSense code
        st.markdown(f"""
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="{ad_client}"
             data-ad-slot="{ad_slot}"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({{}});</script>
        """, unsafe_allow_html=True)
    # No placeholder in production - ads just don't show if not configured


def render_footer(t: Translator):
    """Render the page footer."""
    st.markdown(f"""
    <div class="footer">
        <p>{t('disclaimer')}</p>
        <p>{t('copyright')}</p>
    </div>
    """, unsafe_allow_html=True)


def render_history_stats(t: Translator):
    """Render simplified history stats view."""
    lang = st.session_state.lang

    try:
        predictor = GamePredictor()
        comparison = predictor.get_predictions_with_results()
        stats = predictor.get_accuracy_stats()
    except Exception as e:
        st.error(f"{t('error')}: {e}")
        return

    if comparison.empty:
        st.info("No prediction history yet" if lang == 'en' else "暂无预测历史")
        return

    # Overall stats
    st.subheader("📊 " + (t('accuracy_stats')))

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        accuracy = stats.get('win_accuracy', 0)
        st.metric(
            t('win_accuracy'),
            f"{accuracy*100:.1f}%",
            f"{(accuracy - 0.524)*100:+.1f}%"
        )

    with col2:
        st.metric(t('spread_mae'), f"{stats.get('spread_mae', 0):.1f}")

    with col3:
        st.metric(t('total_mae'), f"{stats.get('total_mae', 0):.1f}")

    with col4:
        st.metric(t('total_predictions'), f"{stats.get('total_predictions', 0)}")

    st.divider()

    # Recent results by date
    st.subheader("📅 " + ("Recent Results" if lang == 'en' else "近期结果"))

    comparison['game_date'] = pd.to_datetime(comparison['game_date'])
    dates = comparison['game_date'].dt.date.unique()
    dates = sorted(dates, reverse=True)[:7]  # Last 7 days

    for date in dates:
        date_games = comparison[comparison['game_date'].dt.date == date]
        date_str = date.strftime('%Y-%m-%d')

        daily_correct = date_games['win_correct'].sum()
        daily_total = len(date_games)
        daily_accuracy = daily_correct / daily_total if daily_total > 0 else 0

        with st.expander(f"📅 {date_str} - {daily_correct}/{daily_total} ({daily_accuracy*100:.0f}%)",
                         expanded=(date == dates[0])):
            for _, game in date_games.iterrows():
                # Get team names
                if lang == 'zh':
                    home_name = get_chinese_name(game['home_abbr'])
                    away_name = get_chinese_name(game['away_abbr'])
                else:
                    home_name = game['home_abbr']
                    away_name = game['away_abbr']

                is_correct = game['win_correct'] == 1
                icon = "✅" if is_correct else "❌"

                st.markdown(f"""
                <div style="padding: 0.5rem; margin: 0.3rem 0; border-radius: 5px;
                            background: {'#d4edda' if is_correct else '#f8d7da'};">
                    <b>{icon} {away_name} @ {home_name}</b><br>
                    <span style="font-size: 0.85rem;">
                        {t('actual_score')}: {int(game['away_score'])} - {int(game['home_score'])} |
                        {t('predicted_spread')}: {game['predicted_spread']:+.1f}
                    </span>
                </div>
                """, unsafe_allow_html=True)


def main():
    """Main application entry point."""
    init_session_state()

    # Create translator
    t = Translator(st.session_state.lang)

    # Render page
    render_header(t)

    # Header ad slot
    render_ad_slot("header")

    # Main navigation tabs
    tab1, tab2 = st.tabs([
        "🏀 " + (t('today_games') if st.session_state.lang == 'en' else "比赛预测"),
        "📊 " + (t('prediction_history') if st.session_state.lang == 'en' else "历史战绩")
    ])

    with tab1:
        render_date_navigation(t)
        render_games_list(t)

    with tab2:
        render_history_stats(t)

    # Footer ad slot
    render_ad_slot("footer")

    render_footer(t)


if __name__ == "__main__":
    main()
