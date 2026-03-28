export type Locale = "zh" | "en";

export const translations = {
  zh: {
    // Navigation
    nav: {
      predictions: "预测",
      scores: "比分",
      history: "历史",
      about: "关于",
    },

    // Hero section
    hero: {
      badge: "AI Engine v4.2 PRO",
      title: "nbaseer AI 预测引擎",
      highlight: "全量数据",
      subtitle: "已开启",
      description: "利用先进的深度学习算法，每秒分析超过 120万 个数据点。所有高级指标、实时预测与市场赔率现已全部解锁。",
      cta1: "立即开始探索",
      cta2: "查看技术白皮书",
      feature1Title: "多维分析",
      feature1Desc: "集成伤病、背靠背、客场表现等50+关键变量。",
      feature2Title: "毫秒响应",
      feature2Desc: "球场变幻莫测，AI 模型实时同步最新赔率与动态。",
    },

    // Sections
    sections: {
      live: "进行中",
      liveGames: "场比赛",
      upcoming: "即将开始",
      upcomingSubtitle: "AI 预测中心",
      completed: "已结束比赛",
      completedSubtitle: "昨日赛果分析",
    },

    // Game card
    game: {
      vs: "VS",
      winProb: "胜率",
      predictedScore: "预测比分",
      predictedSpread: "预测分差",
      predictedTotal: "预测总分",
      actualSpread: "实际分差",
      spread: "让分",
      total: "总分",
      confidence: "置信度",
      hotPick: "热门预测",
      aiAnalysis: "AI 深度分析",
      viewDetails: "查看详情",
      final: "FINAL",
      hit: "预测命中",
      miss: "未命中",
      tbd: "待定",
      quarter: "第 {n} 节",
      liveWinProb: "实时胜率",
    },

    // Odds
    odds: {
      title: "参考赔率",
      subtitle: "市场实时数据",
      moneyline: "独赢 (ML)",
      spread: "让分 (Spread)",
      spreadShort: "让分 (SPR)",
      total: "总分 (Total)",
      totalShort: "总分 (O/U)",
    },

    // Scores page
    scoresPage: {
      title: "NBA 比分中心",
      subtitle: "实时比分、赛程安排和比赛数据",
      yesterday: "昨天",
      today: "今天",
      tomorrow: "明天",
      noGames: "该日期暂无比赛",
      upcoming: "即将开始",
      final: "已结束",
    },

    // History page
    historyPage: {
      title: "预测历史",
      subtitle: "AI 模型历史预测记录与准确率分析",
      overallStats: "整体统计",
      totalPredictions: "总预测数",
      correctPredictions: "正确预测",
      accuracy: "准确率",
      avgSpreadError: "平均分差误差",
      recentPredictions: "近期预测",
      viewMore: "查看更多历史记录",
      correct: "正确",
      incorrect: "错误",
      predictedWinner: "预测胜方",
      actualWinner: "实际胜方",
      noHistory: "暂无历史记录",
    },

    // About page
    aboutPage: {
      title: "关于 NBAseer",
      subtitle: "AI 驱动的 NBA 比赛预测平台",
      missionTitle: "我们的使命",
      missionText: "NBAseer 致力于利用先进的人工智能技术，为 NBA 球迷和分析师提供准确、可靠的比赛预测服务。",
      howItWorksTitle: "工作原理",
      howItWorksText: "我们的 AI 模型分析数百个变量，包括球队历史战绩、球员状态、主客场表现、背靠背比赛影响等，生成高置信度的预测结果。",
      dataSourcesTitle: "数据来源",
      dataSourcesText: "我们的数据来自 ESPN 官方 API，确保数据的准确性和实时性。所有预测基于历史数据和统计模型，仅供参考。",
      disclaimerTitle: "免责声明",
      disclaimerText: "本平台提供的预测仅供娱乐和参考目的，不构成任何投资或博彩建议。请理性对待预测结果，量力而行。",
      contactTitle: "联系我们",
      contactText: "如有任何问题或建议，请通过以下方式联系我们。",
      email: "邮箱",
    },

    // Whitepaper page
    whitepaperPage: {
      title: "技术白皮书",
      subtitle: "NBAseer AI 预测系统技术原理详解",
      overview: "系统概述",
      overviewText: "NBAseer 采用先进的机器学习技术，结合深度神经网络和集成学习方法，对 NBA 比赛结果进行预测。",
      dataCollection: "数据采集",
      dataCollectionText: "系统实时从 ESPN API 获取比赛数据，包括球队统计、球员表现、历史对战记录等。",
      featureEngineering: "特征工程",
      featureEngineeringText: "我们提取超过 50 个关键特征变量，包括：",
      features: [
        "球队近期战绩（近 5/10/20 场）",
        "主客场胜率差异",
        "背靠背比赛影响因子",
        "球员伤病状态",
        "历史交锋记录",
        "进攻/防守效率评分",
        "节奏因子与比赛风格匹配",
        "休息天数影响",
      ],
      modelArchitecture: "模型架构",
      modelArchitectureText: "我们使用 XGBoost 集成学习框架，结合以下三个独立模型：",
      models: [
        "胜负预测模型：预测比赛胜方",
        "分差预测模型：预测最终分差",
        "总分预测模型：预测两队总得分",
      ],
      accuracy: "准确率分析",
      accuracyText: "基于历史回测数据，我们的模型表现如下：",
      accuracyMetrics: [
        "胜负预测准确率：约 62-65%",
        "分差预测平均误差：约 8-10 分",
        "总分预测平均误差：约 10-15 分",
      ],
      limitations: "局限性说明",
      limitationsText: "任何预测模型都存在局限性，影响因素包括：突发伤病、球员状态波动、战术调整等不可预测因素。请将预测结果作为参考，而非绝对依据。",
      updates: "持续更新",
      updatesText: "我们的模型持续学习最新比赛数据，定期优化算法参数，以提供更准确的预测服务。",
    },

    // Game detail page
    gameDetailPage: {
      title: "比赛详情",
      matchup: "对阵信息",
      prediction: "AI 预测",
      odds: "赔率对比",
      analysis: "深度分析",
      homeTeam: "主队",
      awayTeam: "客队",
      gameTime: "比赛时间",
      venue: "比赛场馆",
      status: "状态",
      scheduled: "未开始",
      live: "进行中",
      final: "已结束",
      predictionSummary: "预测摘要",
      winProbability: "胜率预测",
      spreadPrediction: "分差预测",
      totalPrediction: "总分预测",
      marketOdds: "市场赔率",
      valueAnalysis: "价值分析",
      backToHome: "返回首页",
      gameNotFound: "比赛不存在",
      loading: "加载中...",
    },

    // Footer
    footer: {
      copyright: "AI驱动的NBA赛事预测",
      syncTime: "数据同步时间",
      terms: "条款",
      privacy: "隐私",
      apiDocs: "API文档",
      support: "支持",
    },

    // Common
    common: {
      viewAll: "查看全部",
      loading: "加载中...",
      error: "出错了",
      noData: "暂无数据",
      games: "场",
      points: "分",
    },
  },

  en: {
    // Navigation
    nav: {
      predictions: "Predictions",
      scores: "Scores",
      history: "History",
      about: "About",
    },

    // Hero section
    hero: {
      badge: "AI Engine v4.2 PRO",
      title: "nbaseer AI Prediction Engine",
      highlight: "Full Data",
      subtitle: "Enabled",
      description: "Using advanced deep learning algorithms, analyzing over 1.2 million data points per second. All advanced metrics, real-time predictions and market odds are now fully unlocked.",
      cta1: "Start Exploring",
      cta2: "View Whitepaper",
      feature1Title: "Multi-Dimensional",
      feature1Desc: "Integrating 50+ key variables including injuries, back-to-backs, and away performance.",
      feature2Title: "Real-Time",
      feature2Desc: "AI model syncs with the latest odds and dynamics in milliseconds.",
    },

    // Sections
    sections: {
      live: "Live",
      liveGames: "games",
      upcoming: "Upcoming",
      upcomingSubtitle: "AI Prediction Center",
      completed: "Completed",
      completedSubtitle: "Yesterday's Results",
    },

    // Game card
    game: {
      vs: "VS",
      winProb: "Win %",
      predictedScore: "Predicted Score",
      predictedSpread: "Pred. Spread",
      predictedTotal: "Pred. Total",
      actualSpread: "Actual",
      spread: "Spread",
      total: "Total",
      confidence: "Confidence",
      hotPick: "HOT PICK",
      aiAnalysis: "AI Analysis",
      viewDetails: "View Details",
      final: "FINAL",
      hit: "HIT",
      miss: "MISS",
      tbd: "TBD",
      quarter: "Q{n}",
      liveWinProb: "Win %",
    },

    // Odds
    odds: {
      title: "Odds",
      subtitle: "Live Market Data",
      moneyline: "Moneyline (ML)",
      spread: "Spread",
      spreadShort: "Spread (SPR)",
      total: "Total (O/U)",
      totalShort: "Total (O/U)",
    },

    // Scores page
    scoresPage: {
      title: "NBA Scores",
      subtitle: "Live scores, schedules and game data",
      yesterday: "Yesterday",
      today: "Today",
      tomorrow: "Tomorrow",
      noGames: "No games on this date",
      upcoming: "Upcoming",
      final: "Final",
    },

    // History page
    historyPage: {
      title: "Prediction History",
      subtitle: "AI model historical predictions and accuracy analysis",
      overallStats: "Overall Statistics",
      totalPredictions: "Total Predictions",
      correctPredictions: "Correct Predictions",
      accuracy: "Accuracy",
      avgSpreadError: "Avg Spread Error",
      recentPredictions: "Recent Predictions",
      viewMore: "View More History",
      correct: "Correct",
      incorrect: "Incorrect",
      predictedWinner: "Predicted Winner",
      actualWinner: "Actual Winner",
      noHistory: "No history available",
    },

    // About page
    aboutPage: {
      title: "About NBAseer",
      subtitle: "AI-Powered NBA Game Prediction Platform",
      missionTitle: "Our Mission",
      missionText: "NBAseer is dedicated to providing accurate and reliable game predictions for NBA fans and analysts using advanced artificial intelligence technology.",
      howItWorksTitle: "How It Works",
      howItWorksText: "Our AI model analyzes hundreds of variables, including team historical records, player conditions, home/away performance, and back-to-back game impacts to generate high-confidence predictions.",
      dataSourcesTitle: "Data Sources",
      dataSourcesText: "Our data comes from the official ESPN API, ensuring accuracy and real-time updates. All predictions are based on historical data and statistical models, for reference only.",
      disclaimerTitle: "Disclaimer",
      disclaimerText: "Predictions provided by this platform are for entertainment and reference purposes only and do not constitute investment or betting advice. Please treat prediction results rationally.",
      contactTitle: "Contact Us",
      contactText: "If you have any questions or suggestions, please contact us through the following channels.",
      email: "Email",
    },

    // Whitepaper page
    whitepaperPage: {
      title: "Technical Whitepaper",
      subtitle: "NBAseer AI Prediction System Technical Overview",
      overview: "System Overview",
      overviewText: "NBAseer employs advanced machine learning techniques, combining deep neural networks and ensemble learning methods to predict NBA game outcomes.",
      dataCollection: "Data Collection",
      dataCollectionText: "The system collects real-time game data from the ESPN API, including team statistics, player performance, and historical matchup records.",
      featureEngineering: "Feature Engineering",
      featureEngineeringText: "We extract over 50 key feature variables, including:",
      features: [
        "Team recent performance (last 5/10/20 games)",
        "Home vs away win rate differential",
        "Back-to-back game impact factor",
        "Player injury status",
        "Historical head-to-head records",
        "Offensive/Defensive efficiency ratings",
        "Pace factor and playstyle matching",
        "Rest days impact",
      ],
      modelArchitecture: "Model Architecture",
      modelArchitectureText: "We use the XGBoost ensemble learning framework with three independent models:",
      models: [
        "Win/Loss Prediction Model: Predicts game winner",
        "Spread Prediction Model: Predicts final point spread",
        "Total Points Model: Predicts combined score",
      ],
      accuracy: "Accuracy Analysis",
      accuracyText: "Based on historical backtesting data, our model performance:",
      accuracyMetrics: [
        "Win/Loss prediction accuracy: ~62-65%",
        "Spread prediction average error: ~8-10 points",
        "Total points prediction average error: ~10-15 points",
      ],
      limitations: "Limitations",
      limitationsText: "All prediction models have limitations. Influencing factors include: sudden injuries, player condition fluctuations, tactical adjustments, and other unpredictable factors. Please use predictions as reference, not absolute guidance.",
      updates: "Continuous Updates",
      updatesText: "Our model continuously learns from the latest game data and regularly optimizes algorithm parameters to provide more accurate prediction services.",
    },

    // Game detail page
    gameDetailPage: {
      title: "Game Details",
      matchup: "Matchup",
      prediction: "AI Prediction",
      odds: "Odds Comparison",
      analysis: "Deep Analysis",
      homeTeam: "Home",
      awayTeam: "Away",
      gameTime: "Game Time",
      venue: "Venue",
      status: "Status",
      scheduled: "Scheduled",
      live: "Live",
      final: "Final",
      predictionSummary: "Prediction Summary",
      winProbability: "Win Probability",
      spreadPrediction: "Spread Prediction",
      totalPrediction: "Total Prediction",
      marketOdds: "Market Odds",
      valueAnalysis: "Value Analysis",
      backToHome: "Back to Home",
      gameNotFound: "Game not found",
      loading: "Loading...",
    },

    // Footer
    footer: {
      copyright: "AI-Powered NBA Prediction",
      syncTime: "Data synced at",
      terms: "Terms",
      privacy: "Privacy",
      apiDocs: "API Docs",
      support: "Support",
    },

    // Common
    common: {
      viewAll: "View All",
      loading: "Loading...",
      error: "Error",
      noData: "No data",
      games: "games",
      points: "pts",
    },
  },
};

export function getTranslation(locale: Locale) {
  return translations[locale];
}

// Helper hook for components
export function useTranslation(locale: Locale) {
  return translations[locale];
}
