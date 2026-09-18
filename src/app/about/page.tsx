"use client";

import { useLocale } from "@/lib/LocaleContext";
import { BACKTEST } from "@/lib/backtest";

const content = {
  zh: {
    title: "关于",
    brand: "nbaseer",
    subtitle:
      "nbaseer 用一个公开的 Elo 评分模型预测 NBA 比赛，给出胜负概率、分差和总分。模型不复杂，但每一个数字都可以复现——包括它算错的那些。",
    features: "这个站做什么",
    feature1Title: "评分模型",
    feature1Desc:
      "每支球队维护一个 Elo 评分，按比赛的净胜分更新。预测时叠加主场优势和背靠背因素，换算成胜率与分差。",
    feature2Title: "自动同步",
    feature2Desc:
      "赛程与比分每 10 分钟从 ESPN 拉取一次。预测在赛前写入数据库，赛后按最终比分自动结算，不作事后修改。",
    feature3Title: "公开回测",
    feature3Desc:
      "上赛季 1,172 场比赛的滚动回测结果公开在下方和历史页。每条预测都由「该场比赛之前」的评分生成，不使用任何赛后信息。",
    tech: "实现细节",
    dataProcessing: "数据",
    dataPoints: [
      "赛程与比分：ESPN 公开接口，每 10 分钟同步",
      "博彩赔率：The Odds API，每 6 小时取一次多家均值",
      "评分种子：2025-26 赛季全部 1,322 场比赛回放得出",
      "存储与运行：Cloudflare D1 + Workers，代码开源可查",
    ],
    aiModel: "模型",
    modelPoints: [
      "Elo 评分，按净胜分缩放更新幅度（FiveThirtyEight 方案）",
      "主场优势约 2.5 分，背靠背约 1 分",
      "总分由双方进攻/防守得分率估算，赛季初向联盟均值回归",
      "有赔率时与盘口各取一半做校准，无赔率时模型独立出数",
    ],
    stats: "回测结果",
    statsNote:
      "以下数字来自对 2025-26 赛季的滚动回测：按时间顺序逐场预测，预测完成后才把该场结果并入评分。前 150 场为评分预热期，不计入统计。",
    accuracy: "胜负命中率",
    totalPredictions: "回测场次",
    spreadMae: "平均分差误差",
    brierScore: "Brier 分数",
    brierNote: "0.25 = 抛硬币",
    disclaimer: "免责声明",
    disclaimerText:
      "nbaseer 的预测是统计模型的输出，仅供参考，不构成任何投注或投资建议。模型会出错且经常出错，过往命中率不代表未来表现。请自行判断并承担决策风险。",
    contact: "联系我们",
    contactText: "如有问题或建议，请发送邮件至",
  },
  en: {
    title: "About",
    brand: "nbaseer",
    subtitle:
      "nbaseer predicts NBA games with a published Elo rating model: win probability, spread and total. The model is not clever, but every number it produces can be reproduced — including the ones it gets wrong.",
    features: "What this site does",
    feature1Title: "Rating model",
    feature1Desc:
      "Each team carries an Elo rating updated by margin of victory. Predictions add home court and back-to-back adjustments, then convert the rating gap into a win probability and a spread.",
    feature2Title: "Automatic sync",
    feature2Desc:
      "Schedules and scores refresh from ESPN every 10 minutes. Predictions are written before tip-off and settled against the final score afterwards, never adjusted in hindsight.",
    feature3Title: "Published backtest",
    feature3Desc:
      "A walk-forward backtest over 1,172 games from last season is shown below and on the history page. Every prediction came from ratings as they stood before that game, using no post-game information.",
    tech: "Implementation",
    dataProcessing: "Data",
    dataPoints: [
      "Schedules and scores: ESPN public API, synced every 10 minutes",
      "Bookmaker odds: The Odds API, averaged across books every 6 hours",
      "Rating seeds: replayed from all 1,322 games of the 2025-26 season",
      "Storage and runtime: Cloudflare D1 + Workers, code open to inspection",
    ],
    aiModel: "Model",
    modelPoints: [
      "Elo with margin-of-victory scaling (the FiveThirtyEight formulation)",
      "Home court worth roughly 2.5 points, back-to-back about 1 point",
      "Totals estimated from both teams' scoring rates, regressed to league average early in the season",
      "When odds exist the model is blended 50/50 with the market; otherwise it stands alone",
    ],
    stats: "Backtest results",
    statsNote:
      "These come from a walk-forward backtest of the 2025-26 season: games are predicted in chronological order, and each result is folded into the ratings only after its prediction was made. The first 150 games are a warm-up period and are excluded.",
    accuracy: "Winner accuracy",
    totalPredictions: "Games backtested",
    spreadMae: "Avg spread error",
    brierScore: "Brier score",
    brierNote: "0.25 = coin flip",
    disclaimer: "Disclaimer",
    disclaimerText:
      "nbaseer's predictions are statistical model output, provided for reference only. They are not betting or investment advice. The model is wrong regularly, and past accuracy does not predict future accuracy. Judge for yourself and carry your own risk.",
    contact: "Contact Us",
    contactText: "For questions or suggestions, please email",
  },
};

export default function AboutPage() {
  const { locale } = useLocale();
  const t = content[locale];

  return (
    <div className="pt-8 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-16">
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
        <p className="text-slate-400 leading-relaxed max-w-3xl">{t.statsNote}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black text-primary mb-2">
              {BACKTEST.winner_accuracy}%
            </div>
            <div className="text-sm text-slate-400">{t.accuracy}</div>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black mb-2">
              {BACKTEST.games_evaluated.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">{t.totalPredictions}</div>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black text-blue-400 mb-2">
              {BACKTEST.spread_mae}
            </div>
            <div className="text-sm text-slate-400">{t.spreadMae}</div>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black text-green-500 mb-2">
              {BACKTEST.brier_score}
            </div>
            <div className="text-sm text-slate-400">
              {t.brierScore}
              <span className="block text-xs text-slate-600">{t.brierNote}</span>
            </div>
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
