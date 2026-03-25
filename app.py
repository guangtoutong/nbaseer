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
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
""", unsafe_allow_html=True)

# Custom CSS for better styling - Mobile first, hide sidebar
st.markdown("""
<style>
    /* ===== HIDE SIDEBAR COMPLETELY ===== */
    [data-testid="stSidebar"] {display: none !important;}
    [data-testid="stSidebarNav"] {display: none !important;}
    section[data-testid="stSidebar"] {display: none !important;}
    .css-1d391kg {display: none !important;}
    .st-emotion-cache-1gv3huu {display: none !important;}
    button[kind="header"] {display: none !important;}

    /* Hide hamburger menu and deploy button */
    .stDeployButton {display: none !important;}
    header[data-testid="stHeader"] {display: none !important;}
    .stAppDeployButton {display: none !important;}
    [data-testid="stToolbar"] {display: none !important;}
    .viewerBadge_container__r5tak {display: none !important;}
    .styles_viewerBadge__CvC9N {display: none !important;}

    /* Hide Streamlit branding */
    #MainMenu {display: none !important;}
    footer {display: none !important;}

    /* ===== BRAND HEADER ===== */
    .brand-header {
        background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
        padding: 1.5rem 1rem;
        margin: -1rem -1rem 1rem -1rem;
        text-align: center;
        color: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .brand-logo {
        font-size: 2.8rem;
        font-weight: 800;
        letter-spacing: -1px;
        margin-bottom: 0.3rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .brand-slogan {
        font-size: 0.95rem;
        opacity: 0.9;
        font-weight: 300;
    }
    .lang-switch {
        position: absolute;
        top: 1rem;
        right: 1rem;
    }

    /* ===== DATE NAVIGATION ===== */
    .date-nav-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 0;
        background: #f8f9fa;
        border-radius: 10px;
        margin-bottom: 1rem;
    }

    /* ===== GAME CARDS - Mobile Optimized ===== */
    .game-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
        color: white;
        border-radius: 12px 12px 0 0;
    }
    .team-name {
        font-size: 1.1rem;
        font-weight: 600;
    }
    .team-abbr {
        font-size: 0.75rem;
        opacity: 0.8;
    }
    .vs-badge {
        background: rgba(255,255,255,0.2);
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
    }

    /* Probability bar */
    .prob-bar {
        display: flex;
        width: 100%;
        height: 36px;
        border-radius: 0;
        overflow: hidden;
    }
    .prob-away {
        background: linear-gradient(90deg, #ff7f0e 0%, #ffab40 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 0.9rem;
    }
    .prob-home {
        background: linear-gradient(90deg, #4fc3f7 0%, #1f77b4 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 0.9rem;
    }

    /* Score display */
    .score-display {
        font-size: 1.3rem;
        font-weight: bold;
        text-align: center;
        padding: 0.8rem;
        background: #f8f9fa;
        margin: 0;
    }
    .score-display b {
        font-size: 1.5rem;
        color: #1e3a5f;
    }

    /* Prediction metrics */
    .pred-metrics {
        display: flex;
        justify-content: space-around;
        padding: 0.8rem;
        background: white;
        border-radius: 0 0 12px 12px;
        border: 1px solid #eee;
        border-top: none;
    }
    .pred-item {
        text-align: center;
    }
    .pred-label {
        font-size: 0.7rem;
        color: #666;
        text-transform: uppercase;
    }
    .pred-value {
        font-size: 1rem;
        font-weight: 600;
        color: #1e3a5f;
    }
    .pred-conf {
        font-size: 0.7rem;
        color: #28a745;
    }

    /* Result badges */
    .result-correct {
        background: #d4edda;
        color: #155724;
        padding: 0.5rem;
        text-align: center;
        font-weight: 600;
        margin-top: -1px;
    }
    .result-wrong {
        background: #f8d7da;
        color: #721c24;
        padding: 0.5rem;
        text-align: center;
        font-weight: 600;
        margin-top: -1px;
    }

    /* ===== FOOTER ===== */
    .footer {
        text-align: center;
        padding: 2rem 1rem;
        color: #666;
        font-size: 0.75rem;
        border-top: 1px solid #eee;
        margin-top: 2rem;
    }
    .footer a {
        color: #1e3a5f;
        text-decoration: none;
    }

    /* ===== MOBILE RESPONSIVE ===== */
    @media (max-width: 768px) {
        .brand-logo {font-size: 2.2rem;}
        .brand-slogan {font-size: 0.85rem;}
        .team-name {font-size: 1rem;}
        .score-display {font-size: 1.1rem;}
        .score-display b {font-size: 1.3rem;}
    }

    /* Remove extra padding on mobile */
    .block-container {
        padding: 0 !important;
        max-width: 100% !important;
    }
    .stApp > header {display: none;}

    /* Streamlit element tweaks */
    .stSelectbox > div > div {
        background: transparent !important;
    }
    div[data-testid="stMetricValue"] {
        font-size: 1rem !important;
    }
</style>
""", unsafe_allow_html=True)


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

    # Build card using Streamlit components for better rendering
    with st.container(border=True):
        # Team header
        st.markdown(f"""
        <div class="game-card-header">
            <div style="text-align: left;">
                <div class="team-name">{away_name}</div>
                <div class="team-abbr">{game['away_abbr']}</div>
            </div>
            <div class="vs-badge">VS</div>
            <div style="text-align: right;">
                <div class="team-name">{home_name}</div>
                <div class="team-abbr">{game['home_abbr']}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

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
    if not DB_PATH.exists():
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

            # Display header
            st.subheader(f"📅 {date_str} - {t('games_count', count=len(predictions))}")

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
