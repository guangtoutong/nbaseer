"""
Shared styles for NBAseer application.
统一的样式模块
"""

# Common CSS for all pages
COMMON_CSS = """
<style>
    /* ===== HIDE SIDEBAR COMPLETELY ===== */
    [data-testid="stSidebar"] {display: none !important;}
    [data-testid="stSidebarNav"] {display: none !important;}
    section[data-testid="stSidebar"] {display: none !important;}
    .css-1d391kg {display: none !important;}
    button[kind="header"] {display: none !important;}

    /* Hide hamburger menu and deploy button */
    .stDeployButton {display: none !important;}
    header[data-testid="stHeader"] {display: none !important;}
    [data-testid="stToolbar"] {display: none !important;}

    /* Hide Streamlit branding */
    #MainMenu {display: none !important;}
    footer {display: none !important;}

    /* ===== BRAND HEADER ===== */
    .brand-header {
        background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
        padding: 1.2rem 1rem;
        margin: -1rem -1rem 1rem -1rem;
        text-align: center;
        color: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .brand-logo {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -1px;
        margin-bottom: 0.2rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .brand-slogan {
        font-size: 0.85rem;
        opacity: 0.9;
        font-weight: 300;
    }

    /* ===== NAVIGATION BAR ===== */
    .nav-bar {
        display: flex;
        justify-content: center;
        gap: 1rem;
        padding: 0.8rem 0;
        background: #f8f9fa;
        margin: -1rem -1rem 1rem -1rem;
        border-bottom: 1px solid #e9ecef;
        flex-wrap: wrap;
    }
    .nav-link {
        padding: 0.5rem 1rem;
        background: white;
        border-radius: 20px;
        text-decoration: none;
        color: #1e3a5f;
        font-weight: 500;
        border: 1px solid #dee2e6;
        transition: all 0.2s;
    }
    .nav-link:hover, .nav-link.active {
        background: #1e3a5f;
        color: white;
        border-color: #1e3a5f;
    }

    /* ===== GAME CARDS ===== */
    .game-card {
        background: white;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        border: 1px solid #e9ecef;
    }
    .game-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }

    .team-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
    }
    .team-name {
        font-weight: 600;
        font-size: 1.1rem;
    }
    .team-score {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1e3a5f;
    }

    .prediction-badge {
        display: inline-block;
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    .prediction-badge.win {
        background: #d4edda;
        color: #155724;
    }
    .prediction-badge.loss {
        background: #f8d7da;
        color: #721c24;
    }

    /* ===== STATS CARDS ===== */
    .stat-card {
        background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
        border-radius: 12px;
        padding: 1.2rem;
        color: white;
        text-align: center;
    }
    .stat-value {
        font-size: 2rem;
        font-weight: 700;
    }
    .stat-label {
        font-size: 0.85rem;
        opacity: 0.9;
    }

    /* ===== RESPONSIVE LAYOUT ===== */
    @media (min-width: 768px) {
        .brand-logo {
            font-size: 2.5rem;
        }
        .brand-slogan {
            font-size: 1rem;
        }
        .game-card {
            padding: 1.5rem;
        }
        .team-name {
            font-size: 1.2rem;
        }
    }

    @media (min-width: 1024px) {
        .game-cards-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
    }

    @media (min-width: 1400px) {
        .game-cards-container {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    /* ===== RESULT INDICATORS ===== */
    .result-correct {
        color: #28a745;
        font-weight: 600;
    }
    .result-wrong {
        color: #dc3545;
        font-weight: 600;
    }

    /* ===== DATE NAVIGATION ===== */
    .date-nav {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
    }
    .date-btn {
        padding: 0.5rem 1rem;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        cursor: pointer;
    }
    .date-current {
        font-weight: 600;
        font-size: 1.1rem;
        color: #1e3a5f;
    }
</style>
"""


def render_brand_header(title: str = "NBAseer", slogan: str = "NBA先知 - 数据驱动的比赛预测"):
    """Render the brand header."""
    return f"""
    <div class="brand-header">
        <div class="brand-logo">🏀 {title}</div>
        <div class="brand-slogan">{slogan}</div>
    </div>
    """


def render_nav_bar(current_page: str = "home", lang: str = "zh"):
    """Render the navigation bar."""
    nav_items = {
        "home": ("Today's Games" if lang == "en" else "今日比赛", "/"),
        "history": ("History" if lang == "en" else "历史记录", "/history"),
    }

    links = []
    for key, (label, url) in nav_items.items():
        active = "active" if key == current_page else ""
        links.append(f'<a href="{url}" class="nav-link {active}">{label}</a>')

    return f"""
    <div class="nav-bar">
        {''.join(links)}
    </div>
    """


def render_game_card(
    home_team: str,
    away_team: str,
    home_score: int = None,
    away_score: int = None,
    win_prob: float = None,
    predicted_spread: float = None,
    predicted_total: float = None,
    is_correct: bool = None,
    lang: str = "zh"
):
    """Render a game card."""
    # Score display
    score_html = ""
    if home_score is not None and away_score is not None:
        score_html = f"""
        <div class="team-row">
            <span class="team-name">{away_team}</span>
            <span class="team-score">{away_score}</span>
        </div>
        <div class="team-row">
            <span class="team-name">{home_team}</span>
            <span class="team-score">{home_score}</span>
        </div>
        """
    else:
        score_html = f"""
        <div class="team-row">
            <span class="team-name">{away_team}</span>
            <span class="team-score">@</span>
        </div>
        <div class="team-row">
            <span class="team-name">{home_team}</span>
            <span class="team-score"></span>
        </div>
        """

    # Prediction display
    pred_html = ""
    if win_prob is not None:
        winner = home_team if win_prob > 0.5 else away_team
        prob = win_prob if win_prob > 0.5 else (1 - win_prob)
        pred_label = "Prediction" if lang == "en" else "预测"
        pred_html = f"""
        <div style="margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid #e9ecef;">
            <strong>{pred_label}:</strong> {winner} ({prob*100:.0f}%)
        </div>
        """

    # Result badge
    result_html = ""
    if is_correct is not None:
        if is_correct:
            result_html = '<span class="prediction-badge win">✓ Correct</span>'
        else:
            result_html = '<span class="prediction-badge loss">✗ Wrong</span>'

    return f"""
    <div class="game-card">
        {score_html}
        {pred_html}
        {result_html}
    </div>
    """
