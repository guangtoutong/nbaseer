export default function AboutPage() {
  return (
    <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-[#0f141a] p-8 md:p-16 border border-white/5">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-l from-primary/50 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            关于 <span className="text-primary">nbaseer</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            nbaseer 是一个基于深度学习的 NBA 比赛预测平台，利用先进的 AI 技术分析海量数据，为用户提供高准确率的比赛预测和实时分析。
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <span className="w-2 h-8 bg-primary rounded-full" />
          核心功能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f141a] border border-white/5 p-8 rounded-xl hover:border-primary/30 transition-all">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">智能预测</h3>
            <p className="text-slate-400 leading-relaxed">
              基于深度神经网络分析球队历史数据、球员表现、伤病情况等50+关键变量，提供胜负、分差、总分预测。
            </p>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-8 rounded-xl hover:border-primary/30 transition-all">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">实时更新</h3>
            <p className="text-slate-400 leading-relaxed">
              毫秒级数据同步，实时追踪比赛进程、市场赔率变化，动态调整预测概率，确保信息时效性。
            </p>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-8 rounded-xl hover:border-primary/30 transition-all">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">高准确率</h3>
            <p className="text-slate-400 leading-relaxed">
              历史预测准确率达到67.8%，远超市场平均水平。所有预测记录透明可查，支持历史数据回溯。
            </p>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-500 rounded-full" />
          技术架构
        </h2>
        <div className="bg-[#0f141a] border border-white/5 p-8 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold">数据处理</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  每秒分析超过 120 万个数据点
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  集成 NBA 官方 API 实时数据
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  历史数据回溯至 2010 赛季
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  多源赔率数据聚合分析
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-bold">AI 模型</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-400 rounded-full" />
                  深度神经网络 (DNN) 架构
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-400 rounded-full" />
                  XGBoost 集成学习增强
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-400 rounded-full" />
                  每日自动模型迭代优化
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-400 rounded-full" />
                  贝叶斯概率校准
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <span className="w-2 h-8 bg-green-500 rounded-full" />
          平台数据
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black text-primary mb-2">67.8%</div>
            <div className="text-sm text-slate-400">预测准确率</div>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black mb-2">12,847</div>
            <div className="text-sm text-slate-400">累计预测场次</div>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black text-green-500 mb-2">+8.2%</div>
            <div className="text-sm text-slate-400">平均 ROI</div>
          </div>
          <div className="bg-[#0f141a] border border-white/5 p-6 rounded-xl text-center">
            <div className="text-4xl font-black text-blue-400 mb-2">120M+</div>
            <div className="text-sm text-slate-400">每秒数据点</div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-[#0f141a] border border-yellow-500/20 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-yellow-500 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          免责声明
        </h3>
        <p className="text-slate-400 leading-relaxed">
          nbaseer 提供的所有预测和分析仅供参考，不构成任何投资建议。体育比赛结果具有不确定性，过往表现不代表未来结果。请用户理性对待预测数据，自行承担决策风险。
        </p>
      </section>

      {/* Contact */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-bold">联系我们</h2>
        <p className="text-slate-400">
          如有问题或建议，请发送邮件至{" "}
          <a href="mailto:support@nbaseer.com" className="text-primary hover:underline">
            support@nbaseer.com
          </a>
        </p>
      </section>
    </div>
  );
}
