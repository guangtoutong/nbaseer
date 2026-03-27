export function HeroSection() {
  return (
    <section className="pt-32 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
      <div className="relative overflow-hidden rounded-xl bg-[#0f141a] p-8 md:p-16 border border-white/5">
        {/* Gradient Background */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-l from-primary/30 to-transparent"></div>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary tracking-widest uppercase">AI Engine v4.2 PRO</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
              nbaseer AI 预测引擎 - <span className="text-primary">全量数据</span> 已开启
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              利用先进的深度学习算法，每秒分析超过 <span className="text-white font-bold">120万</span> 个数据点。所有高级指标、实时预测与市场赔率现已全部解锁。
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 rounded-xl bg-gradient-to-br from-primary to-[#ff7948] text-white font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                立即开始探索
              </button>
              <button className="px-8 py-4 rounded-xl bg-[#151a21]/70 backdrop-blur border border-white/10 text-white font-bold hover:bg-[#1b2028] transition-colors">
                查看技术白皮
              </button>
            </div>
          </div>

          {/* Right - Feature Cards */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-[#1b2028] border border-white/5">
              <svg className="w-8 h-8 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="font-bold text-xl mb-2">多维分析</h3>
              <p className="text-sm text-slate-400">集成伤病、背靠背、客场表现等50+关键变量。</p>
            </div>
            <div className="p-6 rounded-xl bg-[#1b2028] border border-white/5 mt-8">
              <svg className="w-8 h-8 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="font-bold text-xl mb-2">毫秒响应</h3>
              <p className="text-sm text-slate-400">球场变幻莫测，AI 模型实时同步最新赔率与动态。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
