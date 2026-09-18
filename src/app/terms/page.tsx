"use client";

import { DocPage, Section } from "@/components/DocPage";
import { useLocale } from "@/lib/LocaleContext";

const content = {
  zh: {
    title: "使用条款",
    intro: "使用 nbaseer 即表示你同意以下条款。",
    updated: "最后更新：2026 年 9 月",
    s1: "服务内容",
    s1a: "nbaseer 提供 NBA 赛程、比分与基于统计模型的比赛预测。所有内容按「现状」提供，不保证准确、完整或持续可用。",
    s2: "预测免责声明",
    s2a: "站内的胜负概率、分差与总分均为统计模型的输出，不是建议、不是内幕信息，也不构成任何形式的投注或财务建议。模型会出错，且经常出错——历史命中率不代表未来表现。",
    s2b: "是否依据这些信息做任何决定，由你自己承担全部后果。若你所在地区禁止体育博彩，请遵守当地法律。",
    s3: "数据来源",
    s3a: "赛程与比分来自 ESPN 公开接口，博彩赔率（如有）来自 The Odds API。这些第三方数据可能延迟、中断或出错，nbaseer 不对其准确性负责。比赛的官方结果以 NBA 官方公布为准。",
    s4: "可接受的使用方式",
    s4a: "你可以正常浏览本站并合理引用其中数据。请勿进行高频抓取、绕过限流、或以任何方式干扰服务运行。",
    s5: "责任限制",
    s5a: "在法律允许的最大范围内，nbaseer 不对因使用或无法使用本服务而产生的任何直接或间接损失承担责任。",
    s6: "条款变更",
    s6a: "条款可能随时更新，更新后继续使用即视为接受。重大变更会在本页标注更新日期。",
    s7: "联系方式",
    s7a: "如有疑问，请联系",
  },
  en: {
    title: "Terms of Use",
    intro: "By using nbaseer you agree to the terms below.",
    updated: "Last updated: September 2026",
    s1: "What this service is",
    s1a: "nbaseer provides NBA schedules, scores and statistical model predictions. Everything is provided as-is, with no guarantee of accuracy, completeness or continued availability.",
    s2: "Prediction disclaimer",
    s2a: "Win probabilities, spreads and totals on this site are outputs of a statistical model. They are not advice, not inside information, and do not constitute betting or financial advice of any kind. The model is wrong regularly, and past accuracy does not predict future accuracy.",
    s2b: "Any decision you make based on this information is entirely your own responsibility. If sports betting is restricted where you live, follow your local law.",
    s3: "Data sources",
    s3a: "Schedules and scores come from ESPN's public API; bookmaker odds, where shown, come from The Odds API. Third-party data can be delayed, interrupted or wrong, and nbaseer is not responsible for its accuracy. Official results are whatever the NBA says they are.",
    s4: "Acceptable use",
    s4a: "Browse the site and cite its data reasonably. Do not scrape aggressively, circumvent rate limits, or otherwise interfere with the service.",
    s5: "Limitation of liability",
    s5a: "To the maximum extent permitted by law, nbaseer is not liable for any direct or indirect loss arising from use of, or inability to use, this service.",
    s6: "Changes",
    s6a: "These terms may change. Continued use after a change means you accept it; material changes are reflected in the date above.",
    s7: "Contact",
    s7a: "Questions go to",
  },
};

export default function TermsPage() {
  const { locale } = useLocale();
  const t = content[locale];

  return (
    <DocPage title={t.title} intro={t.intro} updated={t.updated}>
      <Section heading={t.s1}><p>{t.s1a}</p></Section>
      <Section heading={t.s2}>
        <p className="text-slate-300">{t.s2a}</p>
        <p>{t.s2b}</p>
      </Section>
      <Section heading={t.s3}><p>{t.s3a}</p></Section>
      <Section heading={t.s4}><p>{t.s4a}</p></Section>
      <Section heading={t.s5}><p>{t.s5a}</p></Section>
      <Section heading={t.s6}><p>{t.s6a}</p></Section>
      <Section heading={t.s7}>
        <p>
          {t.s7a}{" "}
          <a href="mailto:support@nbaseer.com" className="text-primary hover:underline">
            support@nbaseer.com
          </a>
        </p>
      </Section>
    </DocPage>
  );
}
