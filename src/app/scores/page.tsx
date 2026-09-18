"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Game } from "@/lib/types";
import { useLocale } from "@/lib/LocaleContext";
import { getTimeDisplay } from "@/lib/timeUtils";

const content = {
  zh: {
    title: "NBA 比分中心",
    subtitle: "实时比分、赛程安排和比赛数据",
    yesterday: "昨天",
    today: "今天",
    tomorrow: "明天",
    live: "进行中",
    upcoming: "即将开始",
    final: "已结束",
    games: "场",
    noGames: "该日期暂无比赛",
    viewDetails: "查看详情",
    quarter: "第 {n} 节",
  },
  en: {
    title: "NBA Scores",
    subtitle: "Live scores, schedules and game data",
    yesterday: "Yesterday",
    today: "Today",
    tomorrow: "Tomorrow",
    live: "Live",
    upcoming: "Upcoming",
    final: "Final",
    games: "games",
    noGames: "No games on this date",
    viewDetails: "View Details",
    quarter: "Q{n}",
  },
};

function GameCard({ game, locale }: { game: Game; locale: "zh" | "en" }) {
  const t = content[locale];
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const homeWinning = (game.home_score || 0) > (game.away_score || 0);
  const timeDisplay = getTimeDisplay(game.date, game.time, locale);

  // Get team names based on locale
  const homeTeamName = locale === 'zh' ? (game.home_team_cn || game.home_team) : (game.home_team || game.home_team_cn);
  const awayTeamName = locale === 'zh' ? (game.away_team_cn || game.away_team) : (game.away_team || game.away_team_cn);

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
              {t.quarter.replace('{n}', String(game.period))} {game.time}
            </span>
          </div>
        ) : isFinal ? (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FINAL</span>
        ) : (
          <span className="text-xs text-slate-400">{timeDisplay}</span>
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
            <span className="font-medium">{homeTeamName}</span>
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
            <span className="font-medium">{awayTeamName}</span>
          </div>
          <span className={`text-xl font-black ${game.away_score ? "" : "text-slate-600"}`}>
            {game.away_score || "-"}
          </span>
        </div>
      </div>

      {/* View Details Button */}
      <Link
        href={`/game/${game.id}`}
        className="mt-4 w-full py-2 text-xs font-bold text-slate-400 hover:text-primary border border-white/5 rounded-lg hover:border-primary/30 transition-all block text-center"
      >
        {t.viewDetails}
      </Link>
    </div>
  );
}

export default function ScoresPage() {
  const { locale } = useLocale();
  const t = content[locale];
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const dates = [
    formatDate(new Date(today.getTime() - 86400000)),
    formatDate(today),
    formatDate(new Date(today.getTime() + 86400000)),
  ];

  const dateLabels: Record<string, string> = {
    [dates[0]]: t.yesterday,
    [dates[1]]: t.today,
    [dates[2]]: t.tomorrow,
  };

  const [selectedDate, setSelectedDate] = useState(dates[1]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchGames() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/games?date=${selectedDate}&limit=50`);
        if (!response.ok) throw new Error('API error');
        const data = await response.json() as { games: Game[] };
        if (!cancelled) setGames(data.games || []);
      } catch (error) {
        // An empty schedule is a legitimate answer; placeholder fixtures are not.
        console.error('Failed to fetch games:', error);
        if (!cancelled) setGames([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchGames();
    return () => { cancelled = true; };
  }, [selectedDate]);

  const liveGames = games.filter(g => g.status === "live");
  const scheduledGames = games.filter(g => g.status === "scheduled");
  const finalGames = games.filter(g => g.status === "final");

  return (
    <div className="pt-8 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-black">
          {t.title}
        </h1>
        <p className="text-slate-400">
          {t.subtitle}
        </p>
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
                {t.live}
                <span className="text-blue-400 text-sm font-medium">({liveGames.length} {t.games})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveGames.map((game) => (
                  <GameCard key={game.id} game={game} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {/* Scheduled Games */}
          {scheduledGames.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-black flex items-center gap-3">
                <span className="w-2 h-6 bg-primary rounded-full" />
                {t.upcoming}
                <span className="text-primary text-sm font-medium">({scheduledGames.length} {t.games})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduledGames.map((game) => (
                  <GameCard key={game.id} game={game} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {/* Final Games */}
          {finalGames.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-black flex items-center gap-3">
                <span className="w-2 h-6 bg-slate-500 rounded-full" />
                {t.final}
                <span className="text-slate-400 text-sm font-medium">({finalGames.length} {t.games})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {finalGames.map((game) => (
                  <GameCard key={game.id} game={game} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {games.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg">{t.noGames}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
