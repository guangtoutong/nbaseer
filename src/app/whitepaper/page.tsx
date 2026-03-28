"use client";

import { useLocale } from "@/lib/LocaleContext";

const content = {
  zh: {
    badge: "技术白皮书",
    title: "NBAseer AI 预测引擎",
    subtitle: "技术白皮书",
    description: "深入了解我们如何利用机器学习和大数据分析来预测 NBA 比赛结果",
    toc: "目录",
    tocItems: [
      { id: "overview", label: "1. 系统概述" },
      { id: "data", label: "2. 数据来源与处理" },
      { id: "features", label: "3. 特征工程" },
      { id: "model", label: "4. 预测模型架构" },
      { id: "training", label: "5. 模型训练与优化" },
      { id: "accuracy", label: "6. 准确率与验证" },
      { id: "realtime", label: "7. 实时预测系统" },
      { id: "future", label: "8. 未来规划" },
    ],
    section1: {
      title: "系统概述",
      text: "NBAseer 是一个基于机器学习的 NBA 比赛预测系统，旨在通过分析历史数据、球队表现、球员状态等多维度信息，为用户提供准确的比赛胜负预测、分差预测和大小分预测。",
      stat1: "胜负预测准确率",
      stat2: "分析维度",
      stat3: "数据更新",
      stat3Value: "实时",
    },
    section2: {
      title: "数据来源与处理",
      text: "我们的系统整合了多个权威数据源，确保预测所依赖的数据准确、全面且实时更新。",
      sources: [
        { name: "ESPN API", desc: "实时比分、赛程安排、比赛状态" },
        { name: "NBA 官方数据", desc: "球队统计、球员数据、历史战绩" },
        { name: "The Odds API", desc: "博彩赔率、让分盘、大小分盘" },
      ],
    },
    section3: {
      title: "特征工程",
      text: "特征工程是机器学习中最关键的环节之一。我们从原始数据中提取了超过 50 个有意义的特征维度。",
      tableHeaders: ["特征类别", "具体特征", "重要性"],
      features: [
        { cat: "基础战绩", details: "胜率、主场胜率、客场胜率、分区排名", importance: "高" },
        { cat: "近期状态", details: "近 5/10 场胜率、连胜/连败、得分趋势", importance: "高" },
        { cat: "进攻能力", details: "场均得分、进攻效率、三分命中率、助攻数", importance: "中" },
        { cat: "防守能力", details: "场均失分、防守效率、篮板、抢断、盖帽", importance: "中" },
        { cat: "对战历史", details: "历史交锋胜率、场均分差、主客场战绩", importance: "中" },
        { cat: "体能因素", details: "背靠背比赛、休息天数、旅途距离", importance: "高" },
        { cat: "比赛节奏", details: "回合数、节奏指数、快攻得分", importance: "低" },
      ],
      high: "高",
      medium: "中",
      low: "低",
    },
    section4: {
      title: "预测模型架构",
      text: "我们采用了集成学习的方法，构建了三个独立但相互关联的预测模型。",
      models: [
        { name: "胜负预测模型", type: "XGBoost 分类器", input: "输入: 特征向量", output: "输出: 主队获胜概率" },
        { name: "分差预测模型", type: "XGBoost 回归器", input: "输入: 特征向量", output: "输出: 预测分差" },
        { name: "总分预测模型", type: "XGBoost 回归器", input: "输入: 特征向量", output: "输出: 两队总得分" },
      ],
      whyXGBoost: "为什么选择 XGBoost?",
      xgboostReasons: [
        "优秀的处理缺失值能力",
        "内置正则化防止过拟合",
        "高效的并行计算",
        "强大的特征重要性分析",
      ],
    },
    section5: {
      title: "模型训练与优化",
      trainingData: "训练数据",
      trainingItems: [
        "近 3 个赛季的全部比赛数据",
        "超过 3,600 场常规赛",
        "300+ 场季后赛数据",
      ],
      optimization: "优化策略",
      optimizationItems: [
        "5 折交叉验证",
        "贝叶斯超参数优化",
        "特征选择与降维",
      ],
    },
    section6: {
      title: "准确率与验证",
      text: "我们使用历史数据进行回测验证，确保模型在实际应用中的可靠性。",
      metrics: [
        { label: "胜负预测", value: "67.8%", sublabel: "准确率" },
        { label: "分差预测", value: "8.2", sublabel: "MAE (平均绝对误差)" },
        { label: "总分预测", value: "12.5", sublabel: "MAE (平均绝对误差)" },
      ],
      warning: "重要提示: 博彩市场效率很高，即使是最好的模型也难以保证长期盈利。本系统仅供参考和娱乐，请理性投注。",
    },
    section7: {
      title: "实时预测系统",
      text: "我们的系统采用 Cloudflare Workers 实现边缘计算，确保全球用户都能获得低延迟的实时预测服务。",
      techStack: "技术架构",
      techItems: [
        "Next.js 15 + React 服务端渲染",
        "Cloudflare Pages 全球 CDN",
        "Cloudflare D1 SQLite 数据库",
        "Cloudflare Workers 定时任务",
      ],
      updateFreq: "数据更新频率",
      updateItems: [
        "比赛数据: 每 30 分钟",
        "赔率数据: 每小时",
        "预测结果: 实时计算",
        "历史统计: 每日更新",
      ],
    },
    section8: {
      title: "未来规划",
      plans: [
        { quarter: "Q2 2024", title: "深度学习升级", desc: "引入 Transformer 架构处理序列数据" },
        { quarter: "Q3 2024", title: "球员级别分析", desc: "加入球员伤病、出场时间等因素" },
        { quarter: "Q4 2024", title: "实时盘口追踪", desc: "监控盘口变化，发现价值投注" },
        { quarter: "2025", title: "多联赛扩展", desc: "支持 NFL、MLB、NHL 等联赛" },
      ],
    },
    footer: "NBAseer AI Prediction Engine v4.2 PRO | 最后更新: 2024年3月",
  },
  en: {
    badge: "Technical Whitepaper",
    title: "NBAseer AI Prediction Engine",
    subtitle: "Technical Whitepaper",
    description: "Learn how we use machine learning and big data analytics to predict NBA game outcomes",
    toc: "Table of Contents",
    tocItems: [
      { id: "overview", label: "1. System Overview" },
      { id: "data", label: "2. Data Sources & Processing" },
      { id: "features", label: "3. Feature Engineering" },
      { id: "model", label: "4. Prediction Model Architecture" },
      { id: "training", label: "5. Model Training & Optimization" },
      { id: "accuracy", label: "6. Accuracy & Validation" },
      { id: "realtime", label: "7. Real-Time Prediction System" },
      { id: "future", label: "8. Future Roadmap" },
    ],
    section1: {
      title: "System Overview",
      text: "NBAseer is a machine learning-based NBA game prediction system designed to provide accurate win/loss predictions, spread predictions, and over/under predictions by analyzing historical data, team performance, and player conditions.",
      stat1: "Win/Loss Accuracy",
      stat2: "Analysis Dimensions",
      stat3: "Data Update",
      stat3Value: "Real-time",
    },
    section2: {
      title: "Data Sources & Processing",
      text: "Our system integrates multiple authoritative data sources to ensure accurate, comprehensive, and real-time data for predictions.",
      sources: [
        { name: "ESPN API", desc: "Live scores, schedules, game status" },
        { name: "NBA Official Data", desc: "Team stats, player data, historical records" },
        { name: "The Odds API", desc: "Betting odds, spreads, over/under lines" },
      ],
    },
    section3: {
      title: "Feature Engineering",
      text: "Feature engineering is one of the most critical aspects of machine learning. We extract over 50 meaningful feature dimensions from raw data.",
      tableHeaders: ["Feature Category", "Specific Features", "Importance"],
      features: [
        { cat: "Basic Record", details: "Win rate, home win rate, away win rate, division rank", importance: "high" },
        { cat: "Recent Form", details: "Last 5/10 game win rate, streaks, scoring trends", importance: "high" },
        { cat: "Offense", details: "PPG, offensive efficiency, 3PT%, assists", importance: "medium" },
        { cat: "Defense", details: "Opponent PPG, defensive efficiency, rebounds, steals, blocks", importance: "medium" },
        { cat: "Head-to-Head", details: "Historical matchup win rate, avg spread, home/away record", importance: "medium" },
        { cat: "Fatigue", details: "Back-to-back games, rest days, travel distance", importance: "high" },
        { cat: "Pace", details: "Possessions, pace index, fast break points", importance: "low" },
      ],
      high: "High",
      medium: "Medium",
      low: "Low",
    },
    section4: {
      title: "Prediction Model Architecture",
      text: "We employ ensemble learning methods to build three independent but interconnected prediction models.",
      models: [
        { name: "Win/Loss Predictor", type: "XGBoost Classifier", input: "Input: Feature Vector", output: "Output: Home Win Probability" },
        { name: "Spread Predictor", type: "XGBoost Regressor", input: "Input: Feature Vector", output: "Output: Predicted Spread" },
        { name: "Total Predictor", type: "XGBoost Regressor", input: "Input: Feature Vector", output: "Output: Combined Score" },
      ],
      whyXGBoost: "Why XGBoost?",
      xgboostReasons: [
        "Excellent handling of missing values",
        "Built-in regularization to prevent overfitting",
        "Efficient parallel computation",
        "Powerful feature importance analysis",
      ],
    },
    section5: {
      title: "Model Training & Optimization",
      trainingData: "Training Data",
      trainingItems: [
        "All game data from the last 3 seasons",
        "Over 3,600 regular season games",
        "300+ playoff games",
      ],
      optimization: "Optimization Strategy",
      optimizationItems: [
        "5-fold cross-validation",
        "Bayesian hyperparameter optimization",
        "Feature selection and dimensionality reduction",
      ],
    },
    section6: {
      title: "Accuracy & Validation",
      text: "We use historical data for backtesting to ensure model reliability in real-world applications.",
      metrics: [
        { label: "Win/Loss", value: "67.8%", sublabel: "Accuracy" },
        { label: "Spread", value: "8.2", sublabel: "MAE (Mean Absolute Error)" },
        { label: "Total", value: "12.5", sublabel: "MAE (Mean Absolute Error)" },
      ],
      warning: "Important: Betting markets are highly efficient, and even the best models cannot guarantee long-term profits. This system is for reference and entertainment only. Please bet responsibly.",
    },
    section7: {
      title: "Real-Time Prediction System",
      text: "Our system uses Cloudflare Workers for edge computing, ensuring low-latency real-time prediction services for users worldwide.",
      techStack: "Tech Stack",
      techItems: [
        "Next.js 15 + React Server-Side Rendering",
        "Cloudflare Pages Global CDN",
        "Cloudflare D1 SQLite Database",
        "Cloudflare Workers Scheduled Tasks",
      ],
      updateFreq: "Data Update Frequency",
      updateItems: [
        "Game data: Every 30 minutes",
        "Odds data: Hourly",
        "Predictions: Real-time calculation",
        "Historical stats: Daily updates",
      ],
    },
    section8: {
      title: "Future Roadmap",
      plans: [
        { quarter: "Q2 2024", title: "Deep Learning Upgrade", desc: "Introduce Transformer architecture for sequence data" },
        { quarter: "Q3 2024", title: "Player-Level Analysis", desc: "Add player injuries, playing time factors" },
        { quarter: "Q4 2024", title: "Real-Time Line Tracking", desc: "Monitor line movements, find value bets" },
        { quarter: "2025", title: "Multi-League Expansion", desc: "Support NFL, MLB, NHL and more" },
      ],
    },
    footer: "NBAseer AI Prediction Engine v4.2 PRO | Last Updated: March 2024",
  },
};

export default function WhitepaperPage() {
  const { locale } = useLocale();
  const t = content[locale];

  const getImportanceColor = (importance: string) => {
    const lower = importance.toLowerCase();
    if (lower === "高" || lower === "high") return "text-green-400";
    if (lower === "中" || lower === "medium") return "text-yellow-400";
    return "text-slate-400";
  };

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">{t.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">
            {t.title}
            <span className="block text-primary mt-2">{t.subtitle}</span>
          </h1>
          <p className="text-lg text-slate-400">{t.description}</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">{t.toc}</h2>
          <nav className="space-y-2 text-slate-400">
            {t.tocItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="block hover:text-primary transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Section 1 */}
          <section id="overview" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">1</span>
              {t.section1.title}
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">{t.section1.text}</p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                  <div className="text-3xl font-black text-primary">67.8%</div>
                  <div className="text-sm text-slate-400 mt-1">{t.section1.stat1}</div>
                </div>
                <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                  <div className="text-3xl font-black text-blue-400">50+</div>
                  <div className="text-sm text-slate-400 mt-1">{t.section1.stat2}</div>
                </div>
                <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                  <div className="text-3xl font-black text-green-400">{t.section1.stat3Value}</div>
                  <div className="text-sm text-slate-400 mt-1">{t.section1.stat3}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="data" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">2</span>
              {t.section2.title}
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">{t.section2.text}</p>
              <div className="space-y-3 mt-4">
                {t.section2.sources.map((source, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#1b2028] rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${i === 0 ? "bg-primary" : i === 1 ? "bg-blue-400" : "bg-green-400"}`} />
                    <div>
                      <h4 className="font-bold">{source.name}</h4>
                      <p className="text-sm text-slate-400">{source.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="features" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">3</span>
              {t.section3.title}
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">{t.section3.text}</p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      {t.section3.tableHeaders.map((header, i) => (
                        <th key={i} className="py-3 px-4 font-bold">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    {t.section3.features.map((feature, i) => (
                      <tr key={i} className={i < t.section3.features.length - 1 ? "border-b border-white/5" : ""}>
                        <td className="py-3 px-4">{feature.cat}</td>
                        <td className="py-3 px-4">{feature.details}</td>
                        <td className="py-3 px-4">
                          <span className={getImportanceColor(feature.importance)}>
                            {feature.importance === "high" ? t.section3.high : feature.importance === "medium" ? t.section3.medium : feature.importance === "low" ? t.section3.low : feature.importance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="model" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">4</span>
              {t.section4.title}
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-6">
              <p className="text-slate-300 leading-relaxed">{t.section4.text}</p>
              <div className="grid md:grid-cols-3 gap-4">
                {t.section4.models.map((model, i) => (
                  <div key={i} className={`p-5 bg-gradient-to-br ${i === 0 ? "from-primary/20" : i === 1 ? "from-blue-500/20" : "from-green-500/20"} to-transparent border ${i === 0 ? "border-primary/20" : i === 1 ? "border-blue-500/20" : "border-green-500/20"} rounded-xl`}>
                    <h4 className="font-bold text-lg mb-2">{model.name}</h4>
                    <p className="text-sm text-slate-400 mb-3">{model.type}</p>
                    <div className="text-xs text-slate-500">
                      <div>{model.input}</div>
                      <div>{model.output}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[#1b2028] rounded-lg">
                <h4 className="font-bold mb-2">{t.section4.whyXGBoost}</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  {t.section4.xgboostReasons.map((reason, i) => (
                    <li key={i}>• {reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="training" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">5</span>
              {t.section5.title}
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-3">{t.section5.trainingData}</h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    {t.section5.trainingItems.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3">{t.section5.optimization}</h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    {t.section5.optimizationItems.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="accuracy" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">6</span>
              {t.section6.title}
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">{t.section6.text}</p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {t.section6.metrics.map((metric, i) => (
                  <div key={i} className="p-4 bg-[#1b2028] rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">{metric.label}</div>
                    <div className={`text-2xl font-black ${i === 0 ? "text-green-400" : i === 1 ? "text-blue-400" : "text-primary"}`}>{metric.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{metric.sublabel}</div>
                    <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
                      <div className={`h-full rounded-full ${i === 0 ? "bg-green-400" : i === 1 ? "bg-blue-400" : "bg-primary"}`} style={{ width: i === 0 ? "67.8%" : i === 1 ? "60%" : "55%" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mt-4">
                <p className="text-sm text-yellow-200">{t.section6.warning}</p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="realtime" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">7</span>
              {t.section7.title}
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">{t.section7.text}</p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-[#1b2028] rounded-lg space-y-3">
                  <h4 className="font-bold">{t.section7.techStack}</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    {t.section7.techItems.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-[#1b2028] rounded-lg space-y-3">
                  <h4 className="font-bold">{t.section7.updateFreq}</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    {t.section7.updateItems.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="future" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">8</span>
              {t.section8.title}
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {t.section8.plans.map((plan, i) => (
                  <div key={i} className="p-4 border border-dashed border-white/10 rounded-lg">
                    <div className={`text-xs font-bold mb-2 ${i === 0 ? "text-primary" : i === 1 ? "text-blue-400" : i === 2 ? "text-green-400" : "text-yellow-400"}`}>{plan.quarter}</div>
                    <h4 className="font-bold mb-1">{plan.title}</h4>
                    <p className="text-sm text-slate-400">{plan.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-8 mt-12">
          <p className="text-sm text-slate-500 text-center">{t.footer}</p>
        </div>
      </div>
    </div>
  );
}
