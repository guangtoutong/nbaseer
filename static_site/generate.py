"""
Static Site Generator for NBA Predictions
Generates SEO-friendly static HTML pages for predictions and results.
"""

import os
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Dict, Optional
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from jinja2 import Environment, FileSystemLoader
from src.database import execute_query, IS_CLOUD, test_connection


# Configuration
OUTPUT_DIR = Path(__file__).parent / "output"
TEMPLATES_DIR = Path(__file__).parent / "templates"
SITE_URL = "https://nbaseer.com"
SITE_NAME = "NBA先知 | NBAseer"


def get_predictions_for_date(date: str) -> List[Dict]:
    """Get predictions for a specific date."""
    query = """
        SELECT
            p.*,
            s.home_team_id,
            s.away_team_id,
            s.game_time,
            ht.abbreviation as home_abbr,
            ht.full_name as home_name,
            at.abbreviation as away_abbr,
            at.full_name as away_name,
            g.home_score,
            g.away_score,
            g.home_win as actual_home_win
        FROM predictions p
        LEFT JOIN schedule s ON p.game_id = s.game_id
        LEFT JOIN teams ht ON s.home_team_id = ht.team_id
        LEFT JOIN teams at ON s.away_team_id = at.team_id
        LEFT JOIN games g ON p.game_id = g.game_id
        WHERE DATE(p.prediction_date) = ?
        ORDER BY s.game_time, p.prediction_date
    """

    try:
        results = execute_query(query, (date,), fetch=True)
        return results or []
    except Exception as e:
        print(f"Error fetching predictions: {e}")
        return []


def get_recent_predictions(days: int = 7) -> List[Dict]:
    """Get predictions from the last N days."""
    all_predictions = []
    for i in range(days):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        preds = get_predictions_for_date(date)
        if preds:
            all_predictions.extend(preds)
    return all_predictions


def get_prediction_accuracy() -> Dict:
    """Calculate overall prediction accuracy."""
    query = """
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN
                (home_win_prob > 0.5 AND actual_home_win = 1) OR
                (home_win_prob <= 0.5 AND actual_home_win = 0)
                THEN 1 ELSE 0 END) as correct
        FROM predictions
        WHERE actual_home_win IS NOT NULL
    """

    try:
        results = execute_query(query, fetch=True)
        if results and len(results) > 0:
            total = results[0].get('total', 0)
            correct = results[0].get('correct', 0)
            accuracy = (correct / total * 100) if total > 0 else 0
            return {
                'total': total,
                'correct': correct,
                'accuracy': round(accuracy, 1)
            }
    except Exception as e:
        print(f"Error calculating accuracy: {e}")

    return {'total': 0, 'correct': 0, 'accuracy': 0}


def generate_page(template_name: str, output_path: Path, context: Dict):
    """Generate a single HTML page from template."""
    env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))
    template = env.get_template(template_name)

    # Add common context - use Beijing time (UTC+8)
    beijing_tz = timezone(timedelta(hours=8))
    beijing_time = datetime.now(beijing_tz)
    context.update({
        'site_url': SITE_URL,
        'site_name': SITE_NAME,
        'generated_at': beijing_time.strftime('%Y-%m-%d %H:%M:%S') + ' (北京时间)',
        'current_year': beijing_time.year,
    })

    html = template.render(**context)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding='utf-8')
    print(f"Generated: {output_path}")


def generate_daily_page(date: str, lang: str = 'zh'):
    """Generate prediction page for a specific date."""
    predictions = get_predictions_for_date(date)
    date_obj = datetime.strptime(date, '%Y-%m-%d')

    # Format date for display
    if lang == 'zh':
        date_display = date_obj.strftime('%Y年%m月%d日')
        title = f"NBA比赛预测 - {date_display}"
        description = f"{date_display}NBA比赛胜负预测、分差预测、大小分预测，AI智能分析"
    else:
        date_display = date_obj.strftime('%B %d, %Y')
        title = f"NBA Predictions - {date_display}"
        description = f"NBA game predictions for {date_display}. Win probability, spread, and total points predictions powered by AI."

    context = {
        'lang': lang,
        'date': date,
        'date_display': date_display,
        'title': title,
        'description': description,
        'predictions': predictions,
        'has_results': any(p.get('actual_home_win') is not None for p in predictions),
        'canonical_url': f"{SITE_URL}/predictions/{date}.html",
    }

    # Output path
    if lang == 'zh':
        output_path = OUTPUT_DIR / "predictions" / f"{date}.html"
    else:
        output_path = OUTPUT_DIR / "en" / "predictions" / f"{date}.html"

    generate_page("prediction.html", output_path, context)


def generate_index_page(lang: str = 'zh'):
    """Generate the main index page."""
    accuracy = get_prediction_accuracy()
    recent = get_recent_predictions(7)

    # Group by date
    by_date = {}
    for p in recent:
        pred_date = str(p.get('prediction_date', ''))[:10]
        if pred_date not in by_date:
            by_date[pred_date] = []
        by_date[pred_date].append(p)

    if lang == 'zh':
        title = "NBA先知 - AI NBA比赛预测"
        description = "使用人工智能预测NBA比赛结果，包括胜负、分差、大小分预测。历史准确率实时追踪。"
    else:
        title = "NBAseer - AI NBA Predictions"
        description = "AI-powered NBA game predictions including win probability, spread, and total points. Track our historical accuracy."

    context = {
        'lang': lang,
        'title': title,
        'description': description,
        'accuracy': accuracy,
        'predictions_by_date': by_date,
        'canonical_url': SITE_URL if lang == 'zh' else f"{SITE_URL}/en/",
    }

    if lang == 'zh':
        output_path = OUTPUT_DIR / "index.html"
    else:
        output_path = OUTPUT_DIR / "en" / "index.html"

    generate_page("index.html", output_path, context)


def generate_sitemap():
    """Generate sitemap.xml for SEO."""
    urls = [
        {'loc': SITE_URL, 'priority': '1.0', 'changefreq': 'daily'},
        {'loc': f"{SITE_URL}/en/", 'priority': '0.9', 'changefreq': 'daily'},
    ]

    # Add prediction pages for last 30 days
    for i in range(30):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        urls.append({
            'loc': f"{SITE_URL}/predictions/{date}.html",
            'priority': '0.8' if i < 7 else '0.6',
            'changefreq': 'weekly' if i > 1 else 'daily',
        })
        urls.append({
            'loc': f"{SITE_URL}/en/predictions/{date}.html",
            'priority': '0.7' if i < 7 else '0.5',
            'changefreq': 'weekly' if i > 1 else 'daily',
        })

    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    for url in urls:
        sitemap += '  <url>\n'
        sitemap += f'    <loc>{url["loc"]}</loc>\n'
        sitemap += f'    <changefreq>{url["changefreq"]}</changefreq>\n'
        sitemap += f'    <priority>{url["priority"]}</priority>\n'
        sitemap += '  </url>\n'

    sitemap += '</urlset>'

    output_path = OUTPUT_DIR / "sitemap.xml"
    output_path.write_text(sitemap, encoding='utf-8')
    print(f"Generated: {output_path}")


def generate_robots_txt():
    """Generate robots.txt."""
    content = f"""User-agent: *
Allow: /

Sitemap: {SITE_URL}/sitemap.xml
"""
    output_path = OUTPUT_DIR / "robots.txt"
    output_path.write_text(content, encoding='utf-8')
    print(f"Generated: {output_path}")


def generate_cname():
    """Generate CNAME file for custom domain."""
    domain = SITE_URL.replace('https://', '').replace('http://', '').split('/')[0]
    output_path = OUTPUT_DIR / "CNAME"
    output_path.write_text(domain, encoding='utf-8')
    print(f"Generated: {output_path}")


def generate_ads_txt():
    """Generate ads.txt for Google AdSense verification."""
    content = "google.com, pub-7786364053868586, DIRECT, f08c47fec0942fa0\n"
    output_path = OUTPUT_DIR / "ads.txt"
    output_path.write_text(content, encoding='utf-8')
    print(f"Generated: {output_path}")


def generate_all():
    """Generate all static pages."""
    print("Starting static site generation...")

    # Test database connection
    if IS_CLOUD:
        result = test_connection()
        if not result['success']:
            print(f"Database connection failed: {result.get('error')}")
            return False

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Generate index pages
    print("\nGenerating index pages...")
    generate_index_page('zh')
    generate_index_page('en')

    # Generate daily pages for last 30 days
    print("\nGenerating daily prediction pages...")
    for i in range(30):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        generate_daily_page(date, 'zh')
        generate_daily_page(date, 'en')

    # Generate sitemap, robots.txt, CNAME, and ads.txt
    print("\nGenerating SEO files...")
    generate_sitemap()
    generate_robots_txt()
    generate_cname()
    generate_ads_txt()

    print("\nStatic site generation complete!")
    return True


if __name__ == "__main__":
    generate_all()
