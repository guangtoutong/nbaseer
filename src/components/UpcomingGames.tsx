// Mock featured game
const featuredGame = {
  id: 1,
  homeTeam: "PHX",
  awayTeam: "DEN",
  homeName: "太阳",
  awayName: "掘金",
  homeProb: 58.4,
  awayProb: 41.6,
  predictedHomeScore: 118,
  predictedAwayScore: 114,
  spread: "+4.5",
  total: 232.5,
  confidence: 88,
  gameTime: "今天 07:30 EST",
  odds: {
    ml: "1.62 / 2.35",
    spread: "-4.5 @1.90",
    total: "232.5 @1.90",
  },
  aiAnalysis: {
    summary1: "太阳队主场近5场平均得分 121.2，进攻效率排联盟第3。",
    summary2: "掘金核心中锋因背靠背体能受限，过去3次客战太阳均在禁区得分低于赛季平均。",
    historyWinRate: 65,
  },
};

// Small prediction card data
const smallGame = {
  id: 2,
  homeTeam: "MIA",
  awayTeam: "PHI",
  homeName: "热火",
  awayName: "76人",
  homeProb: 52,
  awayProb: 48,
  predictedHomeScore: 102,
  predictedAwayScore: 100,
  spread: "+2.5",
  gameTime: "今天 09:00 EST",
  odds: {
    ml: "1.85 / 1.96",
    spread: "-2.5 @1.91",
    total: "202.5 @1.90",
  },
};

export function UpcomingGames() {
  return (
    <section className="py-8 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Header */}
      <h2 className="text-2xl font-black flex items-center gap-3">
        <span className="w-2 h-8 bg-primary rounded-full"></span>
        即将开始 <span className="text-primary text-sm font-medium tracking-normal">AI 预测中心</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Featured Prediction Card */}
        <div className="md:col-span-2 bg-[#151a21]/70 backdrop-blur rounded-xl overflow-hidden border border-white/5 flex flex-col md:flex-row">
          <div className="flex-1 p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded uppercase tracking-tighter">热门预测</span>
                <p className="text-sm text-slate-400 mt-2">{featuredGame.gameTime}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-400">置信度</div>
                <div className="text-xl font-black text-primary">{featuredGame.confidence}%</div>
              </div>
            </div>

            {/* Teams */}
            <div className="flex justify-around items-center py-2">
              <div className="text-center group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1b2028] border-2 border-primary flex items-center justify-center mb-3 shadow-2xl shadow-primary/20 transition-transform group-hover:scale-110">
                  <span className="text-xl md:text-2xl font-black">{featuredGame.homeTeam}</span>
                </div>
                <div className="text-base md:text-lg font-bold">{featuredGame.homeName}</div>
                <div className="text-xs md:text-sm text-primary font-bold">{featuredGame.homeProb}% 胜率</div>
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-600">VS</div>
              <div className="text-center group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1b2028] border-2 border-slate-600 flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
                  <span className="text-xl md:text-2xl font-black">{featuredGame.awayTeam}</span>
                </div>
                <div className="text-base md:text-lg font-bold">{featuredGame.awayName}</div>
                <div className="text-xs md:text-sm text-slate-400">{featuredGame.awayProb}% 胜率</div>
              </div>
            </div>

            {/* AI Predictions */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#151a21]/30 p-3 rounded-lg text-center">
                <div className="text-[10px] text-slate-400 mb-1">预测比分</div>
                <div className="text-sm md:text-base font-black">{featuredGame.predictedHomeScore} - {featuredGame.predictedAwayScore}</div>
              </div>
              <div className="bg-[#151a21]/30 p-3 rounded-lg text-center">
                <div className="text-[10px] text-slate-400 mb-1">预测分差</div>
                <div className="text-sm md:text-base font-black text-primary">{featuredGame.spread}</div>
              </div>
              <div className="bg-[#151a21]/30 p-3 rounded-lg text-center">
                <div className="text-[10px] text-slate-400 mb-1">预测总分</div>
                <div className="text-sm md:text-base font-black">{featuredGame.total}</div>
              </div>
            </div>

            {/* Odds Section */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white/80 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  参考赔率
                </span>
                <span className="text-[10px] text-slate-400 italic">市场实时数据</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#1b2028]/40 p-2 rounded border border-white/5">
                  <div className="text-[9px] text-slate-400 uppercase mb-1">独赢 (ML)</div>
                  <div className="text-xs font-bold">{featuredGame.odds.ml}</div>
                </div>
                <div className="bg-[#1b2028]/40 p-2 rounded border border-white/5">
                  <div className="text-[9px] text-slate-400 uppercase mb-1">让分 (Spread)</div>
                  <div className="text-xs font-bold">{featuredGame.odds.spread}</div>
                </div>
                <div className="bg-[#1b2028]/40 p-2 rounded border border-white/5">
                  <div className="text-[9px] text-slate-400 uppercase mb-1">总分 (Total)</div>
                  <div className="text-xs font-bold">{featuredGame.odds.total}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="w-full md:w-72 bg-gradient-to-br from-primary/90 to-[#ff7948] p-8 flex flex-col justify-center text-white">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
              <h3 className="font-black text-lg uppercase tracking-tight">AI 深度分析</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium leading-relaxed">{featuredGame.aiAnalysis.summary1}</p>
              <p className="text-sm font-medium leading-relaxed">{featuredGame.aiAnalysis.summary2}</p>
              <div className="pt-4 mt-4 border-t border-white/20">
                <div className="flex justify-between text-xs mb-1">
                  <span>历史交锋胜率</span>
                  <span>太阳 {featuredGame.aiAnalysis.historyWinRate}%</span>
                </div>
                <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${featuredGame.aiAnalysis.historyWinRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small Prediction Card */}
        <div className="bg-[#151a21]/70 backdrop-blur p-6 rounded-xl border border-white/5 flex flex-col hover:border-primary/30 transition-all">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-slate-400">{smallGame.gameTime}</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-[10px] text-slate-400">实时</span>
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1b2028] border border-white/10 flex items-center justify-center font-bold text-xs">{smallGame.homeTeam}</div>
                <span className="font-bold text-sm">{smallGame.homeName}</span>
              </div>
              <span className="font-black text-primary">{smallGame.homeProb}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1b2028] border border-white/10 flex items-center justify-center font-bold text-xs">{smallGame.awayTeam}</div>
                <span className="font-bold text-sm">{smallGame.awayName}</span>
              </div>
              <span className="font-black text-slate-400">{smallGame.awayProb}%</span>
            </div>
          </div>

          <div className="space-y-2 py-4 border-t border-white/10">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>预测比分</span>
              <span className="font-bold text-white">{smallGame.predictedHomeScore} - {smallGame.predictedAwayScore}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>预测分差</span>
              <span className="font-bold text-primary">{smallGame.spread}</span>
            </div>
          </div>

          {/* Small Card Odds */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="text-[10px] font-bold text-slate-400 mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              参考赔率
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="text-[10px] bg-[#151a21]/50 px-2 py-1.5 rounded flex justify-between">
                <span className="opacity-50">独赢 (ML)</span>
                <span className="font-bold">{smallGame.odds.ml}</span>
              </div>
              <div className="text-[10px] bg-[#151a21]/50 px-2 py-1.5 rounded flex justify-between">
                <span className="opacity-50">让分 (SPR)</span>
                <span className="font-bold">{smallGame.odds.spread}</span>
              </div>
              <div className="text-[10px] bg-[#151a21]/50 px-2 py-1.5 rounded flex justify-between">
                <span className="opacity-50">总分 (O/U)</span>
                <span className="font-bold">{smallGame.odds.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
