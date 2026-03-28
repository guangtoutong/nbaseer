"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Game, Prediction, Odds } from "@/lib/types";
import { useLocale } from "@/lib/LocaleContext";
import { getTimeDisplay } from "@/lib/timeUtils";

const content = {
  zh: {
    backToScores: "返回比分",
    gameNotFound: "比赛未找到",
    quarter: "第 {n} 节",
    home: "主场",
    away: "客场",
    vs: "VS",
    aiPrediction: "AI 预测",
    predictedSpread: "预测分差",
    predictedTotal: "预测总分",
    modelConfidence: "模型信心度",
    odds: "博彩赔率",
    moneyline: "独赢盘 (Moneyline)",
    spread: "让分盘 (Spread)",
    total: "大小分 (Total)",
    over: "大分",
    under: "小分",
    dataSource: "数据来源",
    updated: "更新",
    noOddsData: "暂无赔率数据",
    resultAnalysis: "预测结果分析",
    winPrediction: "胜负预测",
    hit: "命中",
    miss: "未命中",
    pending: "待验证",
    actualSpread: "实际分差",
    actualTotal: "实际总分",
    disclaimer: "免责声明:",
    disclaimerText: "AI预测仅供参考，不构成任何投注建议。博彩有风险，请理性对待。",
  },
  en: {
    backToScores: "Back to Scores",
    gameNotFound: "Game not found",
    quarter: "Q{n}",
    home: "Home",
    away: "Away",
    vs: "VS",
    aiPrediction: "AI Prediction",
    predictedSpread: "Pred. Spread",
    predictedTotal: "Pred. Total",
    modelConfidence: "Model Confidence",
    odds: "Betting Odds",
    moneyline: "Moneyline",
    spread: "Spread",
    total: "Total (O/U)",
    over: "Over",
    under: "Under",
    dataSource: "Source",
    updated: "Updated",
    noOddsData: "No odds data available",
    resultAnalysis: "Prediction Results",
    winPrediction: "Win Prediction",
    hit: "HIT",
    miss: "MISS",
    pending: "Pending",
    actualSpread: "Actual Spread",
    actualTotal: "Actual Total",
    disclaimer: "Disclaimer:",
    disclaimerText: "AI predictions are for reference only and do not constitute betting advice. Gamble responsibly.",
  },
};

interface GameDetail extends Game {
  prediction?: Prediction;
  odds?: Odds;
}

export default function GameDetailPage() {
  const { locale } = useLocale();
  const t = content[locale];
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
            {error || t.gameNotFound}
          </h1>
          <Link href="/scores" className="text-primary hover:underline">
            {t.backToScores}
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

  // Get team names based on locale
  const homeTeamName = locale === 'zh' ? (game.home_team_cn || game.home_team) : game.home_team;
  const awayTeamName = locale === 'zh' ? (game.away_team_cn || game.away_team) : game.away_team;
  const gameTimeDisplay = getTimeDisplay(game.date, game.time, locale);

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Back Link */}
      <Link href="/scores" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t.backToScores}
      </Link>

      {/* Game Header */}
      <div className="bg-[#0f141a] border border-white/5 rounded-xl p-8">
        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          {isLive ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-red-400 uppercase tracking-widest">
                {t.quarter.replace('{n}', String(game.period))} {game.time}
              </span>
            </div>
          ) : isFinal ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-500/20 border border-slate-500/30">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">FINAL</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
              <span className="text-sm font-bold text-primary uppercase tracking-widest">
                {gameTimeDisplay}
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
            <h2 className="text-xl md:text-2xl font-black">{homeTeamName}</h2>
            <p className="text-sm text-slate-400">{t.home}</p>
            <div className="text-4xl md:text-6xl font-black mt-4">
              {game.status === 'scheduled' ? '-' : game.home_score}
            </div>
          </div>

          {/* VS */}
          <div className="text-slate-600 text-2xl font-bold">{t.vs}</div>

          {/* Away Team */}
          <div className={`text-center ${isFinal && homeWinning ? "opacity-60" : ""}`}>
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-xl md:text-2xl mx-auto mb-4">
              {game.away_abbr}
            </div>
            <h2 className="text-xl md:text-2xl font-black">{awayTeamName}</h2>
            <p className="text-sm text-slate-400">{t.away}</p>
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
            {t.aiPrediction}
          </h3>

          {/* Win Probability */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold">{homeTeamName}</span>
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
                <span className="font-bold">{awayTeamName}</span>
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
                <div className="text-sm text-slate-400 mb-1">{t.predictedSpread}</div>
                <div className="text-2xl font-black">
                  {game.prediction.predicted_spread > 0 ? '+' : ''}
                  {game.prediction.predicted_spread.toFixed(1)}
                </div>
              </div>
              <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                <div className="text-sm text-slate-400 mb-1">{t.predictedTotal}</div>
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
                <span className="text-sm text-slate-400">{t.modelConfidence}</span>
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
            {t.odds}
          </h3>

          {game.odds ? (
            <div className="space-y-4">
              {/* Moneyline */}
              <div className="p-4 bg-[#1b2028] rounded-lg">
                <div className="text-sm text-slate-400 mb-3">{t.moneyline}</div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="font-bold">{homeTeamName}</div>
                    <div className="text-xl font-black text-green-400">
                      {game.odds.home_ml > 0 ? '+' : ''}{game.odds.home_ml}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{awayTeamName}</div>
                    <div className="text-xl font-black text-green-400">
                      {game.odds.away_ml > 0 ? '+' : ''}{game.odds.away_ml}
                    </div>
                  </div>
                </div>
              </div>

              {/* Spread */}
              <div className="p-4 bg-[#1b2028] rounded-lg">
                <div className="text-sm text-slate-400 mb-3">{t.spread}</div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="font-bold">{homeTeamName}</div>
                    <div className="text-xl font-black">
                      {game.odds.spread_home > 0 ? '+' : ''}{game.odds.spread_home}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{awayTeamName}</div>
                    <div className="text-xl font-black">
                      {game.odds.spread_away > 0 ? '+' : ''}{game.odds.spread_away}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="p-4 bg-[#1b2028] rounded-lg">
                <div className="text-sm text-slate-400 mb-3">{t.total}</div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="font-bold">{t.over}</div>
                    <div className="text-xl font-black text-primary">{game.odds.total_over}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{t.under}</div>
                    <div className="text-xl font-black text-blue-400">{game.odds.total_under}</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center mt-4">
                {t.dataSource}: {game.odds.bookmaker} | {t.updated}: {game.odds.updated_at}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>{t.noOddsData}</p>
            </div>
          )}
        </div>
      </div>

      {/* Result Analysis (for completed games) */}
      {isFinal && (
        <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-black flex items-center gap-3 mb-6">
            <span className="w-2 h-6 bg-green-500 rounded-full" />
            {t.resultAnalysis}
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1b2028] rounded-lg text-center">
              <div className="text-sm text-slate-400 mb-2">{t.winPrediction}</div>
              {game.winner_correct !== undefined ? (
                <div className={`text-xl font-black ${game.winner_correct === 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {game.winner_correct === 1 ? t.hit : t.miss}
                </div>
              ) : (
                <div className="text-xl font-black text-slate-500">{t.pending}</div>
              )}
            </div>
            <div className="p-4 bg-[#1b2028] rounded-lg text-center">
              <div className="text-sm text-slate-400 mb-2">{t.actualSpread}</div>
              <div className="text-xl font-black">
                {(game.home_score - game.away_score) > 0 ? '+' : ''}
                {game.home_score - game.away_score}
              </div>
            </div>
            <div className="p-4 bg-[#1b2028] rounded-lg text-center">
              <div className="text-sm text-slate-400 mb-2">{t.actualTotal}</div>
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
          <strong>{t.disclaimer}</strong> {t.disclaimerText}
        </p>
      </div>
    </div>
  );
}
