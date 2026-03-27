"use client";

// Team names mapping
const teamNames: Record<string, string> = {
  LAL: "湖人",
  GSW: "勇士",
  BOS: "凯尔特人",
  MIL: "雄鹿",
};

// Mock live games data
const liveGames = [
  {
    id: 1,
    homeTeam: "LAL",
    awayTeam: "GSW",
    homeScore: 104,
    awayScore: 101,
    homeProb: 62.5,
    quarter: 4,
    time: "08:42",
    stats: {
      fgPct: "48.2% vs 46.5%",
      turnovers: "8 - 12",
    },
  },
  {
    id: 2,
    homeTeam: "BOS",
    awayTeam: "MIL",
    homeScore: 76,
    awayScore: 82,
    homeProb: 41.8,
    quarter: 3,
    time: "03:15",
    stats: {
      rebounds: "32 - 35",
      threePoint: "10/24 - 12/26",
    },
  },
];

function LiveGameCard({ game }: { game: (typeof liveGames)[0] }) {
  return (
    <div className="flex-1 bg-[#151a21]/70 backdrop-blur p-6 rounded-xl border-l-4 border-blue-500 hover:bg-[#1b2028]/50 transition-colors">
      {/* Teams & Scores */}
      <div className="flex justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border-2 border-slate-700">
            {game.homeTeam}
          </div>
          <div className="text-right">
            <div className="text-2xl font-black">{game.homeScore}</div>
            <div className="text-xs text-slate-400">{teamNames[game.homeTeam]}</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
            第 {game.quarter} 节 {game.time}
          </span>
          <div className="w-px h-8 bg-white/10"></div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-2xl font-black">{game.awayScore}</div>
            <div className="text-xs text-slate-400">{teamNames[game.awayTeam]}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border-2 border-slate-700">
            {game.awayTeam}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center border-t border-white/10 pt-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            {game.stats.fgPct ? "投篮命中率" : "篮板"}
          </div>
          <div className="text-sm font-bold">
            {game.stats.fgPct || game.stats.rebounds}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">实时胜率</div>
          <div className="text-sm font-bold text-blue-400">{game.homeProb}%</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">
            {game.stats.turnovers ? "失误" : "三分"}
          </div>
          <div className="text-sm font-bold">
            {game.stats.turnovers || game.stats.threePoint}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LiveGames() {
  return (
    <section className="py-8 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
          进行中 <span className="text-blue-400 text-sm font-medium tracking-normal">({liveGames.length} 场比赛)</span>
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
        {liveGames.map((game) => (
          <LiveGameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
