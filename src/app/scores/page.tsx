"use client";

import { useState } from "react";

// Team names mapping
const teamNames: Record<string, string> = {
  LAL: "湖人", GSW: "勇士", BOS: "凯尔特人", MIL: "雄鹿",
  PHX: "太阳", DEN: "掘金", MIA: "热火", PHI: "76人",
  DAL: "独行侠", CLE: "骑士", NYK: "尼克斯", BKN: "篮网",
  OKC: "雷霆", MEM: "灰熊", MIN: "森林狼", SAC: "国王",
  LAC: "快船", ATL: "老鹰", CHI: "公牛", TOR: "猛龙",
};

// Mock games data by date
const gamesByDate: Record<string, Array<{
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "live" | "final";
  time: string;
  quarter?: number;
  gameTime?: string;
}>> = {
  "2024-03-27": [
    { id: 1, homeTeam: "LAL", awayTeam: "GSW", homeScore: 104, awayScore: 101, status: "live", time: "08:42", quarter: 4 },
    { id: 2, homeTeam: "BOS", awayTeam: "MIL", homeScore: 76, awayScore: 82, status: "live", time: "03:15", quarter: 3 },
    { id: 3, homeTeam: "PHX", awayTeam: "DEN", homeScore: null, awayScore: null, status: "scheduled", time: "07:30 PM" },
    { id: 4, homeTeam: "MIA", awayTeam: "PHI", homeScore: null, awayScore: null, status: "scheduled", time: "09:00 PM" },
  ],
  "2024-03-26": [
    { id: 5, homeTeam: "DAL", awayTeam: "LAC", homeScore: 126, awayScore: 114, status: "final", time: "FINAL" },
    { id: 6, homeTeam: "CLE", awayTeam: "NYK", homeScore: 105, awayScore: 98, status: "final", time: "FINAL" },
    { id: 7, homeTeam: "OKC", awayTeam: "MEM", homeScore: 132, awayScore: 118, status: "final", time: "FINAL" },
    { id: 8, homeTeam: "MIN", awayTeam: "SAC", homeScore: 110, awayScore: 107, status: "final", time: "FINAL" },
  ],
  "2024-03-28": [
    { id: 9, homeTeam: "BKN", awayTeam: "ATL", homeScore: null, awayScore: null, status: "scheduled", time: "07:00 PM" },
    { id: 10, homeTeam: "CHI", awayTeam: "TOR", homeScore: null, awayScore: null, status: "scheduled", time: "08:00 PM" },
    { id: 11, homeTeam: "DEN", awayTeam: "LAL", homeScore: null, awayScore: null, status: "scheduled", time: "09:30 PM" },
  ],
};

const dates = ["2024-03-26", "2024-03-27", "2024-03-28"];
const dateLabels: Record<string, string> = {
  "2024-03-26": "昨天",
  "2024-03-27": "今天",
  "2024-03-28": "明天",
};

function GameCard({ game }: { game: typeof gamesByDate["2024-03-27"][0] }) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const homeWinning = (game.homeScore || 0) > (game.awayScore || 0);

  return (
    <div className={`bg-[#0f141a] p-5 rounded-xl border transition-all ${
      isLive ? "border-l-4 border-l-blue-500 border-white/5" : "border-white/5 hover:border-primary/20"
    }`}>
      {/* Status */}
      <div className="flex justify-between items-center mb-4">
        {isLive ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              第 {game.quarter} 节 {game.time}
            </span>
          </div>
        ) : isFinal ? (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FINAL</span>
        ) : (
          <span className="text-xs text-slate-400">{game.time}</span>
        )}
        {isLive && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">LIVE</span>
        )}
      </div>

      {/* Teams & Scores */}
      <div className="space-y-3">
        <div className={`flex justify-between items-center ${isFinal && !homeWinning ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs">
              {game.homeTeam}
            </div>
            <span className="font-medium">{teamNames[game.homeTeam]}</span>
          </div>
          <span className={`text-xl font-black ${game.homeScore !== null ? "" : "text-slate-600"}`}>
            {game.homeScore ?? "-"}
          </span>
        </div>
        <div className={`flex justify-between items-center ${isFinal && homeWinning ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs">
              {game.awayTeam}
            </div>
            <span className="font-medium">{teamNames[game.awayTeam]}</span>
          </div>
          <span className={`text-xl font-black ${game.awayScore !== null ? "" : "text-slate-600"}`}>
            {game.awayScore ?? "-"}
          </span>
        </div>
      </div>

      {/* View Details Button */}
      <button className="mt-4 w-full py-2 text-xs font-bold text-slate-400 hover:text-primary border border-white/5 rounded-lg hover:border-primary/30 transition-all">
        查看详情
      </button>
    </div>
  );
}

export default function ScoresPage() {
  const [selectedDate, setSelectedDate] = useState("2024-03-27");
  const games = gamesByDate[selectedDate] || [];

  const liveGames = games.filter(g => g.status === "live");
  const scheduledGames = games.filter(g => g.status === "scheduled");
  const finalGames = games.filter(g => g.status === "final");

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-black">NBA 比分中心</h1>
        <p className="text-slate-400">实时比分、赛程安排和比赛数据</p>
      </div>

      {/* Date Selector */}
      <div className="flex gap-2">
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              selectedDate === date
                ? "bg-primary text-white"
                : "bg-[#151a21] text-slate-400 hover:bg-[#1b2028]"
            }`}
          >
            {dateLabels[date]}
            <span className="block text-xs opacity-70 font-normal mt-0.5">{date}</span>
          </button>
        ))}
      </div>

      {/* Live Games */}
      {liveGames.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black flex items-center gap-3">
            <span className="w-2 h-6 bg-blue-500 rounded-full" />
            进行中
            <span className="text-blue-400 text-sm font-medium">({liveGames.length} 场)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Scheduled Games */}
      {scheduledGames.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black flex items-center gap-3">
            <span className="w-2 h-6 bg-primary rounded-full" />
            即将开始
            <span className="text-primary text-sm font-medium">({scheduledGames.length} 场)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Final Games */}
      {finalGames.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black flex items-center gap-3">
            <span className="w-2 h-6 bg-slate-500 rounded-full" />
            已结束
            <span className="text-slate-400 text-sm font-medium">({finalGames.length} 场)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finalGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {games.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg">该日期暂无比赛</p>
        </div>
      )}
    </div>
  );
}
