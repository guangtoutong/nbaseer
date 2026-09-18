"use client";

import { DocPage, Section } from "@/components/DocPage";
import { useLocale } from "@/lib/LocaleContext";

const content = {
  zh: {
    title: "API 文档",
    intro:
      "站点的数据接口是公开的、只读的，返回 JSON。没有鉴权，也没有密钥——请自觉控制请求频率。",
    s1: "基础地址",
    s2: "接口",
    s3: "字段说明",
    s4: "使用限制",
    s4a: "数据每 10 分钟更新一次，比这更频繁的轮询拿不到新内容。请保持在每分钟数次以内；滥用会被 Cloudflare 限流。",
    s4b: "引用数据时请注明来源为 nbaseer，并注意预测仅供参考、不构成投注建议。",
    params: "参数",
    returns: "返回",
    noParams: "无",
    example: "示例",
    fields: [
      ["home_win_prob / away_win_prob", "赛前胜率，0–1 之间，两者之和为 1"],
      ["predicted_spread", "预测分差，等于「客队得分 − 主队得分」，负数表示看好主队"],
      ["predicted_total", "预测总分，双方得分之和"],
      ["predicted_home_score / predicted_away_score", "由分差与总分推出的预测比分"],
      ["confidence", "模型对自己所选一方给出的概率，即 max(主队胜率, 客队胜率)"],
      ["model_version", "生成该预测的模型版本，带 +market 表示混入了博彩赔率"],
      ["status", "scheduled（未开始）/ live（进行中）/ final（已结束）/ postponed（延期）"],
      ["date", "比赛的 UTC 日期；time 在未开始时为 ISO 开赛时间，进行中为比赛时钟"],
    ],
    endpoints: [
      { path: "/api/today", desc: "今日相关比赛，按进行中 / 即将开始 / 已结束分组", params: "无" },
      { path: "/api/games", desc: "比赛列表", params: "date=YYYY-MM-DD、status=scheduled|live|final、limit（默认 50）" },
      { path: "/api/games/{id}", desc: "单场比赛详情，含预测与赔率", params: "无" },
      { path: "/api/predictions", desc: "预测列表", params: "game_id、limit、results=true" },
      { path: "/api/stats", desc: "预测准确率统计与近期记录", params: "无" },
      { path: "/api/teams", desc: "球队列表", params: "stats=true 附带赛季战绩" },
    ],
  },
  en: {
    title: "API Documentation",
    intro:
      "The data endpoints are public, read-only and return JSON. There is no auth and no key — please keep your request rate reasonable.",
    s1: "Base URL",
    s2: "Endpoints",
    s3: "Field reference",
    s4: "Usage limits",
    s4a: "Data refreshes every 10 minutes; polling faster than that returns nothing new. Stay within a few requests per minute — abuse gets rate-limited by Cloudflare.",
    s4b: "If you republish this data, credit nbaseer, and note that predictions are for reference only and are not betting advice.",
    params: "Params",
    returns: "Returns",
    noParams: "none",
    example: "Example",
    fields: [
      ["home_win_prob / away_win_prob", "Pre-game win probabilities, 0–1, summing to 1"],
      ["predicted_spread", "away_score − home_score; negative means the home team is favoured"],
      ["predicted_total", "Predicted combined score"],
      ["predicted_home_score / predicted_away_score", "Scoreline implied by the spread and total"],
      ["confidence", "Probability assigned to the side the model picked, i.e. max(home, away)"],
      ["model_version", "Model that produced the prediction; a +market suffix means bookmaker odds were blended in"],
      ["status", "scheduled | live | final | postponed"],
      ["date", "UTC date of the game. `time` is the ISO tip-off before the game and the game clock during it"],
    ],
    endpoints: [
      { path: "/api/today", desc: "Today's games grouped into live / scheduled / completed", params: "none" },
      { path: "/api/games", desc: "Game list", params: "date=YYYY-MM-DD, status=scheduled|live|final, limit (default 50)" },
      { path: "/api/games/{id}", desc: "One game with its prediction and odds", params: "none" },
      { path: "/api/predictions", desc: "Prediction list", params: "game_id, limit, results=true" },
      { path: "/api/stats", desc: "Accuracy aggregates and recent settled predictions", params: "none" },
      { path: "/api/teams", desc: "Team list", params: "stats=true to include season record" },
    ],
  },
};

export default function ApiDocsPage() {
  const { locale } = useLocale();
  const t = content[locale];

  return (
    <DocPage title={t.title} intro={t.intro}>
      <Section heading={t.s1}>
        <code className="block bg-[#0f141a] border border-white/5 rounded-lg px-4 py-3 text-primary text-sm overflow-x-auto">
          https://nbaseer.pages.dev
        </code>
      </Section>

      <Section heading={t.s2}>
        <div className="space-y-3">
          {t.endpoints.map((e) => (
            <div key={e.path} className="bg-[#0f141a] border border-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/15 text-green-400">
                  GET
                </span>
                <code className="text-primary text-sm break-all">{e.path}</code>
              </div>
              <p className="text-sm text-slate-400">{e.desc}</p>
              <p className="text-xs text-slate-500">
                <span className="uppercase tracking-wide">{t.params}:</span> {e.params}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section heading={t.s3}>
        <div className="bg-[#0f141a] border border-white/5 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <tbody>
              {t.fields.map(([name, desc]) => (
                <tr key={name} className="border-b border-white/5 last:border-0 align-top">
                  <td className="p-3 font-mono text-xs text-primary whitespace-nowrap">{name}</td>
                  <td className="p-3 text-slate-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section heading={t.s4}>
        <p>{t.s4a}</p>
        <p>{t.s4b}</p>
      </Section>
    </DocPage>
  );
}
