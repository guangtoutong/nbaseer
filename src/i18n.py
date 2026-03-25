"""
Internationalization (i18n) module for NBAseer.
Supports English and Chinese.
"""

from typing import Dict

# Language definitions
LANGUAGES = {
    'en': 'English',
    'zh': '中文'
}

# Translation dictionary
TRANSLATIONS: Dict[str, Dict[str, str]] = {
    # Brand
    'brand_name': {
        'en': 'NBAseer',
        'zh': 'NBA先知'
    },
    'brand_slogan': {
        'en': 'Data Insights, Game Predictions',
        'zh': '数据洞察，预见比赛'
    },

    # Navigation
    'nav_home': {
        'en': 'Home',
        'zh': '首页'
    },
    'nav_predictions': {
        'en': 'Predictions',
        'zh': '预测'
    },
    'nav_history': {
        'en': 'History',
        'zh': '历史'
    },
    'nav_admin': {
        'en': 'Admin',
        'zh': '管理后台'
    },

    # Home page
    'today_games': {
        'en': "Today's Games",
        'zh': '今日比赛'
    },
    'tomorrow_games': {
        'en': "Tomorrow's Games",
        'zh': '明日比赛'
    },
    'no_games_today': {
        'en': 'No games scheduled for today',
        'zh': '今日没有比赛安排'
    },
    'no_games_tomorrow': {
        'en': 'No games scheduled for tomorrow',
        'zh': '明日没有比赛安排'
    },
    'select_date': {
        'en': 'Select Date',
        'zh': '选择日期'
    },
    'games_count': {
        'en': '{count} games',
        'zh': '{count} 场比赛'
    },

    # Predictions
    'predicted_winner': {
        'en': 'Predicted Winner',
        'zh': '预测胜者'
    },
    'predicted_score': {
        'en': 'Predicted Score',
        'zh': '预测比分'
    },
    'predicted_spread': {
        'en': 'Predicted Spread',
        'zh': '预测分差'
    },
    'predicted_total': {
        'en': 'Predicted Total',
        'zh': '预测总分'
    },
    'win_probability': {
        'en': 'Win Probability',
        'zh': '胜率'
    },
    'confidence': {
        'en': 'Confidence',
        'zh': '信心'
    },
    'confidence_high': {
        'en': 'High',
        'zh': '高'
    },
    'confidence_medium': {
        'en': 'Medium',
        'zh': '中'
    },
    'confidence_low': {
        'en': 'Low',
        'zh': '低'
    },

    # Results comparison
    'actual_score': {
        'en': 'Actual Score',
        'zh': '实际比分'
    },
    'actual_winner': {
        'en': 'Actual Winner',
        'zh': '实际胜者'
    },
    'prediction_correct': {
        'en': 'Correct',
        'zh': '正确'
    },
    'prediction_wrong': {
        'en': 'Wrong',
        'zh': '错误'
    },
    'spread_error': {
        'en': 'Spread Error',
        'zh': '分差误差'
    },
    'total_error': {
        'en': 'Total Error',
        'zh': '总分误差'
    },
    'vs_prediction': {
        'en': 'vs Prediction',
        'zh': '对比预测'
    },

    # History / Stats
    'prediction_history': {
        'en': 'Prediction History',
        'zh': '预测历史'
    },
    'accuracy_stats': {
        'en': 'Accuracy Statistics',
        'zh': '准确率统计'
    },
    'win_accuracy': {
        'en': 'Win Prediction Accuracy',
        'zh': '胜负预测准确率'
    },
    'spread_mae': {
        'en': 'Spread MAE',
        'zh': '分差平均误差'
    },
    'total_mae': {
        'en': 'Total MAE',
        'zh': '总分平均误差'
    },
    'total_predictions': {
        'en': 'Total Predictions',
        'zh': '总预测场次'
    },
    'points': {
        'en': 'pts',
        'zh': '分'
    },

    # Admin
    'admin_login': {
        'en': 'Admin Login',
        'zh': '管理员登录'
    },
    'admin_password': {
        'en': 'Password',
        'zh': '密码'
    },
    'admin_login_btn': {
        'en': 'Login',
        'zh': '登录'
    },
    'admin_logout': {
        'en': 'Logout',
        'zh': '退出登录'
    },
    'admin_wrong_password': {
        'en': 'Wrong password',
        'zh': '密码错误'
    },
    'admin_welcome': {
        'en': 'Welcome, Admin',
        'zh': '欢迎，管理员'
    },

    # Admin - System
    'system_status': {
        'en': 'System Status',
        'zh': '系统状态'
    },
    'database_status': {
        'en': 'Database',
        'zh': '数据库'
    },
    'model_status': {
        'en': 'Model',
        'zh': '模型'
    },
    'initialized': {
        'en': 'Initialized',
        'zh': '已初始化'
    },
    'not_initialized': {
        'en': 'Not Initialized',
        'zh': '未初始化'
    },
    'trained': {
        'en': 'Trained',
        'zh': '已训练'
    },
    'not_trained': {
        'en': 'Not Trained',
        'zh': '未训练'
    },

    # Admin - Actions
    'init_database': {
        'en': 'Initialize Database',
        'zh': '初始化数据库'
    },
    'update_data': {
        'en': 'Update Data',
        'zh': '更新数据'
    },
    'train_model': {
        'en': 'Train Model',
        'zh': '训练模型'
    },
    'update_results': {
        'en': 'Update Results',
        'zh': '更新比赛结果'
    },
    'api_settings': {
        'en': 'API Settings',
        'zh': 'API设置'
    },
    'save': {
        'en': 'Save',
        'zh': '保存'
    },
    'saved': {
        'en': 'Saved!',
        'zh': '已保存！'
    },

    # Market data (AdSense friendly terms)
    'market_data': {
        'en': 'Market Data',
        'zh': '市场数据'
    },
    'market_expectation': {
        'en': 'Market Expectation',
        'zh': '市场预期'
    },
    'implied_probability': {
        'en': 'Implied Probability',
        'zh': '隐含概率'
    },
    'spread_line': {
        'en': 'Spread Line',
        'zh': '分差线'
    },
    'total_line': {
        'en': 'Total Line',
        'zh': '总分线'
    },
    'model_vs_market': {
        'en': 'Model vs Market',
        'zh': '模型 vs 市场'
    },
    'model_edge': {
        'en': 'Model Edge',
        'zh': '模型优势'
    },

    # Common
    'loading': {
        'en': 'Loading...',
        'zh': '加载中...'
    },
    'error': {
        'en': 'Error',
        'zh': '错误'
    },
    'success': {
        'en': 'Success',
        'zh': '成功'
    },
    'refresh': {
        'en': 'Refresh',
        'zh': '刷新'
    },
    'download': {
        'en': 'Download',
        'zh': '下载'
    },
    'home_team': {
        'en': 'Home',
        'zh': '主队'
    },
    'away_team': {
        'en': 'Away',
        'zh': '客队'
    },
    'date': {
        'en': 'Date',
        'zh': '日期'
    },
    'time': {
        'en': 'Time',
        'zh': '时间'
    },
    'game': {
        'en': 'Game',
        'zh': '比赛'
    },
    'vs': {
        'en': '@',
        'zh': '@'
    },

    # Footer
    'disclaimer': {
        'en': 'This site is an independent data analysis platform with no affiliation to the NBA.',
        'zh': '本站为独立数据分析平台，与NBA官方无任何关联。'
    },
    'copyright': {
        'en': '© 2024 NBAseer. All rights reserved.',
        'zh': '© 2024 NBA先知. 保留所有权利。'
    },
}


def get_text(key: str, lang: str = 'zh') -> str:
    """Get translated text for a key."""
    if key in TRANSLATIONS:
        return TRANSLATIONS[key].get(lang, TRANSLATIONS[key].get('en', key))
    return key


def get_text_formatted(key: str, lang: str = 'zh', **kwargs) -> str:
    """Get translated text with formatting."""
    text = get_text(key, lang)
    try:
        return text.format(**kwargs)
    except KeyError:
        return text


class Translator:
    """Translator class for easier usage in Streamlit."""

    def __init__(self, lang: str = 'zh'):
        self.lang = lang

    def __call__(self, key: str, **kwargs) -> str:
        if kwargs:
            return get_text_formatted(key, self.lang, **kwargs)
        return get_text(key, self.lang)

    def set_lang(self, lang: str):
        self.lang = lang
