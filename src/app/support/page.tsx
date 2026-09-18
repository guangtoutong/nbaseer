"use client";

import Link from "next/link";
import { DocPage, Section } from "@/components/DocPage";
import { useLocale } from "@/lib/LocaleContext";

const content = {
  zh: {
    title: "支持",
    intro: "遇到问题、发现错误，或者想说模型哪里不对——都欢迎。",
    s1: "联系",
    s1a: "邮件是最快的方式：",
    s1b: "报告数据问题时，附上比赛日期和对阵双方会很有帮助。",
    s2: "常见问题",
    q1: "比分为什么没更新？",
    a1: "数据每 10 分钟从 ESPN 同步一次，比赛进行中可能有最多 10 分钟延迟。页面底部显示的是最近一次同步时间——如果那个时间明显偏旧，说明同步出了问题，请告诉我们。",
    q2: "为什么有些比赛没有预测？",
    a2: "预测在比赛进入赛程后生成。刚公布的赛程可能需要等下一次同步（最多 30 分钟）才会出现预测。",
    q3: "预测准确率是怎么算的？",
    a3: "每场比赛的预测在开赛前写入数据库，赛后按最终比分结算，命中率是对全部已结算记录的直接聚合。没有事后调整，也没有挑选样本。",
    q4: "可以拿这个去投注吗？",
    a4: "不建议。模型给出的是概率，不是结果；它经常出错。站内所有内容仅供参考，不构成投注建议。",
    s3: "相关页面",
    l1: "预测方法与模型说明",
    l2: "历史准确率",
    l3: "API 文档",
  },
  en: {
    title: "Support",
    intro: "Problems, wrong data, or an argument with the model — all welcome.",
    s1: "Get in touch",
    s1a: "Email is fastest:",
    s1b: "When reporting a data problem, including the game date and the two teams helps a lot.",
    s2: "Common questions",
    q1: "Why hasn't the score updated?",
    a1: "Data syncs from ESPN every 10 minutes, so a live game can lag by up to that long. The footer shows the last sync time — if it looks stale, the sync is broken and we'd like to hear about it.",
    q2: "Why do some games have no prediction?",
    a2: "Predictions are generated once a game appears on the schedule. A newly announced fixture may wait until the next run (up to 30 minutes) before a prediction shows up.",
    q3: "How is accuracy calculated?",
    a3: "Each prediction is written to the database before tip-off and settled against the final score afterwards. The hit rate is a direct aggregate over every settled record — no retroactive adjustment, no cherry-picking.",
    q4: "Can I bet on this?",
    a4: "We'd advise against it. The model outputs probabilities, not outcomes, and it is wrong regularly. Everything here is for reference only and is not betting advice.",
    s3: "Related pages",
    l1: "Method and model notes",
    l2: "Historical accuracy",
    l3: "API documentation",
  },
};

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-[#0f141a] border border-white/5 rounded-xl p-5 space-y-2">
      <p className="font-bold text-slate-200">{q}</p>
      <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
    </div>
  );
}

export default function SupportPage() {
  const { locale } = useLocale();
  const t = content[locale];

  return (
    <DocPage title={t.title} intro={t.intro}>
      <Section heading={t.s1}>
        <p>
          {t.s1a}{" "}
          <a href="mailto:support@nbaseer.com" className="text-primary hover:underline">
            support@nbaseer.com
          </a>
        </p>
        <p>{t.s1b}</p>
      </Section>

      <Section heading={t.s2}>
        <div className="grid gap-3">
          <Faq q={t.q1} a={t.a1} />
          <Faq q={t.q2} a={t.a2} />
          <Faq q={t.q3} a={t.a3} />
          <Faq q={t.q4} a={t.a4} />
        </div>
      </Section>

      <Section heading={t.s3}>
        <ul className="space-y-2">
          <li><Link href="/whitepaper" className="text-primary hover:underline">{t.l1}</Link></li>
          <li><Link href="/history" className="text-primary hover:underline">{t.l2}</Link></li>
          <li><Link href="/api" className="text-primary hover:underline">{t.l3}</Link></li>
        </ul>
      </Section>
    </DocPage>
  );
}
