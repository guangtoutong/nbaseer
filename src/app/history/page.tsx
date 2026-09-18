"use client";

import { useState, useEffect } from "react";
import type { StatsResponse } from "@/lib/types";
import { useLocale } from "@/lib/LocaleContext";
import type { Locale } from "@/lib/i18n";

const content = {
  zh: {
    title: "预测历史",
    subtitle: "每一条记录都是比赛开始前写入数据库的预测，赛后按最终比分结算。",
    overallAccuracy: "胜负命中率",
    winPrediction: "选对获胜方的比例",
    totalPredictions: "已结算预测",
    games: "场比赛",
    spreadMae: "平均分差误差",
    spreadMaeDesc: "预测分差与实际分差之差",
    totalMae: "平均总分误差",
    totalMaeDesc: "预测总分与实际总分之差",
    points: "分",
    brier: "Brier 分数",
    brierDesc: "0.25 等同抛硬币，越低越好",
    monthlyPerformance: "月度表现",
    hit: "命中",
    predictions: "预测",
    filterAll: "全部",
    filterCorrect: "命中",
    filterIncorrect: "未命中",
    recentPredictions: "最近预测记录",
    date: "日期",
    matchup: "对阵",
    predictedWinRate: "赛前主队胜率",
    score: "比分",
    result: "结果",
    vs: "vs",
    noRecords: "暂无预测记录",
    emptyTitle: "本赛季还没有已结算的预测",
    emptyBody:
      "新赛季开赛后，每场比赛的预测会在赛前写入、赛后自动结算，命中率会从第一场开始真实累计。",
    methodology: "口径说明",
    methodologyBody:
      "胜负命中率 = 选对获胜方的场次占比。平均误差是绝对误差的均值，越小说明预测越贴近实际比分。所有数字直接来自数据库聚合，没有人工挑选或修饰。",
    months: ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  en: {
    title: "Prediction History",
    subtitle:
      "Every row is a prediction written to the database before tip-off, then settled against the final score.",
    overallAccuracy: "Winner Accuracy",
    winPrediction: "Share of games where we picked the winner",
    totalPredictions: "Settled Predictions",
    games: "games",
    spreadMae: "Avg Spread Error",
    spreadMaeDesc: "Predicted margin vs actual margin",
    totalMae: "Avg Total Error",
    totalMaeDesc: "Predicted total vs actual total",
    points: "pts",
    brier: "Brier Score",
    brierDesc: "0.25 equals a coin flip; lower is better",
    monthlyPerformance: "Monthly Performance",
    hit: "Hit",
    predictions: "Predictions",
    filterAll: "All",
    filterCorrect: "Correct",
    filterIncorrect: "Incorrect",
    recentPredictions: "Recent Predictions",
    date: "Date",
    matchup: "Matchup",
    predictedWinRate: "Pre-game Home Win%",
    score: "Score",
    result: "Result",
    vs: "vs",
    noRecords: "No prediction records",
    emptyTitle: "No settled predictions this season yet",
    emptyBody:
      "Once the season tips off, each game is predicted beforehand and settled afterwards. Accuracy accumulates from the very first game.",
    methodology: "How these are measured",
    methodologyBody:
      "Winner accuracy is the share of games where the predicted winner actually won. The error figures are mean absolute errors — smaller means closer to the real score. Every number is a direct aggregate over the database, with no cherry-picking.",
    months: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
};

type FilterType = "all" | "correct" | "incorrect";

function formatMonth(monthStr: string, locale: Locale): string {
  const [year, month] = monthStr.split('-');
  return `${content[locale].months[parseInt(month)]} ${year}`;
}

const EMPTY_STATS: StatsResponse = {
  overall: {
    total_predictions: 0,
    correct_winners: 0,
    correct_spreads: 0,
    correct_totals: 0,
    winner_accuracy: null,
    spread_accuracy: null,
    total_accuracy: null,
    spread_mae: null,
    total_mae: null,
    brier_score: null,
  },
  monthly: [],
  recent: [],
  games: [],
};

function StatCard({
  label,
  value,
  sublabel,
  accent = false,
  valueClass = "",
}: {
  label: string;
  value: string;
  sublabel: string;
  accent?: boolean;
  valueClass?: string;
}) {
  return (
    <div
      className={
        accent
          ? "bg-gradient-to-br from-primary/90 to-[#ff7948] p-6 rounded-xl"
          : "bg-[#0f141a] border border-white/5 p-6 rounded-xl"
      }
    >
      <div className={`text-sm mb-1 ${accent ? "opacity-80" : "text-slate-400"}`}>{label}</div>
      <div className={`text-4xl font-black ${valueClass}`}>{value}</div>
      <div className={`text-sm mt-2 ${accent ? "opacity-80" : "text-slate-400"}`}>{sublabel}</div>
    </div>
  );
}

export default function HistoryPage() {
  const { locale } = useLocale();
  const t = content[locale];
  const [filter, setFilter] = useState<FilterType>("all");
  const [stats, setStats] = useState<StatsResponse>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('API error');
        const data = await response.json() as StatsResponse;
        setStats({ ...EMPTY_STATS, ...data });
      } catch (error) {
        // An unreachable API is not evidence of a track record: stay empty rather
        // than invent one.
        console.error('Failed to fetch stats:', error);
        setStats(EMPTY_STATS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const { overall } = stats;
  const hasRecord = overall.total_predictions > 0;

  const filteredHistory = stats.recent.filter(p => {
    if (filter === "correct") return p.winner_correct === 1;
    if (filter === "incorrect") return p.winner_correct === 0;
    return true;
  });

  if (isLoading) {
    return (
      <div className="pt-8 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
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
    <div className="pt-8 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-black">{t.title}</h1>
        <p className="text-slate-400 max-w-3xl">{t.subtitle}</p>
      </div>

      {!hasRecord ? (
        <div className="bg-[#0f141a] border border-white/5 rounded-xl p-10 text-center space-y-3">
          <p className="text-xl font-bold">{t.emptyTitle}</p>
          <p className="text-slate-400 max-w-xl mx-auto">{t.emptyBody}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              accent
              label={t.overallAccuracy}
              value={`${(overall.winner_accuracy ?? 0).toFixed(1)}%`}
              sublabel={`${overall.correct_winners} / ${overall.total_predictions}`}
            />
            <StatCard
              label={t.totalPredictions}
              value={overall.total_predictions.toLocaleString()}
              sublabel={t.games}
            />
            <StatCard
              label={t.spreadMae}
              value={overall.spread_mae != null ? `${overall.spread_mae.toFixed(1)} ${t.points}` : "—"}
              sublabel={t.spreadMaeDesc}
              valueClass="text-blue-400"
            />
            <StatCard
              label={t.brier}
              value={overall.brier_score != null ? overall.brier_score.toFixed(3) : "—"}
              sublabel={t.brierDesc}
              valueClass={
                overall.brier_score != null && overall.brier_score < 0.25
                  ? "text-green-500"
                  : "text-slate-400"
              }
            />
          </div>

          {stats.monthly.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-black flex items-center gap-3">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                {t.monthlyPerformance}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.monthly.slice(0, 4).map((stat) => (
                  <div key={stat.month} className="bg-[#0f141a] border border-white/5 p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">{formatMonth(stat.month, locale)}</span>
                      <span className={`text-2xl font-black ${stat.accuracy >= 60 ? "text-green-500" : "text-slate-400"}`}>
                        {stat.accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stat.accuracy >= 60 ? "bg-green-500" : "bg-slate-500"}`}
                        style={{ width: `${Math.min(100, Math.max(0, stat.accuracy))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>{stat.correct} {t.hit}</span>
                      <span>{stat.total} {t.predictions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex gap-2">
            {([
              ["all", t.filterAll, "bg-primary"],
              ["correct", t.filterCorrect, "bg-green-600"],
              ["incorrect", t.filterIncorrect, "bg-red-600"],
            ] as const).map(([key, label, active]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  filter === key ? `${active} text-white` : "bg-[#151a21] text-slate-400 hover:bg-[#1b2028]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-full" />
              {t.recentPredictions}
            </h2>

            <div className="bg-[#0f141a] border border-white/5 rounded-xl overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs text-slate-400 uppercase">
                    <th className="p-4">{t.date}</th>
                    <th className="p-4">{t.matchup}</th>
                    <th className="p-4">{t.predictedWinRate}</th>
                    <th className="p-4">{t.score}</th>
                    <th className="p-4">{t.result}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((prediction, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-slate-400">{prediction.date}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{prediction.home_team}</span>
                          <span className="text-slate-500">{t.vs}</span>
                          <span className="font-bold">{prediction.away_team}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-primary">
                        {prediction.home_win_prob != null
                          ? `${(prediction.home_win_prob * 100).toFixed(0)}%`
                          : "—"}
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
                          {prediction.winner_correct === 1 ? t.filterCorrect : t.filterIncorrect}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredHistory.length === 0 && (
                <div className="text-center py-10 text-slate-400">{t.noRecords}</div>
              )}
            </div>
          </section>
        </>
      )}

      <section className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-2">
        <h2 className="font-bold text-slate-200">{t.methodology}</h2>
        <p className="text-sm text-slate-400 leading-relaxed">{t.methodologyBody}</p>
      </section>
    </div>
  );
}
