"use client";

import { useLocale } from "@/lib/LocaleContext";

const content = {
  zh: {
    title: "关于",
    brand: "nbaseer",
    subtitle: "nbaseer 是一个基于深度学习的 NBA 比赛预测平台，利用先进的 AI 技术分析海量数据，为用户提供高准确率的比赛预测和实时分析。",
    features: "核心功能",
    feature1Title: "智能预测",
    feature1Desc: "基于深度神经网络分析球队历史数据、球员表现、伤病情况等50+关键变量，提供胜负、分差、总分预测。",
    feature2Title: "实时更新",
    feature2Desc: "毫秒级数据同步，实时追踪比赛进程、市场赔率变化，动态调整预测概率，确保信息时效性。",
    feature3Title: "高准确率",
    feature3Desc: "历史预测准确率达到67.8%，远超市场平均水平。所有预测记录透明可查，支持历史数据回溯。",
    tech: "技术架构",
    dataProcessing: "数据处理",
    dataPoints: [
      "每秒分析超过 120 万个数据点",
      "集成 NBA 官方 API 实时数据",
      "历史数据回溯至 2010 赛季",
      "多源赔率数据聚合分析",
    ],
    aiModel: "AI 模型",
    modelPoints: [
      "深度神经网络 (DNN) 架构",
      "XGBoost 集成学习增强",
      "每日自动模型迭代优化",
      "贝叶斯概率校准",
    ],
    stats: "平台数据",
    accuracy: "预测准确率",
    totalPredictions: "累计预测场次",
    avgROI: "平均 ROI",
    dataPerSecond: "每秒数据点",
    disclaimer: "免责声明",
    disclaimerText: "nbaseer 提供的所有预测和分析仅供参考，不构成任何投资建议。体育比赛结果具有不确定性，过往表现不代表未来结果。请用户理性对待预测数据，自行承担决策风险。",
    contact: "联系我们",
    contactText: "如有问题或建议，请发送邮件至",
  },
  en: {
    title: "About",
    brand: "nbaseer",
    subtitle: "nbaseer is a deep learning-based NBA game prediction platform that uses advanced AI technology to analyze massive amounts of data, providing users with high-accuracy game predictions and real-time analysis.",
    features: "Core Features",
    feature1Title: "Smart Predictions",
    feature1Desc: "Using deep neural networks to analyze team history, player performance, injuries, and 50+ key variables to provide win/loss, spread, and total predictions.",
    feature2Title: "Real-Time Updates",
    feature2Desc: "Millisecond-level data sync, real-time tracking of game progress and odds changes, dynamically adjusting prediction probabilities for timely information.",
    feature3Title: "High Accuracy",
    feature3Desc: "Historical prediction accuracy of 67.8%, far exceeding market averages. All prediction records are transparent and traceable with historical data support.",
    tech: "Technology",
    dataProcessing: "Data Processing",
    dataPoints: [
      "Analyzing over 1.2 million data points per second",
      "Integrated with official NBA API for real-time data",
      "Historical data dating back to the 2010 season",
      "Multi-source odds data aggregation and analysis",
    ],
    aiModel: "AI Model",
    modelPoints: [
      "Deep Neural Network (DNN) Architecture",
      "XGBoost Ensemble Learning Enhancement",
      "Daily automatic model iteration optimization",
      "Bayesian probability calibration",
    ],
    stats: "Platform Statistics",
    accuracy: "Prediction Accuracy",
    totalPredictions: "Total Predictions",
    avgROI: "Average ROI",
    dataPerSecond: "Data Points/Sec",
    disclaimer: "Disclaimer",
    disclaimerText: "All predictions and analysis provided by nbaseer are for reference only and do not constitute investment advice. Sports outcomes are uncertain, and past performance does not guarantee future results. Please treat prediction data rationally and bear decision-making risks yourself.",
    contact: "Contact Us",
    contactText: "For questions or suggestions, please email",
  },
};

export default function AboutPage() {
  const { locale } = useLocale();
  const t = content[locale];

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-[#0f141a] p-8 md:p-16 border border-white/5">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-l from-primary/50 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            {t.title} <span className="text-primary">{t.brand}</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <span className="w-2 h-8 bg-primary rounded-full" />
          {t.features}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f141a] border border-white/5 p-8 rounded-xl hover:border-primary/30 transition-all">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">{t.feature1Title}</h3>
            <p className="text-slate-400 leading-relaxed">{t.feature1Desc}</p>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-8 rounded-xl hover:border-primary/30 transition-all">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">{t.feature2Title}</h3>
            <p className="text-slate-400 leading-relaxed">{t.feature2Desc}</p>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-8 rounded-xl hover:border-primary/30 transition-all">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">{t.feature3Title}</h3>
            <p className="text-slate-400 leading-relaxed">{t.feature3Desc}</p>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-500 rounded-full" />
          {t.tech}
        </h2>
        <div className="bg-[#0f141a] border border-white/5 p-8 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold">{t.dataProcessing}</h3>
              <ul className="space-y-3 text-slate-400">
                {t.dataPoints.map((point, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-bold">{t.aiModel}</h3>
              <ul className="space-y-3 text-slate-400">
                {t.modelPoints.map((point, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <span className="w-2 h-8 bg-green-500 rounded-full" />
          {t.stats}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black text-primary mb-2">67.8%</div>
            <div className="text-sm text-slate-400">{t.accuracy}</div>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black mb-2">12,847</div>
            <div className="text-sm text-slate-400">{t.totalPredictions}</div>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black text-green-500 mb-2">+8.2%</div>
            <div className="text-sm text-slate-400">{t.avgROI}</div>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black text-blue-400 mb-2">120M+</div>
            <div className="text-sm text-slate-400">{t.dataPerSecond}</div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-[#0f141a] border border-yellow-500/20 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-yellow-500 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {t.disclaimer}
        </h3>
        <p className="text-slate-400 leading-relaxed">{t.disclaimerText}</p>
      </section>

      {/* Contact */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-bold">{t.contact}</h2>
        <p className="text-slate-400">
          {t.contactText}{" "}
          <a href="mailto:support@nbaseer.com" className="text-primary hover:underline">
            support@nbaseer.com
          </a>
        </p>
      </section>
    </div>
  );
}
