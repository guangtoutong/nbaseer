"use client";

import Link from "next/link";
import { useGamesContext } from "@/lib/GamesContext";
import { useLocale } from "@/lib/LocaleContext";
import type { Game } from "@/lib/types";

function LiveGameCard({ game, locale }: { game: Game; locale: "zh" | "en" }) {
  return (
    <Link href={`/game/${game.id}`} className="flex-1 bg-[#151a21]/70 backdrop-blur p-6 rounded-xl border-l-4 border-blue-500 hover:bg-[#1b2028]/50 transition-colors block">
      {/* Teams & Scores */}
      <div className="flex justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border-2 border-slate-700">
            {game.home_abbr}
          </div>
          <div className="text-right">
            <div className="text-2xl font-black">{game.home_score}</div>
            <div className="text-xs text-slate-400">{game.home_team_cn}</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
            {locale === 'zh' ? `第 ${game.period} 节` : `Q${game.period}`} {game.time}
          </span>
          <div className="w-px h-8 bg-white/10"></div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-2xl font-black">{game.away_score}</div>
            <div className="text-xs text-slate-400">{game.away_team_cn}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border-2 border-slate-700">
            {game.away_abbr}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center border-t border-white/10 pt-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">{locale === 'zh' ? '预测分差' : 'Spread'}</div>
          <div className="text-sm font-bold">
            {game.predicted_spread && game.predicted_spread > 0 ? '+' : ''}{game.predicted_spread?.toFixed(1) || '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">{locale === 'zh' ? '实时胜率' : 'Win %'}</div>
          <div className="text-sm font-bold text-blue-400">
            {((game.home_win_prob || 0.5) * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">{locale === 'zh' ? '预测总分' : 'Total'}</div>
          <div className="text-sm font-bold">
            {game.predicted_total?.toFixed(1) || '-'}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LiveGames() {
  const { live, isLoading, useMockData } = useGamesContext();
  const { locale } = useLocale();

  if (isLoading) {
    return (
      <section className="py-8 px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-slate-800 rounded-xl"></div>
            <div className="h-48 bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      </section>
    );
  }

  if (live.length === 0) {
    return null; // Don't show section if no live games
  }

  return (
    <section className="py-8 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
          {locale === 'zh' ? '进行中' : 'Live'} <span className="text-blue-400 text-sm font-medium tracking-normal">({live.length} {locale === 'zh' ? '场比赛' : 'games'})</span>
        </h2>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-[#151a21] hover:bg-[#1b2028] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-2 rounded-lg bg-[#151a21] hover:bg-[#1b2028] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {live.map((game) => (
          <LiveGameCard key={game.id} game={game} locale={locale} />
        ))}
      </div>
    </section>
  );
}
