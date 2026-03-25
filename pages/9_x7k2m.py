"""
NBAseer Admin Panel - Backend management
管理后台 - 需要登录
"""

import streamlit as st
import pandas as pd
from datetime import datetime
import os
import sys

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils import init_database, DB_PATH, MODELS_DIR, save_api_key, load_api_key
from src.data_collector import update_database
from src.models import NBAPredictor, load_predictor
from src.predictor import GamePredictor
from src.feature_engineer import FeatureEngineer
from src.auth import verify_password, get_admin_email, is_first_login, change_password, ADMIN_EMAIL
from src.i18n import Translator, LANGUAGES

# Page config
st.set_page_config(
    page_title="Admin | NBAseer",
    page_icon="🔐",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide sidebar and deploy button
st.markdown("""
<style>
    [data-testid="stSidebar"] {display: none !important;}
    [data-testid="stSidebarNav"] {display: none !important;}
    section[data-testid="stSidebar"] {display: none !important;}
    .stDeployButton {display: none !important;}
    header[data-testid="stHeader"] {display: none !important;}
    [data-testid="stToolbar"] {display: none !important;}
    #MainMenu {display: none !important;}
</style>
""", unsafe_allow_html=True)


def init_session_state():
    """Initialize session state."""
    if 'lang' not in st.session_state:
        st.session_state.lang = 'zh'
    if 'admin_logged_in' not in st.session_state:
        st.session_state.admin_logged_in = False


def render_login(t: Translator):
    """Render login form."""
    st.title(f"🔐 {t('admin_login')}")

    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        with st.form("login_form"):
            st.write(f"**{get_admin_email()}**")

            password = st.text_input(
                t('admin_password'),
                type="password"
            )

            submitted = st.form_submit_button(t('admin_login_btn'), use_container_width=True)

            if submitted:
                if verify_password(password):
                    st.session_state.admin_logged_in = True
                    st.rerun()
                else:
                    st.error(t('admin_wrong_password'))

        if is_first_login():
            st.info("Default password: `nbaseer2024`" if st.session_state.lang == 'en'
                    else "默认密码: `nbaseer2024`")


def check_system_status():
    """Check system status."""
    from src.database import test_connection, get_db_connection

    db_ok = False
    teams_count = 0
    games_count = 0

    try:
        result = test_connection()
        if result['success']:
            # Check if tables have data
            with get_db_connection() as conn:
                cursor = conn.cursor()
                try:
                    cursor.execute("SELECT COUNT(*) as cnt FROM teams")
                    row = cursor.fetchone()
                    if isinstance(row, dict):
                        teams_count = row.get('cnt', 0)
                    else:
                        teams_count = row[0] if row else 0
                except:
                    pass
                try:
                    cursor.execute("SELECT COUNT(*) as cnt FROM games")
                    row = cursor.fetchone()
                    if isinstance(row, dict):
                        games_count = row.get('cnt', 0)
                    else:
                        games_count = row[0] if row else 0
                except:
                    pass
            db_ok = teams_count > 0
    except Exception as e:
        print(f"Status check error: {e}")
        db_ok = False

    return {
        'database': db_ok,
        'teams_count': teams_count,
        'games_count': games_count,
        'model': NBAPredictor.model_exists(),
    }


def render_admin_panel(t: Translator):
    """Render admin panel."""
    # Header
    col1, col2 = st.columns([3, 1])

    with col1:
        st.title(f"⚙️ {t('nav_admin')}")

    with col2:
        if st.button(f"🚪 {t('admin_logout')}", type="secondary"):
            st.session_state.admin_logged_in = False
            st.rerun()

    st.caption(f"{t('admin_welcome')} - {get_admin_email()}")

    # Tabs
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        f"📊 {t('system_status')}",
        f"📦 {t('update_data')}",
        f"🤖 {t('train_model')}",
        f"🔧 {t('api_settings')}",
        f"📢 AdSense"
    ])

    with tab1:
        render_system_status(t)

    with tab2:
        render_data_management(t)

    with tab3:
        render_model_training(t)

    with tab4:
        render_api_settings(t)

    with tab5:
        render_adsense_settings(t)


def render_system_status(t: Translator):
    """Render system status."""
    st.subheader(t('system_status'))

    status = check_system_status()

    col1, col2, col3 = st.columns(3)

    with col1:
        if status['database']:
            st.success(f"✅ {t('database_status')}: {t('initialized')}")
            st.caption(f"Teams: {status.get('teams_count', 0)} | Games: {status.get('games_count', 0)}")
        else:
            st.error(f"❌ {t('database_status')}: {t('not_initialized')}")
            st.caption(f"Teams: {status.get('teams_count', 0)} | Games: {status.get('games_count', 0)}")

    with col2:
        if status['model']:
            st.success(f"✅ {t('model_status')}: {t('trained')}")

            # Show model info
            try:
                model = load_predictor()
                st.caption(f"Version: {model.model_version}")
                if model.trained_at:
                    st.caption(f"Trained: {model.trained_at.strftime('%Y-%m-%d %H:%M')}")
            except:
                pass
        else:
            st.warning(f"⚠️ {t('model_status')}: {t('not_trained')}")

    with col3:
        # Prediction stats
        try:
            predictor = GamePredictor()
            stats = predictor.get_accuracy_stats()
            if stats:
                st.metric(t('total_predictions'), stats.get('total_predictions', 0))
                st.metric(t('win_accuracy'), f"{stats.get('win_accuracy', 0)*100:.1f}%")
        except:
            st.info("No prediction data yet")


def render_data_management(t: Translator):
    """Render data management section."""
    from src.database import test_connection, get_database_mode

    st.subheader(t('update_data'))

    # Show database connection status
    st.write("**Database Status**")
    db_mode = get_database_mode()
    st.info(f"Mode: {db_mode}")

    # Test connection button
    col_test1, col_test2 = st.columns(2)

    with col_test1:
        if st.button("🔍 Test Connection", use_container_width=True):
            with st.spinner("Testing connection..."):
                result = test_connection()

            if result['success']:
                st.success("✅ Connection successful!")
            else:
                st.error(f"❌ Connection failed: {result['error']}")

            with st.expander("Connection Details"):
                st.json(result)

    with col_test2:
        if st.button("📊 Check Data", use_container_width=True):
            from src.database import get_db_connection, IS_CLOUD
            with st.spinner("Checking data..."):
                try:
                    with get_db_connection() as conn:
                        cursor = conn.cursor()
                        counts = {'_is_cloud': IS_CLOUD}

                        # First check what tables exist
                        if IS_CLOUD:
                            cursor.execute("""
                                SELECT table_name FROM information_schema.tables
                                WHERE table_schema = 'public'
                            """)
                            rows = cursor.fetchall()
                            # Handle dict cursor
                            if rows and isinstance(rows[0], dict):
                                existing_tables = [row['table_name'] for row in rows]
                            else:
                                existing_tables = [row[0] for row in rows]
                        else:
                            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                            existing_tables = [row[0] for row in cursor.fetchall()]

                        counts['_existing_tables'] = existing_tables

                        # Then count records in each table
                        for table in ['teams', 'games', 'team_stats', 'schedule', 'predictions', 'odds']:
                            if table in existing_tables:
                                cursor.execute(f"SELECT COUNT(*) as cnt FROM {table}")
                                row = cursor.fetchone()
                                if isinstance(row, dict):
                                    counts[table] = row.get('cnt', 0)
                                else:
                                    counts[table] = row[0] if row else 0
                            else:
                                counts[table] = "TABLE NOT EXISTS"

                    st.success("✅ Data check complete")
                    st.json(counts)
                except Exception as e:
                    import traceback
                    st.error(f"❌ Error: {str(e)}")
                    st.code(traceback.format_exc())

    st.divider()

    col1, col2 = st.columns(2)

    with col1:
        st.write("**" + t('init_database') + "**")
        if st.button(f"🗄️ {t('init_database')}", use_container_width=True):
            with st.spinner("Initializing database..."):
                try:
                    result = init_database()
                    if result['success']:
                        st.success(f"✅ {t('success')} - {len(result['tables_created'])} tables created")
                        if result['errors']:
                            st.warning(f"Warnings: {', '.join(result['errors'])}")
                        with st.expander("Details"):
                            st.json(result)
                    else:
                        st.error("❌ Initialization failed")
                        st.json(result)
                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")

    with col2:
        st.write("**" + t('update_data') + "**")
        if st.button(f"📥 {t('update_data')}", use_container_width=True):
            progress_bar = st.progress(0)
            status_text = st.empty()
            progress_state = {'value': 0}

            def update_progress(msg):
                status_text.text(msg)
                progress_state['value'] = min(progress_state['value'] + 0.15, 0.95)
                progress_bar.progress(progress_state['value'])

            with st.spinner("Updating data..."):
                update_database(progress_callback=update_progress)

            progress_bar.progress(1.0)
            st.success(t('success'))

    st.divider()

    # Update game results
    st.write("**" + t('update_results') + "**")
    st.caption("Fetch actual game results to compare with predictions" if st.session_state.lang == 'en'
               else "获取比赛实际结果，用于对比预测")

    if st.button(f"🔄 {t('update_results')}", use_container_width=True):
        try:
            predictor = GamePredictor()
            with st.spinner("Updating results..."):
                result = predictor.update_game_results()

            if 'error' in result:
                st.error(result['error'])
            else:
                st.success(f"{t('success')} - {result.get('updated', 0)} games updated")
        except Exception as e:
            st.error(f"{t('error')}: {e}")


def render_model_training(t: Translator):
    """Render model training section."""
    st.subheader(t('train_model'))

    # Check database status (works for both local and cloud)
    status = check_system_status()
    if not status['database']:
        st.warning("Please initialize database first" if st.session_state.lang == 'en'
                   else "请先初始化数据库")
        return

    # Training options
    col1, col2 = st.columns(2)

    with col1:
        test_size = st.slider(
            "Test Set Ratio" if st.session_state.lang == 'en' else "测试集比例",
            min_value=0.1,
            max_value=0.4,
            value=0.2,
            step=0.05
        )

    with col2:
        save_model = st.checkbox(
            "Save Model" if st.session_state.lang == 'en' else "保存模型",
            value=True
        )

    if st.button(f"🚀 {t('train_model')}", type="primary", use_container_width=True):
        progress_bar = st.progress(0)
        status_text = st.empty()

        try:
            status_text.text("Preparing training data..." if st.session_state.lang == 'en' else "准备训练数据...")
            progress_bar.progress(10)

            engineer = FeatureEngineer()
            X, y_win, y_spread, y_total = engineer.prepare_training_data()

            if len(X) == 0:
                st.error("Not enough training data" if st.session_state.lang == 'en' else "训练数据不足")
                return

            status_text.text(f"Training with {len(X)} samples..." if st.session_state.lang == 'en'
                             else f"使用 {len(X)} 个样本训练...")
            progress_bar.progress(30)

            model = NBAPredictor()

            def update_progress(msg):
                status_text.text(msg)

            metrics = model.train(
                X, y_win, y_spread, y_total,
                feature_names=engineer.feature_names,
                test_size=test_size,
                progress_callback=update_progress
            )

            progress_bar.progress(80)

            if save_model:
                status_text.text("Saving model..." if st.session_state.lang == 'en' else "保存模型...")
                model.save_model()

            progress_bar.progress(100)
            status_text.text(t('success'))

            # Show results
            st.success(t('success'))

            col1, col2, col3 = st.columns(3)

            with col1:
                st.metric(
                    t('win_accuracy'),
                    f"{metrics['win']['accuracy']*100:.1f}%"
                )

            with col2:
                st.metric(
                    t('spread_mae'),
                    f"{metrics['spread']['mae']:.1f}"
                )

            with col3:
                st.metric(
                    t('total_mae'),
                    f"{metrics['total']['mae']:.1f}"
                )

        except Exception as e:
            st.error(f"{t('error')}: {e}")
            import traceback
            st.code(traceback.format_exc())


def render_api_settings(t: Translator):
    """Render API settings section."""
    st.subheader(t('api_settings'))

    st.caption("API keys for fetching market data (optional)" if st.session_state.lang == 'en'
               else "用于获取市场数据的API密钥（可选）")

    # API-Sports
    st.write("**API-Sports**")
    api_sports_key = st.text_input(
        "API-Sports Key",
        value=load_api_key('API_SPORTS_KEY') or '',
        type="password",
        help="Get from api-sports.io"
    )

    if st.button(f"{t('save')} API-Sports Key"):
        if api_sports_key:
            save_api_key('API_SPORTS_KEY', api_sports_key)
            os.environ['API_SPORTS_KEY'] = api_sports_key
            st.success(t('saved'))
        else:
            st.warning("Please enter a key" if st.session_state.lang == 'en' else "请输入密钥")

    st.divider()

    # The Odds API
    st.write("**The Odds API**")
    odds_api_key = st.text_input(
        "Odds API Key",
        value=load_api_key('ODDS_API_KEY') or '',
        type="password",
        help="Get from the-odds-api.com"
    )

    if st.button(f"{t('save')} Odds API Key"):
        if odds_api_key:
            save_api_key('ODDS_API_KEY', odds_api_key)
            os.environ['ODDS_API_KEY'] = odds_api_key
            st.success(t('saved'))
        else:
            st.warning("Please enter a key" if st.session_state.lang == 'en' else "请输入密钥")

    st.divider()

    # Change password
    st.write("**" + ("Change Password" if st.session_state.lang == 'en' else "修改密码") + "**")

    with st.form("change_password_form"):
        old_pass = st.text_input(
            "Current Password" if st.session_state.lang == 'en' else "当前密码",
            type="password"
        )
        new_pass = st.text_input(
            "New Password" if st.session_state.lang == 'en' else "新密码",
            type="password"
        )
        confirm_pass = st.text_input(
            "Confirm Password" if st.session_state.lang == 'en' else "确认密码",
            type="password"
        )

        if st.form_submit_button(t('save')):
            if new_pass != confirm_pass:
                st.error("Passwords don't match" if st.session_state.lang == 'en' else "两次密码不一致")
            elif len(new_pass) < 6:
                st.error("Password too short" if st.session_state.lang == 'en' else "密码太短")
            elif change_password(old_pass, new_pass):
                st.success(t('saved'))
            else:
                st.error(t('admin_wrong_password'))


def render_adsense_settings(t: Translator):
    """Render Google AdSense settings."""
    st.subheader("Google AdSense " + ("Settings" if st.session_state.lang == 'en' else "设置"))

    st.caption("Configure your Google AdSense publisher ID and ad slots" if st.session_state.lang == 'en'
               else "配置 Google AdSense 发布商ID和广告位")

    st.info("""
    **How to set up AdSense:**
    1. Sign up at https://www.google.com/adsense
    2. Get your publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
    3. Create ad units and get slot IDs
    4. Enter them below
    """ if st.session_state.lang == 'en' else """
    **如何设置 AdSense:**
    1. 在 https://www.google.com/adsense 注册
    2. 获取发布商ID (ca-pub-XXXXXXXXXXXXXXXX)
    3. 创建广告单元并获取广告位ID
    4. 在下方填入
    """)

    # Load current settings
    adsense_client = load_api_key('ADSENSE_CLIENT') or ''
    adsense_header = load_api_key('ADSENSE_SLOT_HEADER') or ''
    adsense_inline = load_api_key('ADSENSE_SLOT_INLINE') or ''
    adsense_footer = load_api_key('ADSENSE_SLOT_FOOTER') or ''

    st.write("**Publisher ID**")
    new_client = st.text_input(
        "ca-pub-XXXXXXXXXXXXXXXX",
        value=adsense_client,
        placeholder="ca-pub-XXXXXXXXXXXXXXXX",
        label_visibility="collapsed"
    )

    st.write("**Ad Slot IDs**")
    col1, col2, col3 = st.columns(3)

    with col1:
        new_header = st.text_input(
            "Header Slot" if st.session_state.lang == 'en' else "头部广告位",
            value=adsense_header,
            placeholder="1234567890"
        )

    with col2:
        new_inline = st.text_input(
            "Inline Slot" if st.session_state.lang == 'en' else "内嵌广告位",
            value=adsense_inline,
            placeholder="1234567890"
        )

    with col3:
        new_footer = st.text_input(
            "Footer Slot" if st.session_state.lang == 'en' else "底部广告位",
            value=adsense_footer,
            placeholder="1234567890"
        )

    if st.button(f"💾 {t('save')} AdSense " + ("Settings" if st.session_state.lang == 'en' else "设置"),
                 type="primary", use_container_width=True):
        # Save all settings
        save_api_key('ADSENSE_CLIENT', new_client)
        save_api_key('ADSENSE_SLOT_HEADER', new_header)
        save_api_key('ADSENSE_SLOT_INLINE', new_inline)
        save_api_key('ADSENSE_SLOT_FOOTER', new_footer)

        st.success(t('saved'))

    st.divider()

    # Preview section
    st.write("**Preview**")

    if new_client and not new_client.startswith('ca-pub-XXXX'):
        st.success("✅ AdSense configured - Ads will show on the frontend")
    else:
        st.warning("⚠️ Placeholder mode - Configure above to enable real ads" if st.session_state.lang == 'en'
                   else "⚠️ 占位符模式 - 请在上方配置以启用真实广告")


def main():
    """Main entry point."""
    init_session_state()
    t = Translator(st.session_state.lang)

    # Language switcher in sidebar
    with st.sidebar:
        new_lang = st.selectbox(
            "🌐 Language",
            options=list(LANGUAGES.keys()),
            format_func=lambda x: LANGUAGES[x],
            index=list(LANGUAGES.keys()).index(st.session_state.lang)
        )
        if new_lang != st.session_state.lang:
            st.session_state.lang = new_lang
            st.rerun()

    # Check login status
    if not st.session_state.admin_logged_in:
        render_login(t)
    else:
        render_admin_panel(t)


if __name__ == "__main__":
    main()
