"""
NBAseer History Page - Prediction history and accuracy stats
预测历史与准确率统计
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import os
import sys

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.predictor import GamePredictor
from src.data_collector import get_historical_games
from src.utils import get_chinese_name, DB_PATH
from src.i18n import Translator, LANGUAGES
from src.styles import COMMON_CSS, render_brand_header
from src.database import IS_CLOUD, read_sql

# Page config
st.set_page_config(
    page_title="History | NBAseer",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Apply common styles
st.markdown(COMMON_CSS, unsafe_allow_html=True)


def init_session_state():
    """Initialize session state."""
    if 'lang' not in st.session_state:
        st.session_state.lang = 'zh'


def create_accuracy_gauge(accuracy: float, title: str) -> go.Figure:
    """Create gauge chart for accuracy."""
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=accuracy * 100,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': title},
        delta={'reference': 52.4, 'position': 'bottom'},
        gauge={
            'axis': {'range': [0, 100], 'ticksuffix': '%'},
            'bar': {'color': "darkblue"},
            'steps': [
                {'range': [0, 52.4], 'color': 'lightgray'},
                {'range': [52.4, 60], 'color': 'lightgreen'},
                {'range': [60, 100], 'color': 'green'}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 52.4
            }
        }
    ))
    fig.update_layout(height=250)
    return fig


def render_date_grouped_results(comparison: pd.DataFrame, t: Translator):
    """Render results grouped by date."""
    lang = st.session_state.lang

    if comparison.empty:
        st.info(t('no_games_today') if lang == 'en' else "暂无预测对比数据")
        return

    # Group by date
    comparison['game_date'] = pd.to_datetime(comparison['game_date'])
    dates = comparison['game_date'].dt.date.unique()
    dates = sorted(dates, reverse=True)

    for date in dates:
        date_games = comparison[comparison['game_date'].dt.date == date]
        date_str = date.strftime('%Y-%m-%d')

        # Calculate daily accuracy
        daily_correct = date_games['win_correct'].sum()
        daily_total = len(date_games)
        daily_accuracy = daily_correct / daily_total if daily_total > 0 else 0

        # Date header with accuracy
        with st.expander(f"📅 {date_str} - {daily_correct}/{daily_total} ({daily_accuracy*100:.0f}%)", expanded=(date == dates[0])):
            for _, game in date_games.iterrows():
                # Get team names
                if lang == 'zh':
                    home_name = game['home_cn']
                    away_name = game['away_cn']
                else:
                    home_name = game['home_abbr']
                    away_name = game['away_abbr']

                # Prediction result
                is_correct = game['win_correct'] == 1

                with st.container(border=True):
                    col1, col2, col3 = st.columns([3, 2, 2])

                    with col1:
                        st.markdown(f"**{away_name} @ {home_name}**")

                        # Show actual score
                        st.write(f"{t('actual_score')}: {int(game['away_score'])} - {int(game['home_score'])}")

                    with col2:
                        # Prediction
                        pred_winner = home_name if game['predicted_winner'] == 'home' else away_name
                        st.write(f"{t('predicted_winner')}: {pred_winner}")
                        st.write(f"{t('predicted_spread')}: {game['predicted_spread']:+.1f}")
                        st.write(f"{t('predicted_total')}: {game['predicted_total']:.0f}")

                    with col3:
                        # Result
                        if is_correct:
                            st.success(f"✅ {t('prediction_correct')}")
                        else:
                            st.error(f"❌ {t('prediction_wrong')}")

                        st.caption(f"{t('spread_error')}: {game['spread_error']:.1f}")
                        st.caption(f"{t('total_error')}: {game['total_error']:.1f}")


def render_overall_stats(stats: dict, t: Translator):
    """Render overall statistics."""
    st.subheader(t('accuracy_stats'))

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        accuracy = stats.get('win_accuracy', 0)
        st.metric(
            t('win_accuracy'),
            f"{accuracy*100:.1f}%",
            f"{(accuracy - 0.524)*100:+.1f}%"
        )

    with col2:
        st.metric(
            t('spread_mae'),
            f"{stats.get('spread_mae', 0):.1f}",
        )

    with col3:
        st.metric(
            t('total_mae'),
            f"{stats.get('total_mae', 0):.1f}",
        )

    with col4:
        st.metric(
            t('total_predictions'),
            f"{stats.get('total_predictions', 0)}"
        )


def main():
    """Main entry point."""
    init_session_state()
    t = Translator(st.session_state.lang)

    # Brand header
    slogan = "Data-Driven Game Predictions" if st.session_state.lang == 'en' else "数据驱动的比赛预测"
    st.markdown(render_brand_header("NBAseer", slogan), unsafe_allow_html=True)

    # Navigation and language
    col1, col2, col3 = st.columns([1, 2, 1])

    with col1:
        st.markdown(f"[← {'Home' if st.session_state.lang == 'en' else '首页'}](/)", unsafe_allow_html=True)

    with col2:
        st.markdown(f"<h2 style='text-align: center;'>📊 {t('prediction_history')}</h2>", unsafe_allow_html=True)

    with col3:
        # Language switcher
        new_lang = st.selectbox(
            "🌐",
            options=list(LANGUAGES.keys()),
            format_func=lambda x: LANGUAGES[x],
            index=list(LANGUAGES.keys()).index(st.session_state.lang),
            label_visibility="collapsed"
        )
        if new_lang != st.session_state.lang:
            st.session_state.lang = new_lang
            st.rerun()

    # Check if system is ready
    if not IS_CLOUD and not DB_PATH.exists():
        st.warning("System not initialized" if st.session_state.lang == 'en' else "系统未初始化")
        return

    if IS_CLOUD:
        try:
            check = read_sql("SELECT COUNT(*) as cnt FROM teams")
            if check.empty or check.iloc[0]['cnt'] == 0:
                st.warning("System not initialized" if st.session_state.lang == 'en' else "系统未初始化")
                return
        except:
            st.warning("System not initialized" if st.session_state.lang == 'en' else "系统未初始化")
            return

    try:
        predictor = GamePredictor()
        comparison = predictor.get_predictions_with_results()
        stats = predictor.get_accuracy_stats()
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return

    if comparison.empty:
        st.info("No prediction comparison data yet. Predictions will appear here after games are completed."
                if st.session_state.lang == 'en'
                else "暂无预测对比数据。比赛结束后，预测对比将显示在这里。")

        # Show historical games
        st.divider()
        st.subheader("Historical Games" if st.session_state.lang == 'en' else "历史比赛")

        col1, col2 = st.columns(2)
        with col1:
            start_date = st.date_input(
                "Start Date" if st.session_state.lang == 'en' else "开始日期",
                value=datetime.now() - timedelta(days=7)
            )
        with col2:
            end_date = st.date_input(
                "End Date" if st.session_state.lang == 'en' else "结束日期",
                value=datetime.now()
            )

        games = get_historical_games(
            start_date.strftime('%Y-%m-%d'),
            end_date.strftime('%Y-%m-%d')
        )

        if not games.empty:
            lang = st.session_state.lang
            if lang == 'zh':
                games['home_cn'] = games['home_abbr'].apply(get_chinese_name)
                games['away_cn'] = games['away_abbr'].apply(get_chinese_name)
                display_cols = ['game_date', 'away_cn', 'home_cn', 'away_score', 'home_score', 'point_diff']
                col_names = ['日期', '客队', '主队', '客队得分', '主队得分', '分差']
            else:
                display_cols = ['game_date', 'away_abbr', 'home_abbr', 'away_score', 'home_score', 'point_diff']
                col_names = ['Date', 'Away', 'Home', 'Away Score', 'Home Score', 'Spread']

            display_df = games[display_cols].copy()
            display_df.columns = col_names

            st.dataframe(display_df, use_container_width=True, hide_index=True)
        else:
            st.info("No games in selected date range" if st.session_state.lang == 'en'
                    else "所选日期范围内没有比赛")

        return

    # Show overall stats
    render_overall_stats(stats, t)

    st.divider()

    # Tabs for different views
    tab1, tab2, tab3 = st.tabs([
        "📅 " + ("By Date" if st.session_state.lang == 'en' else "按日期"),
        "📈 " + ("Charts" if st.session_state.lang == 'en' else "图表"),
        "📋 " + ("Raw Data" if st.session_state.lang == 'en' else "原始数据")
    ])

    with tab1:
        render_date_grouped_results(comparison, t)

    with tab2:
        # Accuracy gauge
        col1, col2 = st.columns(2)

        with col1:
            fig_accuracy = create_accuracy_gauge(
                stats.get('win_accuracy', 0.5),
                t('win_accuracy')
            )
            st.plotly_chart(fig_accuracy, use_container_width=True)

        with col2:
            # Error distribution
            if 'spread_error' in comparison.columns:
                fig_spread = px.histogram(
                    comparison,
                    x='spread_error',
                    nbins=20,
                    title=t('spread_error') + " Distribution"
                )
                fig_spread.add_vline(
                    x=comparison['spread_error'].mean(),
                    line_dash="dash",
                    line_color="red",
                    annotation_text=f"Mean: {comparison['spread_error'].mean():.1f}"
                )
                st.plotly_chart(fig_spread, use_container_width=True)

        # Accuracy over time
        if len(comparison) > 10:
            comparison_sorted = comparison.sort_values('game_date')
            comparison_sorted['rolling_accuracy'] = comparison_sorted['win_correct'].rolling(10, min_periods=3).mean()

            fig_trend = px.line(
                comparison_sorted,
                x='game_date',
                y='rolling_accuracy',
                title="Accuracy Trend (10-game rolling)" if st.session_state.lang == 'en' else "准确率趋势（10场滚动）"
            )
            fig_trend.add_hline(
                y=0.524,
                line_dash="dash",
                line_color="red",
                annotation_text="Break-even (52.4%)"
            )
            fig_trend.update_layout(
                yaxis_tickformat='.0%',
                xaxis_title=t('date'),
                yaxis_title=t('win_accuracy')
            )
            st.plotly_chart(fig_trend, use_container_width=True)

    with tab3:
        # Raw data table
        lang = st.session_state.lang

        display_cols = ['game_date', 'away_cn' if lang == 'zh' else 'away_abbr',
                        'home_cn' if lang == 'zh' else 'home_abbr',
                        'predicted_spread', 'actual_spread', 'spread_error',
                        'predicted_total', 'actual_total', 'total_error',
                        'win_correct']

        display_df = comparison[display_cols].copy()
        display_df.columns = [
            t('date'),
            t('away_team'),
            t('home_team'),
            t('predicted_spread'),
            'Actual Spread' if lang == 'en' else '实际分差',
            t('spread_error'),
            t('predicted_total'),
            'Actual Total' if lang == 'en' else '实际总分',
            t('total_error'),
            t('prediction_correct')
        ]

        def highlight_correct(row):
            if row[t('prediction_correct')] == 1:
                return ['background-color: #d4edda'] * len(row)
            else:
                return ['background-color: #f8d7da'] * len(row)

        st.dataframe(
            display_df.style.apply(highlight_correct, axis=1),
            use_container_width=True,
            hide_index=True
        )

        # Download button
        csv = comparison.to_csv(index=False)
        st.download_button(
            f"📥 {t('download')} CSV",
            csv,
            "nbaseer_history.csv",
            "text/csv",
            use_container_width=True
        )


if __name__ == "__main__":
    main()
