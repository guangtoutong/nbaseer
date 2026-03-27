// Team Chinese names
const teamNames: Record<string, string> = {
  DAL: "独行侠",
  LAC: "快船",
  NYK: "尼克斯",
  CLE: "骑士",
  OKC: "雷霆",
  MEM: "灰熊",
  MIN: "森林狼",
  SAC: "国王",
};

// Mock completed games data
const completedGames = [
  {
    id: 1,
    winner: "DAL",
    loser: "LAC",
    winnerScore: 126,
    loserScore: 114,
    predicted: true,
    initialSpread: "-5.5 @1.90",
    aiPredictedSpread: "+10.5",
    actualSpread: "+12",
  },
  {
    id: 2,
    winner: "CLE",
    loser: "NYK",
    winnerScore: 105,
    loserScore: 98,
    predicted: false,
    initialSpread: "+2.5 @1.95",
    aiPredictedSpread: "+4.2",
    actualSpread: "-7",
  },
  {
    id: 3,
    winner: "OKC",
    loser: "MEM",
    winnerScore: 132,
    loserScore: 118,
    predicted: true,
    initialSpread: "-12.5 @1.90",
    aiPredictedSpread: "+15.0",
    actualSpread: "+14",
  },
  {
    id: 4,
    winner: "MIN",
    loser: "SAC",
    winnerScore: 110,
    loserScore: 107,
    predicted: true,
    initialSpread: "-1.5 @1.91",
    aiPredictedSpread: "+2.8",
    actualSpread: "+3",
  },
];

function CompletedGameCard({ game }: { game: (typeof completedGames)[0] }) {
  return (
    <div className="bg-[#0f141a] p-5 rounded-xl border border-white/5 hover:border-primary/20 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FINAL</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
            game.predicted
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-red-900/10 text-red-500 border-red-500/20"
          }`}
        >
          {game.predicted ? "预测命中" : "未命中"}
        </span>
      </div>

      {/* Teams & Scores */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-bold">
              {game.winner}
            </div>
            <span className="text-sm font-medium">{teamNames[game.winner]}</span>
          </div>
          <span className="font-black text-lg">{game.winnerScore}</span>
        </div>
        <div className="flex justify-between items-center opacity-60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-bold">
              {game.loser}
            </div>
            <span className="text-sm font-medium">{teamNames[game.loser]}</span>
          </div>
          <span className="font-black text-lg">{game.loserScore}</span>
        </div>
      </div>

      {/* Odds Comparison */}
      <div className="text-[10px] text-slate-400 border-t border-white/5 pt-3">
        <span className="block">初盘参考: {game.initialSpread}</span>
        <span className={`block mt-1 ${game.predicted ? "text-primary font-bold" : ""}`}>
          AI 预判分差: {game.aiPredictedSpread} (实: {game.actualSpread})
        </span>
      </div>
    </div>
  );
}

export function CompletedGames() {
  return (
    <section className="py-8 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Header */}
      <h2 className="text-2xl font-black flex items-center gap-3">
        <span className="w-2 h-8 bg-slate-500 rounded-full"></span>
        已结束比赛 <span className="text-slate-400 text-sm font-medium tracking-normal">昨日赛果分析</span>
      </h2>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {completedGames.map((game) => (
          <CompletedGameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
