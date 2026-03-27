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
from src.styles import COMMON_CSS, render_game_card_new, render_footer, get_team_color

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
<meta name="theme-color" content="#0d0d0f">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="NBAseer">
<meta name="description" content="NBA Game Prediction System - AI Powered Predictions">
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
    lang = st.session_state.lang
    lang_toggle = "EN" if lang == 'zh' else "中文"

    # Navigation bar
    st.markdown(f"""
    <div class="top-nav">
        <div class="nav-logo">🏀 nbaseer</div>
        <div class="nav-links">
            <span class="nav-link active">{'预测' if lang == 'zh' else 'Predictions'}</span>
        </div>
        <div class="nav-actions"></div>
    </div>
    """, unsafe_allow_html=True)

    # Page header with title and language toggle
    col1, col2 = st.columns([4, 1])
    with col1:
        st.markdown(f"""
        <div class="page-header">
            <div class="page-title">{t('brand_name')}</div>
            <div class="page-subtitle">{t('brand_slogan')}</div>
        </div>
        """, unsafe_allow_html=True)
    with col2:
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
    """Render a single game prediction card - dark theme style."""
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

    # Probability values
    home_prob = game['home_win_prob']
    away_prob = game['away_win_prob']

    # Get game time
    game_time = game.get('game_time', '')

    # Use the new dark theme card
    card_html = render_game_card_new(
        away_abbr=game['away_abbr'],
        home_abbr=game['home_abbr'],
        away_name=away_name,
        home_name=home_name,
        away_prob=away_prob,
        home_prob=home_prob,
        predicted_away_score=away_pred_score,
        predicted_home_score=home_pred_score,
        predicted_total=predicted_total,
        predicted_spread=predicted_spread,
        game_time=game_time,
        lang=lang
    )
    st.markdown(card_html, unsafe_allow_html=True)

    # Add result badge if available
    if has_result and 'home_score' in game and pd.notna(game.get('home_score')):
        actual_winner = 'home' if game['actual_home_win'] == 1 else 'away'
        is_correct = game['predicted_winner'] == actual_winner

        badge_class = "correct" if is_correct else "wrong"
        if is_correct:
            badge_text = f"✓ {t('prediction_correct')}" if lang == 'en' else "✓ 预测正确"
        else:
            badge_text = f"✗ {t('prediction_wrong')}" if lang == 'en' else "✗ 预测错误"

        st.markdown(f"""
        <div style="text-align: center; margin-top: -0.5rem; margin-bottom: 1rem;">
            <span class="result-badge {badge_class}">{badge_text} | {int(game['away_score'])} - {int(game['home_score'])}</span>
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


def render_page_footer(t: Translator):
    """Render the page footer with dark theme styling."""
    lang = st.session_state.lang

    # Use the new dark theme footer
    footer_html = render_footer(lang)
    st.markdown(footer_html, unsafe_allow_html=True)

    # Add disclaimer
    st.markdown(f"""
    <div style="text-align: center; padding: 1rem; color: #666; font-size: 0.75rem;">
        {t('disclaimer')}
    </div>
    """, unsafe_allow_html=True)


def render_history_stats(t: Translator):
    """Render simplified history stats view with dark theme."""
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

    # Overall stats with dark theme cards
    st.markdown(f"""
    <div class="page-header" style="padding: 1rem 0;">
        <div class="page-title" style="font-size: 1.5rem;">📊 {t('accuracy_stats')}</div>
    </div>
    """, unsafe_allow_html=True)

    # Performance cards
    accuracy = stats.get('win_accuracy', 0)
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown(f"""
        <div class="perf-card highlight">
            <div class="perf-label">{t('win_accuracy')}</div>
            <div class="perf-value">{accuracy*100:.1f}%</div>
            <div class="perf-desc">vs 52.4% breakeven</div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div class="perf-card">
            <div class="perf-label">{t('spread_mae')}</div>
            <div class="perf-value">{stats.get('spread_mae', 0):.1f}</div>
            <div class="perf-desc">{'分' if lang == 'zh' else 'points'}</div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown(f"""
        <div class="perf-card">
            <div class="perf-label">{t('total_mae')}</div>
            <div class="perf-value">{stats.get('total_mae', 0):.1f}</div>
            <div class="perf-desc">{'分' if lang == 'zh' else 'points'}</div>
        </div>
        """, unsafe_allow_html=True)

    with col4:
        st.markdown(f"""
        <div class="perf-card">
            <div class="perf-label">{t('total_predictions')}</div>
            <div class="perf-value">{stats.get('total_predictions', 0)}</div>
            <div class="perf-desc">{'场比赛' if lang == 'zh' else 'games'}</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<div style='height: 2rem;'></div>", unsafe_allow_html=True)

    # Recent results by date
    st.markdown(f"""
    <div class="page-header" style="padding: 1rem 0;">
        <div class="page-title" style="font-size: 1.5rem;">📅 {"Recent Results" if lang == 'en' else "近期结果"}</div>
    </div>
    """, unsafe_allow_html=True)

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

                # Calculate predicted scores
                predicted_total = game['predicted_total']
                predicted_spread = game['predicted_spread']
                home_pred_score = (predicted_total + predicted_spread) / 2
                away_pred_score = (predicted_total - predicted_spread) / 2

                # Use dark theme result display
                badge_class = "correct" if is_correct else "wrong"
                badge_text = "✓ " + ("Correct" if lang == 'en' else "正确") if is_correct else "✗ " + ("Missed" if lang == 'en' else "错误")

                away_color = get_team_color(game['away_abbr'])
                home_color = get_team_color(game['home_abbr'])

                st.markdown(f"""
                <div class="result-card" style="grid-template-columns: 1fr auto 1fr; padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <div class="team-circle" style="background: {away_color}; width: 40px; height: 40px; font-size: 0.65rem;">{game['away_abbr']}</div>
                        <div>
                            <div style="color: white; font-weight: 600;">{away_name}</div>
                            <div style="color: #888; font-size: 0.85rem;">{int(game['away_score'])}</div>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <span class="result-badge {badge_class}">{badge_text}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.8rem; justify-content: flex-end;">
                        <div style="text-align: right;">
                            <div style="color: white; font-weight: 600;">{home_name}</div>
                            <div style="color: #888; font-size: 0.85rem;">{int(game['home_score'])}</div>
                        </div>
                        <div class="team-circle" style="background: {home_color}; width: 40px; height: 40px; font-size: 0.65rem;">{game['home_abbr']}</div>
                    </div>
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

    render_page_footer(t)


if __name__ == "__main__":
    main()
