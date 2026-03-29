"use client";

import Link from "next/link";
import { useGamesContext } from "@/lib/GamesContext";
import { useLocale } from "@/lib/LocaleContext";
import { getTimeDisplay } from "@/lib/timeUtils";
import type { Game } from "@/lib/types";

const content = {
  zh: {
    upcoming: "即将开始",
    aiCenter: "AI 预测中心",
    demoData: "(演示数据)",
    noGames: "暂无即将开始的比赛",
    hotPick: "热门预测",
    confidence: "置信度",
    winProb: "胜率",
    vs: "@",
    predictedScore: "预测比分",
    predictedSpread: "预测分差",
    predictedTotal: "预测总分",
    referenceOdds: "参考赔率",
    marketData: "市场实时数据",
    moneyline: "独赢 (ML)",
    spread: "让分 (Spread)",
    total: "总分 (Total)",
    viewDetails: "查看详情",
    starting: "即将开始",
    aiAnalysis: "AI 深度分析",
    homeAdvantage: "主场作战，主场优势明显，近期状态稳定。",
    awayChallenge: "客场挑战，需关注关键球员状态及防守表现。",
    aiWinProb: "AI 预测胜率",
    home: "主",
    away: "客",
  },
  en: {
    upcoming: "Upcoming",
    aiCenter: "AI Prediction Center",
    demoData: "(Demo Data)",
    noGames: "No upcoming games",
    hotPick: "HOT PICK",
    confidence: "Confidence",
    winProb: "Win %",
    vs: "@",
    predictedScore: "Pred. Score",
    predictedSpread: "Pred. Spread",
    predictedTotal: "Pred. Total",
    referenceOdds: "Reference Odds",
    marketData: "Live Market Data",
    moneyline: "Moneyline (ML)",
    spread: "Spread",
    total: "Total (O/U)",
    viewDetails: "View Details",
    starting: "Starting Soon",
    aiAnalysis: "AI Deep Analysis",
    homeAdvantage: "Playing at home with clear home-court advantage and stable recent form.",
    awayChallenge: "Away challenge - watch key player status and defensive performance.",
    aiWinProb: "AI Win Probability",
    home: "Home",
    away: "Away",
  },
};

function FeaturedGameCard({ game, locale }: { game: Game; locale: "zh" | "en" }) {
  const t = content[locale];
  const confidence = (game.confidence || 0) * 100;
  const homeWinProb = (game.home_win_prob || 0.5) * 100;
  const awayWinProb = (game.away_win_prob || 0.5) * 100;
  const total = game.predicted_total || 220;
  const spread = game.predicted_spread || 0;
  const predictedHomeScore = game.predicted_home_score || Math.round((total - spread) / 2);
  const predictedAwayScore = game.predicted_away_score || Math.round((total + spread) / 2);
  const timeDisplay = getTimeDisplay(game.date, game.time, locale);

  // Get team names based on locale
  const homeTeamName = locale === 'zh' ? (game.home_team_cn || game.home_team) : (game.home_team || game.home_team_cn);
  const awayTeamName = locale === 'zh' ? (game.away_team_cn || game.away_team) : (game.away_team || game.away_team_cn);

  return (
    <div className="md:col-span-2 bg-[#151a21]/70 backdrop-blur rounded-xl overflow-hidden border border-white/5 flex flex-col md:flex-row">
      <div className="flex-1 p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded uppercase tracking-tighter">{t.hotPick}</span>
            <p className="text-sm text-slate-400 mt-2">{timeDisplay}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-400">{t.confidence}</div>
            <div className="text-xl font-black text-primary">{confidence.toFixed(0)}%</div>
          </div>
        </div>

        {/* Teams - Away @ Home format */}
        <div className="flex justify-around items-center py-2">
          <div className="text-center group">
            <div className="relative">
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold bg-slate-700 text-slate-300 rounded">{t.away}</span>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1b2028] border-2 border-slate-600 flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
                <span className="text-xl md:text-2xl font-black">{game.away_abbr}</span>
              </div>
            </div>
            <div className="text-base md:text-lg font-bold">{awayTeamName}</div>
            <div className="text-2xl md:text-3xl font-black text-slate-300 my-1">{predictedAwayScore}</div>
            <div className="text-xs md:text-sm text-slate-400">{awayWinProb.toFixed(1)}% {t.winProb}</div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-600">{t.vs}</div>
          <div className="text-center group">
            <div className="relative">
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold bg-primary text-white rounded">{t.home}</span>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1b2028] border-2 border-primary flex items-center justify-center mb-3 shadow-2xl shadow-primary/20 transition-transform group-hover:scale-110">
                <span className="text-xl md:text-2xl font-black">{game.home_abbr}</span>
              </div>
            </div>
            <div className="text-base md:text-lg font-bold">{homeTeamName}</div>
            <div className="text-2xl md:text-3xl font-black text-primary my-1">{predictedHomeScore}</div>
            <div className="text-xs md:text-sm text-primary font-bold">{homeWinProb.toFixed(1)}% {t.winProb}</div>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#151a21]/30 p-3 rounded-lg text-center">
            <div className="text-[10px] text-slate-400 mb-1">{t.predictedSpread}</div>
            <div className="text-sm md:text-base font-black text-primary">
              {game.predicted_spread && game.predicted_spread > 0 ? '+' : ''}{game.predicted_spread?.toFixed(1) || '-'}
            </div>
          </div>
          <div className="bg-[#151a21]/30 p-3 rounded-lg text-center">
            <div className="text-[10px] text-slate-400 mb-1">{t.predictedTotal}</div>
            <div className="text-sm md:text-base font-black">{game.predicted_total?.toFixed(1) || '-'}</div>
          </div>
        </div>

        {/* Odds Section */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white/80 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.referenceOdds}
            </span>
            <span className="text-[10px] text-slate-400 italic">{t.marketData}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1b2028]/40 p-2 rounded border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase mb-1">{t.moneyline}</div>
              <div className="text-xs font-bold">1.{Math.round(100/homeWinProb * 100 - 100)} / 1.{Math.round(100/awayWinProb * 100 - 100)}</div>
            </div>
            <div className="bg-[#1b2028]/40 p-2 rounded border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase mb-1">{t.spread}</div>
              <div className="text-xs font-bold">{game.predicted_spread?.toFixed(1) || '-'} @1.90</div>
            </div>
            <div className="bg-[#1b2028]/40 p-2 rounded border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase mb-1">{t.total}</div>
              <div className="text-xs font-bold">{game.predicted_total?.toFixed(1) || '-'} @1.90</div>
            </div>
          </div>
        </div>

        {/* View Details Link */}
        <Link href={`/game/${game.id}`} className="mt-4 w-full py-2 text-xs font-bold text-slate-400 hover:text-primary border border-white/5 rounded-lg hover:border-primary/30 transition-all block text-center">
          {t.viewDetails}
        </Link>
      </div>

      {/* AI Analysis Sidebar */}
      <div className="w-full md:w-72 bg-gradient-to-br from-primary/90 to-[#ff7948] p-8 flex flex-col justify-center text-white">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
          </svg>
          <h3 className="font-black text-lg uppercase tracking-tight">{t.aiAnalysis}</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-medium leading-relaxed">
            {homeTeamName} {t.homeAdvantage}
          </p>
          <p className="text-sm font-medium leading-relaxed">
            {awayTeamName} {t.awayChallenge}
          </p>
          <div className="pt-4 mt-4 border-t border-white/20">
            <div className="flex justify-between text-xs mb-1">
              <span>{t.aiWinProb}</span>
              <span>{homeTeamName} {homeWinProb.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${homeWinProb}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallGameCard({ game, locale }: { game: Game; locale: "zh" | "en" }) {
  const t = content[locale];
  const homeWinProb = (game.home_win_prob || 0.5) * 100;
  const awayWinProb = (game.away_win_prob || 0.5) * 100;
  const total = game.predicted_total || 220;
  const spread = game.predicted_spread || 0;
  const predictedHomeScore = game.predicted_home_score || Math.round((total - spread) / 2);
  const predictedAwayScore = game.predicted_away_score || Math.round((total + spread) / 2);
  const timeDisplay = getTimeDisplay(game.date, game.time, locale);

  // Get team names based on locale
  const homeTeamName = locale === 'zh' ? (game.home_team_cn || game.home_team) : (game.home_team || game.home_team_cn);
  const awayTeamName = locale === 'zh' ? (game.away_team_cn || game.away_team) : (game.away_team || game.away_team_cn);

  return (
    <div className="bg-[#151a21]/70 backdrop-blur p-6 rounded-xl border border-white/5 flex flex-col hover:border-primary/30 transition-all">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-bold text-slate-400">{timeDisplay}</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-[10px] text-slate-400">{t.starting}</span>
        </span>
      </div>

      {/* Away @ Home format */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[8px] font-bold bg-slate-700 text-slate-300 rounded">{t.away}</span>
              <div className="w-10 h-10 rounded-full bg-[#1b2028] border border-white/10 flex items-center justify-center font-bold text-xs">{game.away_abbr}</div>
            </div>
            <span className="font-bold text-sm">{awayTeamName}</span>
          </div>
          <div className="text-right">
            <span className="font-black text-lg text-slate-300">{predictedAwayScore}</span>
            <span className="text-slate-500 mx-2">|</span>
            <span className="font-black text-slate-400">{awayWinProb.toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[8px] font-bold bg-primary text-white rounded">{t.home}</span>
              <div className="w-10 h-10 rounded-full bg-[#1b2028] border border-primary/50 flex items-center justify-center font-bold text-xs">{game.home_abbr}</div>
            </div>
            <span className="font-bold text-sm">{homeTeamName}</span>
          </div>
          <div className="text-right">
            <span className="font-black text-lg text-primary">{predictedHomeScore}</span>
            <span className="text-slate-500 mx-2">|</span>
            <span className="font-black text-primary">{homeWinProb.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 py-4 border-t border-white/10">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>{t.predictedSpread}</span>
          <span className="font-bold text-primary">
            {game.predicted_spread && game.predicted_spread > 0 ? '+' : ''}{game.predicted_spread?.toFixed(1) || '-'}
          </span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>{t.predictedTotal}</span>
          <span className="font-bold text-white">{game.predicted_total?.toFixed(1) || '-'}</span>
        </div>
      </div>

      {/* Small Card Odds */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="text-[10px] font-bold text-slate-400 mb-2 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t.referenceOdds}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <div className="text-[10px] bg-[#151a21]/50 px-2 py-1.5 rounded flex justify-between">
            <span className="opacity-50">{t.moneyline}</span>
            <span className="font-bold">1.{Math.round(100/homeWinProb * 100 - 100)} / 1.{Math.round(100/awayWinProb * 100 - 100)}</span>
          </div>
          <div className="text-[10px] bg-[#151a21]/50 px-2 py-1.5 rounded flex justify-between">
            <span className="opacity-50">{t.spread}</span>
            <span className="font-bold">{game.predicted_spread?.toFixed(1) || '-'} @1.91</span>
          </div>
          <div className="text-[10px] bg-[#151a21]/50 px-2 py-1.5 rounded flex justify-between">
            <span className="opacity-50">{t.total}</span>
            <span className="font-bold">{game.predicted_total?.toFixed(1) || '-'} @1.90</span>
          </div>
        </div>
      </div>

      {/* View Details Link */}
      <Link href={`/game/${game.id}`} className="mt-4 w-full py-2 text-xs font-bold text-slate-400 hover:text-primary border border-white/5 rounded-lg hover:border-primary/30 transition-all block text-center">
        {t.viewDetails}
      </Link>
    </div>
  );
}

export function UpcomingGames() {
  const { scheduled, isLoading, useMockData } = useGamesContext();
  const { locale } = useLocale();
  const t = content[locale];

  if (isLoading) {
    return (
      <section className="py-8 px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-96 bg-slate-800 rounded-xl"></div>
            <div className="h-96 bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      </section>
    );
  }

  if (scheduled.length === 0) {
    return (
      <section className="py-8 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <span className="w-2 h-8 bg-primary rounded-full"></span>
          {t.upcoming} <span className="text-primary text-sm font-medium tracking-normal">{t.aiCenter}</span>
        </h2>
        <div className="bg-[#151a21]/70 backdrop-blur p-8 rounded-xl border border-white/5 text-center">
          <p className="text-slate-400">{t.noGames}</p>
        </div>
      </section>
    );
  }

  const featuredGame = scheduled[0];
  const otherGames = scheduled.slice(1);

  return (
    <section className="py-8 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Header */}
      <h2 className="text-2xl font-black flex items-center gap-3">
        <span className="w-2 h-8 bg-primary rounded-full"></span>
        {t.upcoming} <span className="text-primary text-sm font-medium tracking-normal">{t.aiCenter}</span>
        {useMockData && <span className="text-xs text-yellow-500 ml-2">{t.demoData}</span>}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Featured Prediction Card */}
        <FeaturedGameCard game={featuredGame} locale={locale} />

        {/* Small Prediction Cards */}
        {otherGames.slice(0, 1).map((game) => (
          <SmallGameCard key={game.id} game={game} locale={locale} />
        ))}
      </div>

      {/* Additional Games */}
      {otherGames.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherGames.slice(1, 4).map((game) => (
            <SmallGameCard key={game.id} game={game} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
