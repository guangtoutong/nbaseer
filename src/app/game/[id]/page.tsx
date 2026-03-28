"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Game, Prediction, Odds } from "@/lib/types";

interface GameDetail extends Game {
  prediction?: Prediction;
  odds?: Odds;
}

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<GameDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGameDetail() {
      try {
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) {
          throw new Error('Game not found');
        }
        const data = await response.json() as { game: GameDetail };
        setGame(data.game);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game');
      } finally {
        setIsLoading(false);
      }
    }

    if (gameId) {
      fetchGameDetail();
    }
  }, [gameId]);

  if (isLoading) {
    return (
      <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-800 rounded w-48" />
          <div className="h-64 bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-slate-800 rounded-xl" />
            <div className="h-48 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">
            {error || "比赛未找到"}
          </h1>
          <Link href="/scores" className="text-primary hover:underline">
            返回比分页面
          </Link>
        </div>
      </div>
    );
  }

  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const homeWinning = (game.home_score || 0) > (game.away_score || 0);
  const homeWinProb = game.home_win_prob || game.prediction?.home_win_prob || 0.5;
  const awayWinProb = game.away_win_prob || game.prediction?.away_win_prob || 0.5;

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Back Link */}
      <Link href="/scores" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回比分
      </Link>

      {/* Game Header */}
      <div className="bg-[#0f141a] border border-white/5 rounded-xl p-8">
        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          {isLive ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-red-400 uppercase tracking-widest">
                第 {game.period} 节 {game.time}
              </span>
            </div>
          ) : isFinal ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-500/20 border border-slate-500/30">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">FINAL</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
              <span className="text-sm font-bold text-primary uppercase tracking-widest">
                {game.date} {game.time}
              </span>
            </div>
          )}
        </div>

        {/* Teams & Scores */}
        <div className="flex items-center justify-center gap-8 md:gap-16">
          {/* Home Team */}
          <div className={`text-center ${isFinal && !homeWinning ? "opacity-60" : ""}`}>
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-xl md:text-2xl mx-auto mb-4">
              {game.home_abbr}
            </div>
            <h2 className="text-xl md:text-2xl font-black">{game.home_team_cn}</h2>
            <p className="text-sm text-slate-400">主场</p>
            <div className="text-4xl md:text-6xl font-black mt-4">
              {game.status === 'scheduled' ? '-' : game.home_score}
            </div>
          </div>

          {/* VS */}
          <div className="text-slate-600 text-2xl font-bold">VS</div>

          {/* Away Team */}
          <div className={`text-center ${isFinal && homeWinning ? "opacity-60" : ""}`}>
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-xl md:text-2xl mx-auto mb-4">
              {game.away_abbr}
            </div>
            <h2 className="text-xl md:text-2xl font-black">{game.away_team_cn}</h2>
            <p className="text-sm text-slate-400">客场</p>
            <div className="text-4xl md:text-6xl font-black mt-4">
              {game.status === 'scheduled' ? '-' : game.away_score}
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Prediction */}
        <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-black flex items-center gap-3 mb-6">
            <span className="w-2 h-6 bg-primary rounded-full" />
            AI 预测
          </h3>

          {/* Win Probability */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold">{game.home_team_cn}</span>
                <span className="text-primary font-bold">{(homeWinProb * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-[#ff7948] rounded-full transition-all"
                  style={{ width: `${homeWinProb * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold">{game.away_team_cn}</span>
                <span className="text-blue-400 font-bold">{(awayWinProb * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                  style={{ width: `${awayWinProb * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Predicted Scores */}
          {game.prediction && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                <div className="text-sm text-slate-400 mb-1">预测分差</div>
                <div className="text-2xl font-black">
                  {game.prediction.predicted_spread > 0 ? '+' : ''}
                  {game.prediction.predicted_spread.toFixed(1)}
                </div>
              </div>
              <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                <div className="text-sm text-slate-400 mb-1">预测总分</div>
                <div className="text-2xl font-black">
                  {game.prediction.predicted_total.toFixed(1)}
                </div>
              </div>
            </div>
          )}

          {/* Confidence */}
          {game.confidence && (
            <div className="mt-6 p-4 bg-[#1b2028] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">模型信心度</span>
                <span className={`font-bold ${
                  game.confidence > 0.7 ? 'text-green-400' :
                  game.confidence > 0.5 ? 'text-yellow-400' : 'text-slate-400'
                }`}>
                  {(game.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Odds Section */}
        <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-black flex items-center gap-3 mb-6">
            <span className="w-2 h-6 bg-blue-500 rounded-full" />
            博彩赔率
          </h3>

          {game.odds ? (
            <div className="space-y-4">
              {/* Moneyline */}
              <div className="p-4 bg-[#1b2028] rounded-lg">
                <div className="text-sm text-slate-400 mb-3">独赢盘 (Moneyline)</div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="font-bold">{game.home_team_cn}</div>
                    <div className="text-xl font-black text-green-400">
                      {game.odds.home_ml > 0 ? '+' : ''}{game.odds.home_ml}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{game.away_team_cn}</div>
                    <div className="text-xl font-black text-green-400">
                      {game.odds.away_ml > 0 ? '+' : ''}{game.odds.away_ml}
                    </div>
                  </div>
                </div>
              </div>

              {/* Spread */}
              <div className="p-4 bg-[#1b2028] rounded-lg">
                <div className="text-sm text-slate-400 mb-3">让分盘 (Spread)</div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="font-bold">{game.home_team_cn}</div>
                    <div className="text-xl font-black">
                      {game.odds.spread_home > 0 ? '+' : ''}{game.odds.spread_home}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{game.away_team_cn}</div>
                    <div className="text-xl font-black">
                      {game.odds.spread_away > 0 ? '+' : ''}{game.odds.spread_away}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="p-4 bg-[#1b2028] rounded-lg">
                <div className="text-sm text-slate-400 mb-3">大小分 (Total)</div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="font-bold">大分</div>
                    <div className="text-xl font-black text-primary">{game.odds.total_over}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">小分</div>
                    <div className="text-xl font-black text-blue-400">{game.odds.total_under}</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center mt-4">
                数据来源: {game.odds.bookmaker} | 更新: {game.odds.updated_at}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>暂无赔率数据</p>
            </div>
          )}
        </div>
      </div>

      {/* Result Analysis (for completed games) */}
      {isFinal && (
        <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-black flex items-center gap-3 mb-6">
            <span className="w-2 h-6 bg-green-500 rounded-full" />
            预测结果分析
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1b2028] rounded-lg text-center">
              <div className="text-sm text-slate-400 mb-2">胜负预测</div>
              {game.winner_correct !== undefined ? (
                <div className={`text-xl font-black ${game.winner_correct === 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {game.winner_correct === 1 ? '命中' : '未命中'}
                </div>
              ) : (
                <div className="text-xl font-black text-slate-500">待验证</div>
              )}
            </div>
            <div className="p-4 bg-[#1b2028] rounded-lg text-center">
              <div className="text-sm text-slate-400 mb-2">实际分差</div>
              <div className="text-xl font-black">
                {(game.home_score - game.away_score) > 0 ? '+' : ''}
                {game.home_score - game.away_score}
              </div>
            </div>
            <div className="p-4 bg-[#1b2028] rounded-lg text-center">
              <div className="text-sm text-slate-400 mb-2">实际总分</div>
              <div className="text-xl font-black">
                {game.home_score + game.away_score}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-sm text-yellow-200">
          <strong>免责声明:</strong> AI预测仅供参考，不构成任何投注建议。博彩有风险，请理性对待。
        </p>
      </div>
    </div>
  );
}
