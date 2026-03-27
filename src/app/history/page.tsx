"use client";

import { useState } from "react";

// Team names mapping
const teamNames: Record<string, string> = {
  LAL: "湖人", GSW: "勇士", BOS: "凯尔特人", MIL: "雄鹿",
  PHX: "太阳", DEN: "掘金", MIA: "热火", PHI: "76人",
  DAL: "独行侠", CLE: "骑士", NYK: "尼克斯", BKN: "篮网",
  OKC: "雷霆", MEM: "灰熊", MIN: "森林狼", SAC: "国王",
  LAC: "快船", ATL: "老鹰",
};

// Mock prediction history
const predictionHistory = [
  { id: 1, date: "2024-03-26", homeTeam: "DAL", awayTeam: "LAC", predictedWinner: "DAL", actualWinner: "DAL", predictedSpread: "+10.5", actualSpread: "+12", predictedTotal: 235, actualTotal: 240, correct: true },
  { id: 2, date: "2024-03-26", homeTeam: "CLE", awayTeam: "NYK", predictedWinner: "NYK", actualWinner: "CLE", predictedSpread: "+4.2", actualSpread: "-7", predictedTotal: 205, actualTotal: 203, correct: false },
  { id: 3, date: "2024-03-26", homeTeam: "OKC", awayTeam: "MEM", predictedWinner: "OKC", actualWinner: "OKC", predictedSpread: "+15.0", actualSpread: "+14", predictedTotal: 245, actualTotal: 250, correct: true },
  { id: 4, date: "2024-03-26", homeTeam: "MIN", awayTeam: "SAC", predictedWinner: "MIN", actualWinner: "MIN", predictedSpread: "+2.8", actualSpread: "+3", predictedTotal: 218, actualTotal: 217, correct: true },
  { id: 5, date: "2024-03-25", homeTeam: "LAL", awayTeam: "PHX", predictedWinner: "LAL", actualWinner: "LAL", predictedSpread: "+5.5", actualSpread: "+8", predictedTotal: 230, actualTotal: 228, correct: true },
  { id: 6, date: "2024-03-25", homeTeam: "BOS", awayTeam: "MIA", predictedWinner: "BOS", actualWinner: "BOS", predictedSpread: "+8.0", actualSpread: "+6", predictedTotal: 215, actualTotal: 212, correct: true },
  { id: 7, date: "2024-03-25", homeTeam: "GSW", awayTeam: "DEN", predictedWinner: "DEN", actualWinner: "DEN", predictedSpread: "-4.5", actualSpread: "-7", predictedTotal: 225, actualTotal: 230, correct: true },
  { id: 8, date: "2024-03-24", homeTeam: "PHI", awayTeam: "ATL", predictedWinner: "PHI", actualWinner: "ATL", predictedSpread: "+6.0", actualSpread: "-3", predictedTotal: 220, actualTotal: 215, correct: false },
];

// Stats calculation
const totalPredictions = predictionHistory.length;
const correctPredictions = predictionHistory.filter(p => p.correct).length;
const accuracy = ((correctPredictions / totalPredictions) * 100).toFixed(1);

// Monthly stats
const monthlyStats = [
  { month: "3月", predictions: 248, correct: 168, accuracy: 67.7 },
  { month: "2月", predictions: 220, correct: 145, accuracy: 65.9 },
  { month: "1月", predictions: 235, correct: 162, accuracy: 68.9 },
  { month: "12月", predictions: 198, correct: 130, accuracy: 65.7 },
];

type FilterType = "all" | "correct" | "incorrect";

export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredHistory = predictionHistory.filter(p => {
    if (filter === "correct") return p.correct;
    if (filter === "incorrect") return !p.correct;
    return true;
  });

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-black">预测历史</h1>
        <p className="text-slate-400">查看AI预测的历史记录和准确率统计</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/90 to-[#ff7948] p-6 rounded-xl">
          <div className="text-sm opacity-80 mb-1">总体准确率</div>
          <div className="text-4xl font-black">{accuracy}%</div>
          <div className="text-sm opacity-80 mt-2">近30天表现</div>
        </div>
        <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl">
          <div className="text-sm text-slate-400 mb-1">累计预测</div>
          <div className="text-4xl font-black">12,847</div>
          <div className="text-sm text-slate-400 mt-2">场比赛</div>
        </div>
        <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl">
          <div className="text-sm text-slate-400 mb-1">命中次数</div>
          <div className="text-4xl font-black text-green-500">8,710</div>
          <div className="text-sm text-slate-400 mt-2">场预测正确</div>
        </div>
        <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl">
          <div className="text-sm text-slate-400 mb-1">平均ROI</div>
          <div className="text-4xl font-black text-green-500">+8.2%</div>
          <div className="text-sm text-slate-400 mt-2">近30天</div>
        </div>
      </div>

      {/* Monthly Performance */}
      <section className="space-y-4">
        <h2 className="text-xl font-black flex items-center gap-3">
          <span className="w-2 h-6 bg-blue-500 rounded-full" />
          月度表现
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {monthlyStats.map((stat) => (
            <div key={stat.month} className="bg-[#0f141a] border border-white/5 p-5 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">{stat.month}</span>
                <span className={`text-2xl font-black ${stat.accuracy >= 67 ? "text-green-500" : "text-slate-400"}`}>
                  {stat.accuracy}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${stat.accuracy >= 67 ? "bg-green-500" : "bg-slate-500"}`}
                  style={{ width: `${stat.accuracy}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>{stat.correct} 命中</span>
                <span>{stat.predictions} 预测</span>
              </div>
            </div>
          ))}
        </div>
      </section>

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
          预测记录
        </h2>

        <div className="bg-[#0f141a] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-slate-400 uppercase">
                <th className="p-4">日期</th>
                <th className="p-4">对阵</th>
                <th className="p-4">预测胜方</th>
                <th className="p-4">实际胜方</th>
                <th className="p-4">预测分差</th>
                <th className="p-4">实际分差</th>
                <th className="p-4">结果</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((prediction) => (
                <tr key={prediction.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm text-slate-400">{prediction.date}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{teamNames[prediction.homeTeam]}</span>
                      <span className="text-slate-500">vs</span>
                      <span className="font-bold">{teamNames[prediction.awayTeam]}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold">{teamNames[prediction.predictedWinner]}</td>
                  <td className="p-4 font-bold">{teamNames[prediction.actualWinner]}</td>
                  <td className="p-4 font-bold text-primary">{prediction.predictedSpread}</td>
                  <td className="p-4 font-bold">{prediction.actualSpread}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      prediction.correct
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}>
                      {prediction.correct ? "命中" : "未命中"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
