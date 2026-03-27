export type Locale = "zh" | "en";

export const translations = {
  zh: {
    // Navigation
    nav: {
      predictions: "预测",
      games: "赛况",
      analysis: "分析",
      about: "关于",
    },

    // Hero section
    hero: {
      title: "nbaseer AI 预测引擎",
      highlight: "全量数据",
      subtitle: "已开启",
      description:
        "无需去海际荧屏前手工算法，每日分析超过 120 万+ 数据点，历史准确率，高可信度为平预赢收住大波普出。",
      cta1: "全部球队推荐",
      cta2: "查看历史结果",
    },

    // Stats
    stats: {
      accuracy: "历史准确率",
      avgReturn: "平均收益",
      predictions: "累计预测",
      winRate: "胜率预测",
    },

    // Sections
    sections: {
      live: "进行中",
      upcoming: "即将开始",
      completed: "已结束比赛",
      liveCount: "场进行中",
      todayCount: "今日对阵",
      completedCount: "已完成预测",
    },

    // Game card
    game: {
      vs: "VS",
      winProb: "胜率",
      predictedScore: "预测比分",
      spread: "让分",
      total: "总分",
      aiAnalysis: "AI 预测分析",
      final: "终场",
    },

    // Footer
    footer: {
      copyright: "© 2024 | NBAseer - AI智能NBA预测引擎 版权所有 | 京ICP备xxx号",
      terms: "条款",
      privacy: "隐私",
      apiDocs: "API文档",
    },

    // Common
    common: {
      viewAll: "查看全部",
      loading: "加载中...",
      error: "出错了",
      noData: "暂无数据",
    },
  },

  en: {
    // Navigation
    nav: {
      predictions: "Predictions",
      games: "Games",
      analysis: "Analysis",
      about: "About",
    },

    // Hero section
    hero: {
      title: "nbaseer AI Prediction Engine",
      highlight: "Full Data",
      subtitle: "Enabled",
      description:
        "No need for manual calculations. Analyzing over 1.2M+ data points daily with high accuracy and confidence.",
      cta1: "All Team Picks",
      cta2: "View History",
    },

    // Stats
    stats: {
      accuracy: "Historical Accuracy",
      avgReturn: "Avg Return",
      predictions: "Total Predictions",
      winRate: "Win Rate",
    },

    // Sections
    sections: {
      live: "Live",
      upcoming: "Upcoming",
      completed: "Completed",
      liveCount: "games live",
      todayCount: "today's games",
      completedCount: "predictions made",
    },

    // Game card
    game: {
      vs: "VS",
      winProb: "Win Prob",
      predictedScore: "Predicted Score",
      spread: "Spread",
      total: "Total",
      aiAnalysis: "AI Analysis",
      final: "Final",
    },

    // Footer
    footer: {
      copyright: "© 2024 | NBAseer - AI NBA Prediction Engine. All rights reserved.",
      terms: "Terms",
      privacy: "Privacy",
      apiDocs: "API Docs",
    },

    // Common
    common: {
      viewAll: "View All",
      loading: "Loading...",
      error: "Error",
      noData: "No data",
    },
  },
};

export function getTranslation(locale: Locale) {
  return translations[locale];
}
