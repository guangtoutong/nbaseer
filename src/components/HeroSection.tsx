"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { BACKTEST } from "@/lib/backtest";

const content = {
  zh: {
    badge: `模型 ${BACKTEST.model_version}`,
    title: "NBA 比赛预测 -",
    highlight: "胜率、分差、总分",
    subtitle: "",
    description: "基于 Elo 评分模型，上赛季",
    dataPoints: `${BACKTEST.games_evaluated.toLocaleString()} 场`,
    descriptionEnd: `滚动回测胜负命中率 ${BACKTEST.winner_accuracy}%。每条预测赛前写入、赛后结算，方法与结果全部公开。`,
    cta1: "查看今日比赛",
    cta2: "模型怎么算的",
    feature1Title: "可复现",
    feature1Desc: "模型、参数与回测脚本全部公开，数字可以自己跑一遍验证。",
    feature2Title: "不藏错的",
    feature2Desc: "命中率按全部已结算记录直接聚合，含模型的局限与失手场次。",
  },
  en: {
    badge: `Model ${BACKTEST.model_version}`,
    title: "NBA game predictions -",
    highlight: "win probability, spread, total",
    subtitle: "",
    description: "An Elo rating model that picked the winner in",
    dataPoints: `${BACKTEST.winner_accuracy}%`,
    descriptionEnd: `of ${BACKTEST.games_evaluated.toLocaleString()} backtested games last season. Every prediction is written before tip-off and settled after, with the method and the results published.`,
    cta1: "Today's games",
    cta2: "How it works",
    feature1Title: "Reproducible",
    feature1Desc: "The model, its parameters and the backtest script are published. Run it yourself and check.",
    feature2Title: "Misses included",
    feature2Desc: "Accuracy aggregates every settled prediction, alongside a plain list of what the model cannot do.",
  },
};

export function HeroSection() {
  const { locale } = useLocale();
  const t = content[locale];

  return (
    <section className="pt-8 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
      <div className="relative overflow-hidden rounded-xl bg-[#0f141a] p-8 md:p-16 border border-white/5">
        {/* Gradient Background */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-l from-primary/30 to-transparent"></div>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary tracking-widest uppercase">{t.badge}</span>
            </div>

            {/* The highlight sits on its own line so the heading cannot break
                mid-phrase, which it did at common desktop widths. */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
              {t.title}
              <span className="block text-primary mt-1">{t.highlight}</span>
              {t.subtitle}
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              {t.description} <span className="text-white font-bold">{t.dataPoints}</span> {t.descriptionEnd}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/scores" className="px-8 py-4 rounded-xl bg-gradient-to-br from-primary to-[#ff7948] text-white font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                {t.cta1}
              </Link>
              <Link href="/whitepaper" className="px-8 py-4 rounded-xl bg-[#151a21]/70 backdrop-blur border border-white/10 text-white font-bold hover:bg-[#1b2028] transition-colors">
                {t.cta2}
              </Link>
            </div>
          </div>

          {/* Right - Feature Cards */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-[#1b2028] border border-white/5">
              <svg className="w-8 h-8 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="font-bold text-xl mb-2">{t.feature1Title}</h3>
              <p className="text-sm text-slate-400">{t.feature1Desc}</p>
            </div>
            <div className="p-6 rounded-xl bg-[#1b2028] border border-white/5 mt-8">
              <svg className="w-8 h-8 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="font-bold text-xl mb-2">{t.feature2Title}</h3>
              <p className="text-sm text-slate-400">{t.feature2Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
