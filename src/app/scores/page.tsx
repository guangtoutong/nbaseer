"use client";

import { useState, useEffect } from "react";
import type { Game } from "@/lib/types";

// Mock data for fallback
const mockGames: Game[] = [
  { id: 1, date: "2024-03-27", time: "08:42", status: "live", period: 4, home_team_id: 14, away_team_id: 10, home_score: 104, away_score: 101, season: 2024, postseason: 0, home_abbr: "LAL", away_abbr: "GSW", home_team_cn: "湖人", away_team_cn: "勇士" },
  { id: 2, date: "2024-03-27", time: "03:15", status: "live", period: 3, home_team_id: 2, away_team_id: 17, home_score: 76, away_score: 82, season: 2024, postseason: 0, home_abbr: "BOS", away_abbr: "MIL", home_team_cn: "凯尔特人", away_team_cn: "雄鹿" },
  { id: 3, date: "2024-03-27", time: "07:30 PM", status: "scheduled", period: 0, home_team_id: 24, away_team_id: 8, home_score: 0, away_score: 0, season: 2024, postseason: 0, home_abbr: "PHX", away_abbr: "DEN", home_team_cn: "太阳", away_team_cn: "掘金" },
  { id: 4, date: "2024-03-27", time: "09:00 PM", status: "scheduled", period: 0, home_team_id: 16, away_team_id: 23, home_score: 0, away_score: 0, season: 2024, postseason: 0, home_abbr: "MIA", away_abbr: "PHI", home_team_cn: "热火", away_team_cn: "76人" },
];

function GameCard({ game }: { game: Game }) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const homeWinning = (game.home_score || 0) > (game.away_score || 0);

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
              第 {game.period} 节 {game.time}
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
              {game.home_abbr}
            </div>
            <span className="font-medium">{game.home_team_cn}</span>
          </div>
          <span className={`text-xl font-black ${game.home_score ? "" : "text-slate-600"}`}>
            {game.home_score || "-"}
          </span>
        </div>
        <div className={`flex justify-between items-center ${isFinal && homeWinning ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs">
              {game.away_abbr}
            </div>
            <span className="font-medium">{game.away_team_cn}</span>
          </div>
          <span className={`text-xl font-black ${game.away_score ? "" : "text-slate-600"}`}>
            {game.away_score || "-"}
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
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const dates = [
    formatDate(new Date(today.getTime() - 86400000)),
    formatDate(today),
    formatDate(new Date(today.getTime() + 86400000)),
  ];

  const dateLabels: Record<string, string> = {
    [dates[0]]: "昨天",
    [dates[1]]: "今天",
    [dates[2]]: "明天",
  };

  const [selectedDate, setSelectedDate] = useState(dates[1]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    async function fetchGames() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/games?date=${selectedDate}&limit=50`);
        if (!response.ok) throw new Error('API error');
        const data = await response.json();

        if (data.games && data.games.length > 0) {
          setGames(data.games);
          setUseMockData(false);
        } else {
          setGames(mockGames);
          setUseMockData(true);
        }
      } catch (error) {
        console.error('Failed to fetch games:', error);
        setGames(mockGames);
        setUseMockData(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();
  }, [selectedDate]);

  const liveGames = games.filter(g => g.status === "live");
  const scheduledGames = games.filter(g => g.status === "scheduled");
  const finalGames = games.filter(g => g.status === "final");

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-black">
          NBA 比分中心
          {useMockData && <span className="text-sm text-yellow-500 ml-3">(演示数据)</span>}
        </h1>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
