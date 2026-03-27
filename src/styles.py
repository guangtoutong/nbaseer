"""
Shared styles for NBAseer application.
统一的样式模块
"""

# Common CSS for all pages - comprehensive styles
COMMON_CSS = """
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
        background: linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%);
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
        background: linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%);
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
        color: #ff6b35;
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
        color: #ff6b35;
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

    /* ===== STATS CARDS ===== */
    .stat-card {
        background: linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%);
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
        color: #ff6b35;
        text-decoration: none;
    }

    /* ===== RESPONSIVE LAYOUT ===== */
    @media (max-width: 768px) {
        .brand-logo {font-size: 2.2rem;}
        .brand-slogan {font-size: 0.85rem;}
        .team-name {font-size: 1rem;}
        .score-display {font-size: 1.1rem;}
        .score-display b {font-size: 1.3rem;}
    }

    @media (min-width: 768px) {
        .brand-logo {font-size: 2.8rem;}
        .brand-slogan {font-size: 1rem;}
        .team-name {font-size: 1.2rem;}
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

    /* Layout - centered on PC */
    .block-container {
        padding: 1rem !important;
        max-width: 900px !important;
        margin: 0 auto !important;
    }

    @media (max-width: 768px) {
        .block-container {
            padding: 0.5rem !important;
            max-width: 100% !important;
        }
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
