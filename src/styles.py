"""
Shared styles for NBAseer application.
Dark theme with orange accent - matching Stitch design
"""

# Card-specific CSS for components.html() rendering
CARD_CSS = """
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
    background: transparent;
    color: #fff;
}

.game-card {
    background: #1a1a1e;
    border-radius: 12px;
    padding: 1rem 1.2rem;
    border: 1px solid #2a2a2e;
    max-width: 500px;
    margin: 0 auto;
}

.game-time {
    display: inline-block;
    background: #2a2a2e;
    color: #aaa;
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-size: 0.7rem;
    margin-bottom: 0.8rem;
}

.teams-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1rem;
}

.team-info {
    text-align: center;
    min-width: 70px;
}

.team-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.75rem;
    color: white;
    margin: 0 auto 0.4rem;
}

.team-name {
    color: #999;
    font-size: 0.7rem;
}

.vs-text {
    color: #555;
    font-size: 0.75rem;
    font-weight: 500;
}

.prob-section {
    margin-bottom: 1rem;
}

.prob-label {
    color: #666;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.4rem;
    text-align: center;
}

.prob-values {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
}

.prob-value {
    font-size: 1rem;
    font-weight: 600;
    color: #888;
}

.prob-value.winner {
    color: #ff6b35;
}

.prob-bar {
    display: flex;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: #2a2a2e;
}

.prob-bar-winner {
    background: linear-gradient(90deg, #ff6b35, #ff8c5a);
}

.prob-bar-loser {
    background: #3a3a3e;
}

.pred-stats {
    display: flex;
    justify-content: space-around;
    gap: 0.5rem;
    padding-top: 0.8rem;
    border-top: 1px solid #2a2a2e;
}

.pred-stat {
    text-align: center;
    flex: 1;
}

.pred-stat-label {
    color: #666;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.2rem;
}

.pred-stat-value {
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
}

.pred-stat-sub {
    color: #888;
    font-size: 0.7rem;
}

.forecast-box {
    background: #131316;
    border-radius: 6px;
    padding: 0.5rem;
    text-align: center;
    flex: 1;
}

.forecast-label {
    color: #ff6b35;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.2rem;
}

.forecast-value {
    color: white;
    font-size: 0.95rem;
    font-weight: 600;
}

.result-section {
    text-align: center;
    margin-top: 0.8rem;
    padding-top: 0.8rem;
    border-top: 1px solid #2a2a2e;
}

.result-badge {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
}

.result-badge.correct {
    background: rgba(40, 167, 69, 0.2);
    color: #28a745;
}

.result-badge.wrong {
    background: rgba(220, 53, 69, 0.2);
    color: #dc3545;
}
"""

# Common CSS for all pages - Dark theme
COMMON_CSS = """
<style>
    /* ===== HIDE STREAMLIT ELEMENTS ===== */
    [data-testid="stSidebar"] {display: none !important;}
    [data-testid="stSidebarNav"] {display: none !important;}
    section[data-testid="stSidebar"] {display: none !important;}
    .css-1d391kg {display: none !important;}
    .st-emotion-cache-1gv3huu {display: none !important;}
    button[kind="header"] {display: none !important;}
    .stDeployButton {display: none !important;}
    header[data-testid="stHeader"] {display: none !important;}
    .stAppDeployButton {display: none !important;}
    [data-testid="stToolbar"] {display: none !important;}
    .viewerBadge_container__r5tak {display: none !important;}
    .styles_viewerBadge__CvC9N {display: none !important;}
    #MainMenu {display: none !important;}
    footer {display: none !important;}

    /* ===== DARK THEME BASE ===== */
    .stApp {
        background-color: #0d0d0f !important;
    }

    .main .block-container {
        background-color: #0d0d0f;
        padding: 0 !important;
        max-width: 1200px !important;
        margin: 0 auto !important;
    }

    /* ===== TOP NAVIGATION ===== */
    .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: #131316;
        border-bottom: 1px solid #2a2a2e;
    }

    .nav-logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.3rem;
        font-weight: 700;
        color: #ff6b35;
    }

    .nav-logo img {
        width: 24px;
        height: 24px;
    }

    .nav-links {
        display: flex;
        gap: 2rem;
    }

    .nav-link {
        color: #888;
        text-decoration: none;
        font-size: 0.9rem;
        padding: 0.5rem 0;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
    }

    .nav-link:hover, .nav-link.active {
        color: #ff6b35;
        border-bottom-color: #ff6b35;
    }

    .nav-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    /* ===== PAGE HEADER ===== */
    .page-header {
        padding: 2rem;
        color: white;
    }

    .page-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: white;
        margin-bottom: 0.5rem;
    }

    .page-subtitle {
        color: #666;
        font-size: 0.95rem;
    }

    /* ===== GAME CARD ===== */
    .game-card {
        background: #1a1a1e;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        border: 1px solid #2a2a2e;
    }

    .game-time {
        display: inline-block;
        background: #2a2a2e;
        color: #888;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.75rem;
        margin-bottom: 1rem;
    }

    .teams-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        margin-bottom: 1.5rem;
    }

    .team-info {
        text-align: center;
    }

    .team-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.9rem;
        color: white;
        margin: 0 auto 0.5rem;
    }

    .team-name {
        color: #888;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .vs-text {
        color: #444;
        font-size: 0.8rem;
        font-weight: 500;
    }

    /* ===== WIN PROBABILITY BAR ===== */
    .prob-section {
        margin-bottom: 1.5rem;
    }

    .prob-label {
        color: #666;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 0.5rem;
    }

    .prob-values {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .prob-value {
        font-size: 1.1rem;
        font-weight: 600;
        color: white;
    }

    .prob-bar {
        display: flex;
        width: 100%;
        height: 6px;
        border-radius: 3px;
        overflow: hidden;
        background: #2a2a2e;
    }

    .prob-bar-away {
        background: linear-gradient(90deg, #ff6b35, #ff8c5a);
        transition: width 0.3s;
    }

    .prob-bar-home {
        background: linear-gradient(90deg, #4a4a4e, #3a3a3e);
        transition: width 0.3s;
    }

    /* ===== PREDICTION STATS ===== */
    .pred-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #2a2a2e;
    }

    .pred-stat {
        text-align: center;
    }

    .pred-stat-label {
        color: #666;
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 0.3rem;
    }

    .pred-stat-value {
        color: white;
        font-size: 1.3rem;
        font-weight: 700;
    }

    .pred-stat-sub {
        color: #888;
        font-size: 0.8rem;
    }

    /* ===== FORECAST BOX ===== */
    .forecast-box {
        background: #131316;
        border-radius: 8px;
        padding: 0.8rem;
        text-align: center;
    }

    .forecast-label {
        color: #ff6b35;
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 0.3rem;
    }

    .forecast-value {
        color: white;
        font-size: 1rem;
        font-weight: 600;
    }

    /* ===== INSIGHTS SIDEBAR ===== */
    .insights-card {
        background: #1a1a1e;
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid #2a2a2e;
    }

    .insights-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: white;
        font-weight: 600;
    }

    .insight-item {
        background: #131316;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 0.8rem;
    }

    .insight-title {
        color: #888;
        font-size: 0.7rem;
        text-transform: uppercase;
        margin-bottom: 0.3rem;
    }

    .insight-value {
        color: white;
        font-size: 0.9rem;
    }

    .insight-badge {
        display: inline-block;
        background: #ff6b35;
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.65rem;
        font-weight: 600;
        margin-left: 0.5rem;
    }

    /* ===== PERFORMANCE CARDS ===== */
    .perf-card {
        background: #1a1a1e;
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid #2a2a2e;
    }

    .perf-card.highlight {
        background: linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%);
        border: none;
    }

    .perf-label {
        color: #888;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 0.5rem;
    }

    .perf-card.highlight .perf-label {
        color: rgba(255,255,255,0.8);
    }

    .perf-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: white;
    }

    .perf-value span {
        color: #28a745;
        font-size: 1.5rem;
    }

    .perf-desc {
        color: #888;
        font-size: 0.85rem;
        margin-top: 0.5rem;
    }

    .perf-card.highlight .perf-desc {
        color: rgba(255,255,255,0.9);
    }

    /* ===== RESULT CARD ===== */
    .result-card {
        background: #1a1a1e;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        border: 1px solid #2a2a2e;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 1.5rem;
        align-items: center;
    }

    .result-teams {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .result-team {
        text-align: center;
    }

    .result-score {
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        margin-top: 0.3rem;
    }

    .result-badge {
        display: inline-block;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .result-badge.correct {
        background: rgba(40, 167, 69, 0.2);
        color: #28a745;
    }

    .result-badge.wrong {
        background: rgba(220, 53, 69, 0.2);
        color: #dc3545;
    }

    .result-stats {
        text-align: center;
    }

    .confidence-label {
        color: #666;
        font-size: 0.65rem;
        text-transform: uppercase;
        margin-bottom: 0.3rem;
    }

    .confidence-value {
        color: white;
        font-size: 0.9rem;
    }

    .confidence-value.high { color: #28a745; }
    .confidence-value.medium { color: #ffc107; }
    .confidence-value.low { color: #dc3545; }

    /* ===== FOOTER ===== */
    .site-footer {
        padding: 2rem;
        border-top: 1px solid #2a2a2e;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 3rem;
    }

    .footer-logo {
        color: #ff6b35;
        font-weight: 700;
    }

    .footer-copy {
        color: #666;
        font-size: 0.8rem;
    }

    .footer-links {
        display: flex;
        gap: 1.5rem;
    }

    .footer-link {
        color: #666;
        text-decoration: none;
        font-size: 0.85rem;
    }

    .footer-link:hover {
        color: #ff6b35;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
        .top-nav {
            padding: 1rem;
        }

        .nav-links {
            gap: 1rem;
        }

        .page-title {
            font-size: 1.8rem;
        }

        .result-card {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .teams-container {
            gap: 1rem;
        }

        .team-circle {
            width: 50px;
            height: 50px;
            font-size: 0.8rem;
        }

        .site-footer {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
    }

    /* ===== STREAMLIT OVERRIDES ===== */
    .stMarkdown, .stText, p, span, div {
        color: #ccc;
    }

    h1, h2, h3 {
        color: white !important;
    }

    .stButton > button {
        background: #ff6b35 !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
    }

    .stSelectbox > div > div {
        background: #1a1a1e !important;
        border-color: #2a2a2e !important;
        color: white !important;
    }

    .stDateInput > div > div {
        background: #1a1a1e !important;
        border-color: #2a2a2e !important;
    }

    .stTabs [data-baseweb="tab-list"] {
        background: transparent;
        gap: 2rem;
    }

    .stTabs [data-baseweb="tab"] {
        color: #888;
        background: transparent;
    }

    .stTabs [aria-selected="true"] {
        color: #ff6b35 !important;
        border-bottom-color: #ff6b35 !important;
    }

    div[data-testid="stMetricValue"] {
        color: white !important;
    }

    div[data-testid="stMetricDelta"] {
        color: #28a745 !important;
    }
</style>
"""

# Team colors for circle badges
TEAM_COLORS = {
    'ATL': '#E03A3E', 'BOS': '#007A33', 'BKN': '#000000', 'CHA': '#1D1160',
    'CHI': '#CE1141', 'CLE': '#860038', 'DAL': '#00538C', 'DEN': '#0E2240',
    'DET': '#C8102E', 'GSW': '#1D428A', 'HOU': '#CE1141', 'IND': '#002D62',
    'LAC': '#C8102E', 'LAL': '#552583', 'MEM': '#5D76A9', 'MIA': '#98002E',
    'MIL': '#00471B', 'MIN': '#0C2340', 'NOP': '#0C2340', 'NYK': '#006BB6',
    'OKC': '#007AC1', 'ORL': '#0077C0', 'PHI': '#006BB6', 'PHX': '#1D1160',
    'POR': '#E03A3E', 'SAC': '#5A2D81', 'SAS': '#C4CED4', 'TOR': '#CE1141',
    'UTA': '#002B5C', 'WAS': '#002B5C'
}


def get_team_color(abbr: str) -> str:
    """Get team color by abbreviation."""
    return TEAM_COLORS.get(abbr, '#ff6b35')


def render_nav_bar(current_page: str = "predictions", lang: str = "zh"):
    """Render the top navigation bar."""
    if lang == 'zh':
        links = {
            'predictions': '预测',
            'live': '实时比分',
            'history': '历史'
        }
    else:
        links = {
            'predictions': 'Predictions',
            'live': 'Live Scores',
            'history': 'History'
        }

    nav_html = '<div class="top-nav">'
    nav_html += '<div class="nav-logo">🏀 nbaseer</div>'
    nav_html += '<div class="nav-links">'

    for key, label in links.items():
        active = 'active' if key == current_page else ''
        nav_html += f'<a href="#" class="nav-link {active}">{label}</a>'

    nav_html += '</div>'
    nav_html += '<div class="nav-actions"></div>'
    nav_html += '</div>'

    return nav_html


def render_game_card_new(
    away_abbr: str,
    home_abbr: str,
    away_name: str,
    home_name: str,
    away_prob: float,
    home_prob: float,
    predicted_away_score: float,
    predicted_home_score: float,
    predicted_total: float,
    predicted_spread: float,
    game_time: str = "",
    lang: str = "zh"
):
    """Render a game prediction card in the new dark style."""
    away_color = get_team_color(away_abbr)
    home_color = get_team_color(home_abbr)

    # Determine over/under text
    spread_text = f"{away_abbr} {predicted_spread:+.1f}" if predicted_spread < 0 else f"{home_abbr} {-predicted_spread:+.1f}"

    time_display = f'<div class="game-time">⏰ {game_time} ET</div>' if game_time else ''

    pred_score_label = "预测比分" if lang == 'zh' else "PREDICTED SCORE"
    forecast_label = "FORECAST" if lang == 'en' else "预测"
    spread_label = "让分" if lang == 'zh' else "Spread"
    total_label = "总分" if lang == 'zh' else "Total"

    return f'''
    <div class="game-card">
        {time_display}
        <div class="teams-container">
            <div class="team-info">
                <div class="team-circle" style="background: {away_color};">{away_abbr}</div>
                <div class="team-name">{away_name}</div>
            </div>
            <div class="vs-text">VS</div>
            <div class="team-info">
                <div class="team-circle" style="background: {home_color};">{home_abbr}</div>
                <div class="team-name">{home_name}</div>
            </div>
        </div>

        <div class="prob-section">
            <div class="prob-label">WIN PROBABILITY</div>
            <div class="prob-values">
                <span class="prob-value" style="color: #ff6b35;">{away_prob*100:.0f}%</span>
                <span class="prob-value">—</span>
                <span class="prob-value">{home_prob*100:.0f}%</span>
            </div>
            <div class="prob-bar">
                <div class="prob-bar-away" style="width: {away_prob*100}%;"></div>
                <div class="prob-bar-home" style="width: {home_prob*100}%;"></div>
            </div>
        </div>

        <div class="pred-stats">
            <div class="pred-stat">
                <div class="pred-stat-label">{pred_score_label}</div>
                <div class="pred-stat-value">{predicted_away_score:.0f} : {predicted_home_score:.0f}</div>
                <div class="pred-stat-sub">{spread_label} {spread_text}</div>
            </div>
            <div class="forecast-box">
                <div class="forecast-label">{forecast_label}</div>
                <div class="forecast-value">{total_label} {predicted_total:.1f}</div>
            </div>
        </div>
    </div>
    '''


def render_result_card(
    away_abbr: str,
    home_abbr: str,
    away_score: int,
    home_score: int,
    predicted_away_score: float,
    predicted_home_score: float,
    predicted_spread: float,
    is_correct: bool,
    confidence: float,
    lang: str = "zh"
):
    """Render a result card for history page."""
    away_color = get_team_color(away_abbr)
    home_color = get_team_color(home_abbr)

    badge_class = "correct" if is_correct else "wrong"
    badge_text = "✓ PREDICTION CORRECT" if is_correct else "✗ PREDICTION MISSED"
    if lang == 'zh':
        badge_text = "✓ 预测正确" if is_correct else "✗ 预测错误"

    # Confidence level
    if confidence >= 0.7:
        conf_class = "high"
        conf_text = f"High ({confidence*100:.0f}%)" if lang == 'en' else f"高 ({confidence*100:.0f}%)"
    elif confidence >= 0.55:
        conf_class = "medium"
        conf_text = f"Medium ({confidence*100:.0f}%)" if lang == 'en' else f"中 ({confidence*100:.0f}%)"
    else:
        conf_class = "low"
        conf_text = f"Low ({confidence*100:.0f}%)" if lang == 'en' else f"低 ({confidence*100:.0f}%)"

    pred_score_label = "PREDICTED SCORE" if lang == 'en' else "预测比分"
    pred_spread_label = "PREDICTED SPREAD" if lang == 'en' else "预测让分"
    conf_label = "AI CONFIDENCE" if lang == 'en' else "AI 置信度"
    final_label = "FINAL" if lang == 'en' else "终场"

    spread_text = f"{away_abbr} {predicted_spread:+.1f}" if predicted_spread < 0 else f"{home_abbr} {-predicted_spread:+.1f}"

    return f'''
    <div class="result-card">
        <div class="result-teams">
            <div class="result-team">
                <div class="game-time">{final_label}</div>
                <div class="team-circle" style="background: {away_color}; width: 50px; height: 50px; font-size: 0.8rem;">{away_abbr}</div>
                <div class="result-score">{away_score}</div>
            </div>
            <div class="vs-text">VS</div>
            <div class="result-team">
                <div class="team-circle" style="background: {home_color}; width: 50px; height: 50px; font-size: 0.8rem;">{home_abbr}</div>
                <div class="result-score">{home_score}</div>
            </div>
        </div>

        <div style="text-align: center;">
            <div class="result-badge {badge_class}">{badge_text}</div>
            <div style="margin-top: 1rem;">
                <div class="pred-stat-label">{pred_score_label}</div>
                <div class="pred-stat-value">{predicted_away_score:.0f} - {predicted_home_score:.0f}</div>
            </div>
        </div>

        <div class="result-stats">
            <div>
                <div class="pred-stat-label">{pred_spread_label}</div>
                <div class="pred-stat-value">{spread_text}</div>
            </div>
            <div style="margin-top: 1rem;">
                <div class="confidence-label">{conf_label}</div>
                <div class="confidence-value {conf_class}">{conf_text}</div>
            </div>
        </div>
    </div>
    '''


def render_footer(lang: str = "zh"):
    """Render the site footer."""
    if lang == 'zh':
        copy_text = "© 2024 nbaseer. 数据驱动预测。"
        terms = "条款"
        privacy = "隐私"
        support = "支持"
    else:
        copy_text = "© 2024 nbaseer. PROBABILITY DRIVEN."
        terms = "Terms"
        privacy = "Privacy"
        support = "Support"

    return f'''
    <div class="site-footer">
        <div>
            <div class="footer-logo">nbaseer</div>
            <div class="footer-copy">{copy_text}</div>
        </div>
        <div class="footer-links">
            <a href="#" class="footer-link">{terms}</a>
            <a href="#" class="footer-link">{privacy}</a>
            <a href="#" class="footer-link">{support}</a>
        </div>
    </div>
    '''
