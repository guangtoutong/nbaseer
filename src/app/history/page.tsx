"use client";

import { useState, useEffect } from "react";
import type { StatsResponse } from "@/lib/types";

// Mock data for fallback
const mockStats: StatsResponse = {
  overall: {
    total_predictions: 12847,
    correct_winners: 8710,
    correct_spreads: 6500,
    correct_totals: 6200,
    winner_accuracy: 67.8,
    spread_accuracy: 50.6,
    total_accuracy: 48.3,
  },
  monthly: [
    { month: "2024-03", total: 248, correct: 168, accuracy: 67.7 },
    { month: "2024-02", total: 220, correct: 145, accuracy: 65.9 },
    { month: "2024-01", total: 235, correct: 162, accuracy: 68.9 },
    { month: "2023-12", total: 198, correct: 130, accuracy: 65.7 },
  ],
  recent: [
    { date: "2024-03-26", home_team: "独行侠", away_team: "快船", home_win_prob: 0.55, home_score: 126, away_score: 114, winner_correct: 1 },
    { date: "2024-03-26", home_team: "骑士", away_team: "尼克斯", home_win_prob: 0.48, home_score: 105, away_score: 98, winner_correct: 0 },
    { date: "2024-03-26", home_team: "雷霆", away_team: "灰熊", home_win_prob: 0.72, home_score: 132, away_score: 118, winner_correct: 1 },
    { date: "2024-03-26", home_team: "森林狼", away_team: "国王", home_win_prob: 0.58, home_score: 110, away_score: 107, winner_correct: 1 },
    { date: "2024-03-25", home_team: "湖人", away_team: "太阳", home_win_prob: 0.55, home_score: 118, away_score: 110, winner_correct: 1 },
    { date: "2024-03-25", home_team: "凯尔特人", away_team: "热火", home_win_prob: 0.68, home_score: 112, away_score: 106, winner_correct: 1 },
    { date: "2024-03-25", home_team: "勇士", away_team: "掘金", home_win_prob: 0.45, home_score: 108, away_score: 115, winner_correct: 1 },
    { date: "2024-03-24", home_team: "76人", away_team: "老鹰", home_win_prob: 0.60, home_score: 105, away_score: 108, winner_correct: 0 },
  ],
  games: [
    { status: "scheduled", count: 15 },
    { status: "live", count: 2 },
    { status: "final", count: 1250 },
  ],
};

type FilterType = "all" | "correct" | "incorrect";

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const months = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  return `${months[parseInt(month)]} ${year}`;
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [stats, setStats] = useState<StatsResponse>(mockStats);
  const [isLoading, setIsLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('API error');
        const data: StatsResponse = await response.json();

        if (data.overall && data.overall.total_predictions > 0) {
          setStats(data);
          setUseMockData(false);
        } else {
          setStats(mockStats);
          setUseMockData(true);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats(mockStats);
        setUseMockData(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const filteredHistory = stats.recent.filter(p => {
    if (filter === "correct") return p.winner_correct === 1;
    if (filter === "incorrect") return p.winner_correct === 0;
    return true;
  });

  const accuracy = stats.overall.winner_accuracy || 0;

  if (isLoading) {
    return (
      <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-slate-800 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-black">
          预测历史
          {useMockData && <span className="text-sm text-yellow-500 ml-3">(演示数据)</span>}
        </h1>
        <p className="text-slate-400">查看AI预测的历史记录和准确率统计</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/90 to-[#ff7948] p-6 rounded-xl">
          <div className="text-sm opacity-80 mb-1">总体准确率</div>
          <div className="text-4xl font-black">{accuracy.toFixed(1)}%</div>
          <div className="text-sm opacity-80 mt-2">胜负预测</div>
        </div>
        <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl">
          <div className="text-sm text-slate-400 mb-1">累计预测</div>
          <div className="text-4xl font-black">{stats.overall.total_predictions.toLocaleString()}</div>
          <div className="text-sm text-slate-400 mt-2">场比赛</div>
        </div>
        <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl">
          <div className="text-sm text-slate-400 mb-1">命中次数</div>
          <div className="text-4xl font-black text-green-500">{stats.overall.correct_winners.toLocaleString()}</div>
          <div className="text-sm text-slate-400 mt-2">场预测正确</div>
        </div>
        <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl">
          <div className="text-sm text-slate-400 mb-1">分差准确率</div>
          <div className="text-4xl font-black text-blue-400">{(stats.overall.spread_accuracy || 0).toFixed(1)}%</div>
          <div className="text-sm text-slate-400 mt-2">让分盘</div>
        </div>
      </div>

      {/* Monthly Performance */}
      {stats.monthly.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black flex items-center gap-3">
            <span className="w-2 h-6 bg-blue-500 rounded-full" />
            月度表现
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.monthly.slice(0, 4).map((stat) => (
              <div key={stat.month} className="bg-[#0f141a] border border-white/5 p-5 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">{formatMonth(stat.month)}</span>
                  <span className={`text-2xl font-black ${stat.accuracy >= 60 ? "text-green-500" : "text-slate-400"}`}>
                    {stat.accuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stat.accuracy >= 60 ? "bg-green-500" : "bg-slate-500"}`}
                    style={{ width: `${stat.accuracy}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>{stat.correct} 命中</span>
                  <span>{stat.total} 预测</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            filter === "all" ? "bg-primary text-white" : "bg-[#151a21] text-slate-400 hover:bg-[#1b2028]"
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter("correct")}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            filter === "correct" ? "bg-green-600 text-white" : "bg-[#151a21] text-slate-400 hover:bg-[#1b2028]"
          }`}
        >
          命中
        </button>
        <button
          onClick={() => setFilter("incorrect")}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            filter === "incorrect" ? "bg-red-600 text-white" : "bg-[#151a21] text-slate-400 hover:bg-[#1b2028]"
          }`}
        >
          未命中
        </button>
      </div>

      {/* Prediction History Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-black flex items-center gap-3">
          <span className="w-2 h-6 bg-primary rounded-full" />
          最近预测记录
        </h2>

        <div className="bg-[#0f141a] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-slate-400 uppercase">
                <th className="p-4">日期</th>
                <th className="p-4">对阵</th>
                <th className="p-4">预测胜率</th>
                <th className="p-4">比分</th>
                <th className="p-4">结果</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((prediction, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm text-slate-400">{prediction.date}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{prediction.home_team}</span>
                      <span className="text-slate-500">vs</span>
                      <span className="font-bold">{prediction.away_team}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-primary">
                    {((prediction.home_win_prob || 0.5) * 100).toFixed(0)}%
                  </td>
                  <td className="p-4 font-bold">
                    {prediction.home_score} - {prediction.away_score}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      prediction.winner_correct === 1
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}>
                      {prediction.winner_correct === 1 ? "命中" : "未命中"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredHistory.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              暂无预测记录
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
