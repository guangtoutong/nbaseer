"use client";

import Link from "next/link";
import { useGamesContext } from "@/lib/GamesContext";
import { useLocale } from "@/lib/LocaleContext";
import type { Game } from "@/lib/types";

function CompletedGameCard({ game }: { game: Game }) {
  const homeWon = game.home_score > game.away_score;
  const predicted = game.winner_correct === 1;
  const actualSpread = game.away_score - game.home_score;

  return (
    <Link href={`/game/${game.id}`} className="bg-[#0f141a] p-5 rounded-xl border border-white/5 hover:border-primary/20 transition-all block">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FINAL</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
            predicted
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-red-900/10 text-red-500 border-red-500/20"
          }`}
        >
          {predicted ? "预测命中" : "未命中"}
        </span>
      </div>

      {/* Teams & Scores */}
      <div className="space-y-3 mb-4">
        <div className={`flex justify-between items-center ${!homeWon ? 'opacity-60' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-bold">
              {game.home_abbr}
            </div>
            <span className="text-sm font-medium">{game.home_team_cn}</span>
          </div>
          <span className="font-black text-lg">{game.home_score}</span>
        </div>
        <div className={`flex justify-between items-center ${homeWon ? 'opacity-60' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-bold">
              {game.away_abbr}
            </div>
            <span className="text-sm font-medium">{game.away_team_cn}</span>
          </div>
          <span className="font-black text-lg">{game.away_score}</span>
        </div>
      </div>

      {/* Odds Comparison */}
      <div className="text-[10px] text-slate-400 border-t border-white/5 pt-3">
        <span className="block">预测分差: {game.predicted_spread?.toFixed(1) || '-'}</span>
        <span className={`block mt-1 ${predicted ? "text-primary font-bold" : ""}`}>
          实际分差: {actualSpread > 0 ? '+' : ''}{actualSpread}
        </span>
      </div>
    </Link>
  );
}

export function CompletedGames() {
  const { completed, isLoading, useMockData } = useGamesContext();

  if (isLoading) {
    return (
      <section className="py-8 px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-slate-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (completed.length === 0) {
    return null; // Don't show section if no completed games
  }

  return (
    <section className="py-8 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Header */}
      <h2 className="text-2xl font-black flex items-center gap-3">
        <span className="w-2 h-8 bg-slate-500 rounded-full"></span>
        已结束比赛 <span className="text-slate-400 text-sm font-medium tracking-normal">昨日赛果分析</span>
        {useMockData && <span className="text-xs text-yellow-500 ml-2">(演示数据)</span>}
      </h2>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {completed.map((game) => (
          <CompletedGameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
