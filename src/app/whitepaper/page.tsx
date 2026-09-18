"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { BACKTEST } from "@/lib/backtest";

const content = {
  zh: {
    badge: "方法说明",
    title: "nbaseer 预测模型",
    subtitle: "它怎么算的，算得有多准",
    description:
      "这一页写清楚模型用了什么数据、怎么出数、在多少场比赛上验证过，以及它做不到什么。没有营销辞令。",
    toc: "目录",
    tocItems: [
      { id: "overview", label: "1. 模型是什么" },
      { id: "data", label: "2. 数据来源" },
      { id: "elo", label: "3. 评分如何更新" },
      { id: "predict", label: "4. 从评分到预测" },
      { id: "market", label: "5. 盘口校准" },
      { id: "accuracy", label: "6. 回测结果" },
      { id: "limits", label: "7. 模型的局限" },
    ],
    s1: {
      title: "模型是什么",
      p1: "nbaseer 用的是 Elo 评分——国际象棋里那套排名方法，经 FiveThirtyEight 针对篮球改造后广泛用于体育预测。每支球队有一个分数，赢球加分、输球减分，赢得越多加得越多。两队分数之差直接换算成胜率和预测分差。",
      p2: "这是一个统计模型，不是神经网络，也没有做球员级别的建模。它只看球队层面的结果：谁赢了、赢了多少分、什么时候打的、在谁的主场打的。选择它的理由是简单、可复现、且在篮球上表现稳定——不是因为它是最强的方法。",
      stat1: "胜负命中率",
      stat2: "回测场次",
      stat3: "模型版本",
    },
    s2: {
      title: "数据来源",
      text: "全部数据来自公开接口，没有私有数据源，也没有内幕信息。",
      sources: [
        { name: "ESPN Scoreboard API", desc: "赛程、比分、比赛状态。每 10 分钟同步一次，覆盖昨天到未来三天。免费且无配额限制。" },
        { name: "The Odds API", desc: "美国多家博彩公司的独赢盘、让分盘和大小分。免费额度每月 500 credits，因此每 6 小时才取一次，取多家均值。" },
        { name: "历史回放", desc: "评分的起点由 2025-26 赛季全部 1,322 场比赛按时间顺序回放得出，赛季之间向 1500 分回归 25%。" },
      ],
    },
    s3: {
      title: "评分如何更新",
      text: "每场比赛结束后，按下面的公式调整双方评分。这是 FiveThirtyEight 的净胜分缩放版本——赢 30 分比赢 2 分更能说明问题，但收益递减，避免垃圾时间的比分虚增评分。",
      formulaLabel: "评分变化量",
      notes: [
        "K = 24：单场最大调整幅度的基准",
        "MOV：净胜分；(MOV+3)^0.8 让大胜多加分，但增速递减",
        "分母中的 0.006 × 评分差：强队赢弱队时少加分，防止评分发散",
        "预期胜率来自赛前评分差，已计入主场与背靠背调整",
      ],
    },
    s4: {
      title: "从评分到预测",
      text: "预测时先算出这场比赛的有效评分差，再换算成三个输出。",
      steps: [
        { label: "有效评分差", desc: "主队评分 + 55（主场优势）− 客队评分；任一方打背靠背再扣 25 分。" },
        { label: "胜率", desc: "标准 Elo 公式：1 / (1 + 10^(−评分差/400))，结果限制在 3%–97% 之间。" },
        { label: "分差", desc: "评分差 ÷ 22。约每 22 分 Elo 对应 1 分净胜分，所以 55 分主场优势 ≈ 2.5 分。" },
        { label: "总分", desc: "由两队的场均得分与场均失分估算。赛季初样本少，按 20 场的先验强度向联盟均值（114 分）回归。" },
        { label: "信心度", desc: "就是模型给自己所选一方的概率，即 max(主队胜率, 客队胜率)。势均力敌的比赛显示 50% 出头，不做包装。" },
      ],
    },
    s5: {
      title: "盘口校准",
      p1: "博彩公司的开盘价是市场上最强的预测之一。有赔率数据时，模型会和盘口各取一半：胜率、分差、总分都做 50/50 混合，赔率先剔除抽水（两边概率归一化），并对多家取均值。",
      p2: "没有赔率时模型独立出数——这也是常态，因为免费额度只够每 6 小时取一次。每条预测都带 model_version 字段，后缀 +market 表示混入了盘口，model 表示纯模型输出。",
    },
    s6: {
      title: "回测结果",
      method:
        "下面的数字来自滚动回测（walk-forward）：按时间顺序逐场预测，每场预测完成之后，才把这场的结果并入评分。也就是说预测时用的信息，全部是比赛开打前就已经存在的。前 150 场是评分预热期，此时所有球队还都在 1500 分附近，预测没有信息量，因此排除在统计之外。",
      metrics: "指标",
      value: "数值",
      meaning: "含义",
      rows: [
        ["胜负命中率", `${BACKTEST.winner_accuracy}%`, `选对获胜方 ${BACKTEST.correct_winners} / ${BACKTEST.games_evaluated} 场。作为参照，无脑选主队约 57%。`],
        ["Brier 分数", `${BACKTEST.brier_score}`, "概率预测的均方误差。0.25 相当于每场都说 50%，越低说明概率越有信息量。"],
        ["平均分差误差", `${BACKTEST.spread_mae} 分`, "预测分差与实际分差的平均绝对差。NBA 单场净胜分波动很大，这个量级属正常。"],
        ["平均总分误差", `${BACKTEST.total_mae} 分`, "预测总分与实际总分的平均绝对差。这是模型最弱的一项，见下一节。"],
        ["总分 ±10 分命中率", `${BACKTEST.total_accuracy}%`, "预测总分落在实际总分 10 分以内的比例。"],
      ],
      caveat:
        "这是单赛季、单次回测的结果，样本 1,172 场。胜负命中率的统计标准误约 1.4 个百分点，所以 67.8% 应当理解为「大约 65%–70%」，而不是一个精确值。换一个赛季重跑，数字会变。",
    },
    s7: {
      title: "模型的局限",
      text: "这些是已知的弱点，不打算藏着：",
      limits: [
        { t: "看不见伤病", d: "模型完全不知道谁没上场。当家球星缺阵时，它照旧按满编实力预测，这类比赛会错得很离谱。" },
        { t: "总分预测偏弱", d: `平均误差 ${BACKTEST.total_mae} 分，只比直接报联盟均值好一点。场均得分同时混杂了节奏和效率，分不开就难做准。` },
        { t: "赛季初不准", d: "开赛前几周评分主要来自上赛季的遗产，阵容变动、新秀成长都没体现。前 10-15 场的预测应当打折看待。" },
        { t: "跑不赢盘口", d: "让分盘命中率 52.9%，扣掉抽水后不具备正期望。这个模型不是用来赢钱的工具。" },
        { t: "不做球员建模", d: "没有出场时间、伤病报告、球员效率值。只有球队层面的胜负和得失分。" },
      ],
    },
    disclaimerTitle: "免责声明",
    disclaimerText:
      "以上全部内容仅供参考，不构成任何投注或投资建议。模型经常出错，回测表现不代表未来结果。",
    seeHistory: "查看实时累计的准确率",
    footerPrefix: "模型版本",
    footerBacktest: "回测区间",
    footerGenerated: "生成于",
  },
  en: {
    badge: "Method",
    title: "The nbaseer model",
    subtitle: "How it works, and how well",
    description:
      "What data goes in, how the numbers come out, how many games it was validated on, and what it cannot do. No marketing language.",
    toc: "Contents",
    tocItems: [
      { id: "overview", label: "1. What the model is" },
      { id: "data", label: "2. Data sources" },
      { id: "elo", label: "3. How ratings update" },
      { id: "predict", label: "4. From ratings to predictions" },
      { id: "market", label: "5. Market calibration" },
      { id: "accuracy", label: "6. Backtest results" },
      { id: "limits", label: "7. Limitations" },
    ],
    s1: {
      title: "What the model is",
      p1: "nbaseer uses Elo ratings — the chess ranking system, adapted for basketball by FiveThirtyEight and widely used in sports forecasting. Each team holds a number that rises when it wins and falls when it loses, scaled by how convincingly. The gap between two teams' numbers converts directly into a win probability and a predicted margin.",
      p2: "This is a statistical model, not a neural network, and there is no player-level modelling. It sees only team-level outcomes: who won, by how much, when, and on whose floor. It was chosen for being simple, reproducible and stable on basketball — not for being the strongest method available.",
      stat1: "Winner accuracy",
      stat2: "Games backtested",
      stat3: "Model version",
    },
    s2: {
      title: "Data sources",
      text: "Everything comes from public APIs. No private feeds, no inside information.",
      sources: [
        { name: "ESPN Scoreboard API", desc: "Schedule, scores and game status. Synced every 10 minutes across yesterday through three days out. Free and unmetered." },
        { name: "The Odds API", desc: "Moneyline, spread and totals from US bookmakers. The free tier allows 500 credits a month, so this is fetched only every 6 hours and averaged across books." },
        { name: "Historical replay", desc: "Ratings are seeded by replaying all 1,322 games of the 2025-26 season in order, then regressing 25% toward 1500 between seasons." },
      ],
    },
    s3: {
      title: "How ratings update",
      text: "After each game both teams' ratings move by the amount below. This is FiveThirtyEight's margin-of-victory formulation: a 30-point win says more than a 2-point win, but with diminishing returns so garbage-time scoring cannot inflate a rating.",
      formulaLabel: "Rating change",
      notes: [
        "K = 24 sets the baseline size of a single-game adjustment",
        "MOV is margin of victory; (MOV+3)^0.8 rewards blowouts at a decreasing rate",
        "The 0.006 × rating gap term shrinks the gain when a strong team beats a weak one, keeping ratings from diverging",
        "Expected win probability comes from the pre-game gap, already including home court and back-to-back adjustments",
      ],
    },
    s4: {
      title: "From ratings to predictions",
      text: "A prediction starts from the effective rating gap for that specific game, then converts it into three outputs.",
      steps: [
        { label: "Effective rating gap", desc: "Home rating + 55 (home court) − away rating; subtract another 25 from either side playing the second night of a back-to-back." },
        { label: "Win probability", desc: "The standard Elo formula: 1 / (1 + 10^(−gap/400)), clamped to between 3% and 97%." },
        { label: "Spread", desc: "Gap ÷ 22. Roughly 22 Elo points equal one point of margin, which makes the 55-point home edge worth about 2.5 points." },
        { label: "Total", desc: "Estimated from both teams' points scored and allowed per game. Early in a season the sample is thin, so it regresses toward the league average of 114 with a 20-game prior." },
        { label: "Confidence", desc: "Simply the probability assigned to the side the model picked: max(home, away). An even game reads just over 50% rather than being dressed up." },
      ],
    },
    s5: {
      title: "Market calibration",
      p1: "A bookmaker's opening line is among the strongest forecasts available. When odds are present the model is blended 50/50 with the market across win probability, spread and total. The vig is removed first by normalising the two sides to sum to one, and quotes are averaged across books.",
      p2: "Without odds the model stands alone — which is the normal case, since the free quota only stretches to one fetch every 6 hours. Each prediction carries a model_version field: a +market suffix means the line was blended in, plain model means pure model output.",
    },
    s6: {
      title: "Backtest results",
      method:
        "These come from a walk-forward backtest: games are predicted in chronological order, and each result is folded into the ratings only after its prediction was recorded. Every prediction therefore used only information that existed before tip-off. The first 150 games are a warm-up in which every team still sits near 1500 and predictions carry no information, so they are excluded.",
      metrics: "Metric",
      value: "Value",
      meaning: "What it means",
      rows: [
        ["Winner accuracy", `${BACKTEST.winner_accuracy}%`, `Picked the winner in ${BACKTEST.correct_winners} of ${BACKTEST.games_evaluated} games. For reference, always picking the home team is about 57%.`],
        ["Brier score", `${BACKTEST.brier_score}`, "Mean squared error of the probabilities. 0.25 is what saying 50% every game would score; lower means the probabilities carry information."],
        ["Avg spread error", `${BACKTEST.spread_mae} pts`, "Mean absolute difference between predicted and actual margin. NBA margins are noisy, so this magnitude is normal."],
        ["Avg total error", `${BACKTEST.total_mae} pts`, "Mean absolute difference between predicted and actual combined score. This is the model's weakest output — see the next section."],
        ["Total within ±10", `${BACKTEST.total_accuracy}%`, "Share of games where the predicted total landed within 10 points of the actual total."],
      ],
      caveat:
        "This is one backtest over one season, 1,172 games. The standard error on the winner accuracy is about 1.4 percentage points, so 67.8% should be read as \"roughly 65–70%\", not as a precise figure. Run it on a different season and the number moves.",
    },
    s7: {
      title: "Limitations",
      text: "These are the known weaknesses, stated plainly:",
      limits: [
        { t: "Blind to injuries", d: "The model has no idea who is not playing. With a star out it still predicts at full strength, and those games can be badly wrong." },
        { t: "Weak on totals", d: `An average error of ${BACKTEST.total_mae} points is only slightly better than quoting the league average. Points per game conflates pace and efficiency, and separating them needs data this model does not have.` },
        { t: "Unreliable early", d: "For the first few weeks ratings mostly reflect last season's legacy, with no account of roster changes or rookie development. Discount the first 10–15 games accordingly." },
        { t: "Does not beat the spread", d: "Against-the-spread accuracy is 52.9%, which is not a positive edge after the vig. This is not a tool for making money." },
        { t: "No player modelling", d: "No minutes, no injury reports, no player efficiency. Only team-level results and scoring." },
      ],
    },
    disclaimerTitle: "Disclaimer",
    disclaimerText:
      "Everything above is for reference only and is not betting or investment advice. The model is wrong regularly, and backtest performance does not predict future results.",
    seeHistory: "See accuracy accumulating live",
    footerPrefix: "Model version",
    footerBacktest: "Backtest range",
    footerGenerated: "Generated",
  },
};

const ELO_FORMULA = "Δ = K × ((MOV + 3)^0.8 ÷ (7.5 + 0.006 × 评分差)) × (实际结果 − 预期胜率)";
const ELO_FORMULA_EN = "Δ = K × ((MOV + 3)^0.8 ÷ (7.5 + 0.006 × ratingGap)) × (actual − expected)";

function SectionHeading({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-black flex items-center gap-3">
      <span className="w-8 h-8 shrink-0 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
        {n}
      </span>
      {children}
    </h2>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6 space-y-4">{children}</div>
  );
}

export default function WhitepaperPage() {
  const { locale } = useLocale();
  const t = content[locale];

  return (
    <div className="pt-8 pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">{t.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">
            {t.title}
            <span className="block text-primary mt-2">{t.subtitle}</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">{t.description}</p>
        </div>

        <div className="bg-[#0f141a] border border-white/5 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">{t.toc}</h2>
          <nav className="space-y-2 text-slate-400">
            {t.tocItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="block hover:text-primary transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="space-y-12">
          {/* 1 */}
          <section id="overview" className="space-y-4">
            <SectionHeading n={1}>{t.s1.title}</SectionHeading>
            <Card>
              <p className="text-slate-300 leading-relaxed">{t.s1.p1}</p>
              <p className="text-slate-400 leading-relaxed">{t.s1.p2}</p>
              <div className="grid md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                  <div className="text-3xl font-black text-primary">{BACKTEST.winner_accuracy}%</div>
                  <div className="text-sm text-slate-400 mt-1">{t.s1.stat1}</div>
                </div>
                <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                  <div className="text-3xl font-black text-blue-400">
                    {BACKTEST.games_evaluated.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{t.s1.stat2}</div>
                </div>
                <div className="p-4 bg-[#1b2028] rounded-lg text-center">
                  <div className="text-2xl font-black text-green-400 break-all">
                    {BACKTEST.model_version}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{t.s1.stat3}</div>
                </div>
              </div>
            </Card>
          </section>

          {/* 2 */}
          <section id="data" className="space-y-4">
            <SectionHeading n={2}>{t.s2.title}</SectionHeading>
            <Card>
              <p className="text-slate-300 leading-relaxed">{t.s2.text}</p>
              <div className="space-y-3">
                {t.s2.sources.map((source, i) => (
                  <div key={source.name} className="flex items-start gap-3 p-3 bg-[#1b2028] rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        i === 0 ? "bg-primary" : i === 1 ? "bg-blue-400" : "bg-green-400"
                      }`}
                    />
                    <div>
                      <h4 className="font-bold">{source.name}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{source.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* 3 */}
          <section id="elo" className="space-y-4">
            <SectionHeading n={3}>{t.s3.title}</SectionHeading>
            <Card>
              <p className="text-slate-300 leading-relaxed">{t.s3.text}</p>
              <div className="bg-[#1b2028] rounded-lg p-4 overflow-x-auto">
                <div className="text-xs text-slate-500 mb-2">{t.s3.formulaLabel}</div>
                <code className="text-sm text-primary whitespace-nowrap">
                  {locale === "zh" ? ELO_FORMULA : ELO_FORMULA_EN}
                </code>
              </div>
              <ul className="space-y-2 text-slate-400 text-sm">
                {t.s3.notes.map((note) => (
                  <li key={note} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* 4 */}
          <section id="predict" className="space-y-4">
            <SectionHeading n={4}>{t.s4.title}</SectionHeading>
            <Card>
              <p className="text-slate-300 leading-relaxed">{t.s4.text}</p>
              <div className="space-y-3">
                {t.s4.steps.map((step) => (
                  <div key={step.label} className="p-4 bg-[#1b2028] rounded-lg">
                    <h4 className="font-bold text-slate-200 mb-1">{step.label}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* 5 */}
          <section id="market" className="space-y-4">
            <SectionHeading n={5}>{t.s5.title}</SectionHeading>
            <Card>
              <p className="text-slate-300 leading-relaxed">{t.s5.p1}</p>
              <p className="text-slate-400 leading-relaxed">{t.s5.p2}</p>
            </Card>
          </section>

          {/* 6 */}
          <section id="accuracy" className="space-y-4">
            <SectionHeading n={6}>{t.s6.title}</SectionHeading>
            <Card>
              <p className="text-slate-300 leading-relaxed">{t.s6.method}</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 uppercase border-b border-white/5">
                      <th className="py-3 pr-4">{t.s6.metrics}</th>
                      <th className="py-3 pr-4">{t.s6.value}</th>
                      <th className="py-3">{t.s6.meaning}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.s6.rows.map(([metric, value, meaning]) => (
                      <tr key={metric} className="border-b border-white/5 last:border-0 align-top">
                        <td className="py-3 pr-4 font-bold text-slate-200 whitespace-nowrap">{metric}</td>
                        <td className="py-3 pr-4 font-black text-primary whitespace-nowrap">{value}</td>
                        <td className="py-3 text-slate-400 leading-relaxed">{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-yellow-500/40 pl-4">
                {t.s6.caveat}
              </p>
              <Link href="/history" className="inline-block text-primary hover:underline text-sm">
                {t.seeHistory} →
              </Link>
            </Card>
          </section>

          {/* 7 */}
          <section id="limits" className="space-y-4">
            <SectionHeading n={7}>{t.s7.title}</SectionHeading>
            <Card>
              <p className="text-slate-300 leading-relaxed">{t.s7.text}</p>
              <div className="space-y-3">
                {t.s7.limits.map((limit) => (
                  <div key={limit.t} className="p-4 bg-[#1b2028] rounded-lg">
                    <h4 className="font-bold text-slate-200 mb-1">{limit.t}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{limit.d}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>

        <section className="bg-[#0f141a] border border-yellow-500/20 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-yellow-500 mb-3">{t.disclaimerTitle}</h3>
          <p className="text-slate-400 leading-relaxed">{t.disclaimerText}</p>
        </section>

        <p className="text-xs text-slate-600 text-center">
          {t.footerPrefix}: {BACKTEST.model_version} · {t.footerBacktest}: {BACKTEST.range.start} –{" "}
          {BACKTEST.range.end} · {t.footerGenerated}: {BACKTEST.generated_at.slice(0, 10)}
        </p>
      </div>
    </div>
  );
}
