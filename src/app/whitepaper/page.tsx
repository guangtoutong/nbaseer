"use client";

export default function WhitepaperPage() {
  return (
    <div className="pt-28 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Technical Whitepaper</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">
            NBAseer AI 预测引擎
            <span className="block text-primary mt-2">技术白皮书</span>
          </h1>
          <p className="text-lg text-slate-400">
            深入了解我们如何利用机器学习和大数据分析来预测 NBA 比赛结果
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">目录</h2>
          <nav className="space-y-2 text-slate-400">
            <a href="#overview" className="block hover:text-primary transition-colors">1. 系统概述</a>
            <a href="#data" className="block hover:text-primary transition-colors">2. 数据来源与处理</a>
            <a href="#features" className="block hover:text-primary transition-colors">3. 特征工程</a>
            <a href="#model" className="block hover:text-primary transition-colors">4. 预测模型架构</a>
            <a href="#training" className="block hover:text-primary transition-colors">5. 模型训练与优化</a>
            <a href="#accuracy" className="block hover:text-primary transition-colors">6. 准确率与验证</a>
            <a href="#realtime" className="block hover:text-primary transition-colors">7. 实时预测系统</a>
            <a href="#future" className="block hover:text-primary transition-colors">8. 未来规划</a>
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Section 1 */}
          <section id="overview" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">1</span>
              系统概述
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                NBAseer 是一个基于机器学习的 NBA 比赛预测系统，旨在通过分析历史数据、球队表现、球员状态等多维度信息，
                为用户提供准确的比赛胜负预测、分差预测和大小分预测。
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                  <div className="text-3xl font-black text-primary">67.8%</div>
                  <div className="text-sm text-slate-400 mt-1">胜负预测准确率</div>
                </div>
                <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                  <div className="text-3xl font-black text-blue-400">50+</div>
                  <div className="text-sm text-slate-400 mt-1">分析维度</div>
                </div>
                <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                  <div className="text-3xl font-black text-green-400">实时</div>
                  <div className="text-sm text-slate-400 mt-1">数据更新</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="data" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">2</span>
              数据来源与处理
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                我们的系统整合了多个权威数据源，确保预测所依赖的数据准确、全面且实时更新。
              </p>
              <div className="space-y-3 mt-4">
                <div className="flex items-start gap-3 p-3 bg-[#1b2028] rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <h4 className="font-bold">ESPN API</h4>
                    <p className="text-sm text-slate-400">实时比分、赛程安排、比赛状态</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[#1b2028] rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                  <div>
                    <h4 className="font-bold">NBA 官方数据</h4>
                    <p className="text-sm text-slate-400">球队统计、球员数据、历史战绩</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[#1b2028] rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2" />
                  <div>
                    <h4 className="font-bold">The Odds API</h4>
                    <p className="text-sm text-slate-400">博彩赔率、让分盘、大小分盘</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="features" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">3</span>
              特征工程
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                特征工程是机器学习中最关键的环节之一。我们从原始数据中提取了超过 50 个有意义的特征维度。
              </p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="py-3 px-4 font-bold">特征类别</th>
                      <th className="py-3 px-4 font-bold">具体特征</th>
                      <th className="py-3 px-4 font-bold">重要性</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4">基础战绩</td>
                      <td className="py-3 px-4">胜率、主场胜率、客场胜率、分区排名</td>
                      <td className="py-3 px-4"><span className="text-green-400">高</span></td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4">近期状态</td>
                      <td className="py-3 px-4">近 5/10 场胜率、连胜/连败、得分趋势</td>
                      <td className="py-3 px-4"><span className="text-green-400">高</span></td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4">进攻能力</td>
                      <td className="py-3 px-4">场均得分、进攻效率、三分命中率、助攻数</td>
                      <td className="py-3 px-4"><span className="text-yellow-400">中</span></td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4">防守能力</td>
                      <td className="py-3 px-4">场均失分、防守效率、篮板、抢断、盖帽</td>
                      <td className="py-3 px-4"><span className="text-yellow-400">中</span></td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4">对战历史</td>
                      <td className="py-3 px-4">历史交锋胜率、场均分差、主客场战绩</td>
                      <td className="py-3 px-4"><span className="text-yellow-400">中</span></td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4">体能因素</td>
                      <td className="py-3 px-4">背靠背比赛、休息天数、旅途距离</td>
                      <td className="py-3 px-4"><span className="text-green-400">高</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">比赛节奏</td>
                      <td className="py-3 px-4">回合数、节奏指数、快攻得分</td>
                      <td className="py-3 px-4"><span className="text-slate-400">低</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="model" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">4</span>
              预测模型架构
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-6">
              <p className="text-slate-300 leading-relaxed">
                我们采用了集成学习的方法，构建了三个独立但相互关联的预测模型。
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-xl">
                  <h4 className="font-bold text-lg mb-2">胜负预测模型</h4>
                  <p className="text-sm text-slate-400 mb-3">XGBoost 分类器</p>
                  <div className="text-xs text-slate-500">
                    <div>输入: 特征向量</div>
                    <div>输出: 主队获胜概率</div>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 rounded-xl">
                  <h4 className="font-bold text-lg mb-2">分差预测模型</h4>
                  <p className="text-sm text-slate-400 mb-3">XGBoost 回归器</p>
                  <div className="text-xs text-slate-500">
                    <div>输入: 特征向量</div>
                    <div>输出: 预测分差</div>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/20 rounded-xl">
                  <h4 className="font-bold text-lg mb-2">总分预测模型</h4>
                  <p className="text-sm text-slate-400 mb-3">XGBoost 回归器</p>
                  <div className="text-xs text-slate-500">
                    <div>输入: 特征向量</div>
                    <div>输出: 两队总得分</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#1b2028] rounded-lg">
                <h4 className="font-bold mb-2">为什么选择 XGBoost?</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• 优秀的处理缺失值能力</li>
                  <li>• 内置正则化防止过拟合</li>
                  <li>• 高效的并行计算</li>
                  <li>• 强大的特征重要性分析</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="training" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">5</span>
              模型训练与优化
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-3">训练数据</h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      近 3 个赛季的全部比赛数据
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      超过 3,600 场常规赛
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      300+ 场季后赛数据
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3">优化策略</h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      5 折交叉验证
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      贝叶斯超参数优化
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      特征选择与降维
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="accuracy" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">6</span>
              准确率与验证
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                我们使用历史数据进行回测验证，确保模型在实际应用中的可靠性。
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-[#1b2028] rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">胜负预测</div>
                  <div className="text-2xl font-black text-green-400">67.8%</div>
                  <div className="text-xs text-slate-500 mt-1">准确率</div>
                  <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: "67.8%" }} />
                  </div>
                </div>
                <div className="p-4 bg-[#1b2028] rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">分差预测</div>
                  <div className="text-2xl font-black text-blue-400">8.2</div>
                  <div className="text-xs text-slate-500 mt-1">MAE (平均绝对误差)</div>
                  <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: "60%" }} />
                  </div>
                </div>
                <div className="p-4 bg-[#1b2028] rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">总分预测</div>
                  <div className="text-2xl font-black text-primary">12.5</div>
                  <div className="text-xs text-slate-500 mt-1">MAE (平均绝对误差)</div>
                  <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
                    <div className="h-full bg-primary rounded-full" style={{ width: "55%" }} />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mt-4">
                <p className="text-sm text-yellow-200">
                  <strong>重要提示:</strong> 博彩市场效率很高，即使是最好的模型也难以保证长期盈利。
                  本系统仅供参考和娱乐，请理性投注。
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="realtime" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">7</span>
              实时预测系统
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                我们的系统采用 Cloudflare Workers 实现边缘计算，确保全球用户都能获得低延迟的实时预测服务。
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-[#1b2028] rounded-lg space-y-3">
                  <h4 className="font-bold">技术架构</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Next.js 15 + React 服务端渲染</li>
                    <li>• Cloudflare Pages 全球 CDN</li>
                    <li>• Cloudflare D1 SQLite 数据库</li>
                    <li>• Cloudflare Workers 定时任务</li>
                  </ul>
                </div>
                <div className="p-4 bg-[#1b2028] rounded-lg space-y-3">
                  <h4 className="font-bold">数据更新频率</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• 比赛数据: 每 30 分钟</li>
                    <li>• 赔率数据: 每小时</li>
                    <li>• 预测结果: 实时计算</li>
                    <li>• 历史统计: 每日更新</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="future" className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">8</span>
              未来规划
            </h2>
            <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-dashed border-white/10 rounded-lg">
                  <div className="text-xs text-primary font-bold mb-2">Q2 2024</div>
                  <h4 className="font-bold mb-1">深度学习升级</h4>
                  <p className="text-sm text-slate-400">引入 Transformer 架构处理序列数据</p>
                </div>
                <div className="p-4 border border-dashed border-white/10 rounded-lg">
                  <div className="text-xs text-blue-400 font-bold mb-2">Q3 2024</div>
                  <h4 className="font-bold mb-1">球员级别分析</h4>
                  <p className="text-sm text-slate-400">加入球员伤病、出场时间等因素</p>
                </div>
                <div className="p-4 border border-dashed border-white/10 rounded-lg">
                  <div className="text-xs text-green-400 font-bold mb-2">Q4 2024</div>
                  <h4 className="font-bold mb-1">实时盘口追踪</h4>
                  <p className="text-sm text-slate-400">监控盘口变化，发现价值投注</p>
                </div>
                <div className="p-4 border border-dashed border-white/10 rounded-lg">
                  <div className="text-xs text-yellow-400 font-bold mb-2">2025</div>
                  <h4 className="font-bold mb-1">多联赛扩展</h4>
                  <p className="text-sm text-slate-400">支持 NFL、MLB、NHL 等联赛</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-8 mt-12">
          <p className="text-sm text-slate-500 text-center">
            NBAseer AI Prediction Engine v4.2 PRO | Last Updated: March 2024
          </p>
        </div>
      </div>
    </div>
  );
}
