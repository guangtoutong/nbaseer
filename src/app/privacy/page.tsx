"use client";

import { DocPage, Section } from "@/components/DocPage";
import { useLocale } from "@/lib/LocaleContext";
import { CONTACT_EMAIL } from "@/lib/site";

const content = {
  zh: {
    title: "隐私政策",
    intro: "这一页说明 nbaseer 收集什么、不收集什么。",
    updated: "最后更新：2026 年 9 月",
    s1: "我们不收集的内容",
    s1a: "nbaseer 没有账号系统。我们不要求也不存储你的姓名、邮箱、手机号或任何身份信息。站内没有注册、没有登录、没有用户画像。",
    s2: "浏览器本地存储",
    s2a: "站点会在你的浏览器 localStorage 里保存两项设置：语言偏好，以及顶部推荐栏是否被关闭。这些数据只留在你的设备上，不会发送到服务器，清除浏览器数据即可删除。",
    s3: "广告",
    s3a: "本站展示 Google AdSense 广告。Google 及其合作伙伴可能使用 Cookie 或设备标识符来投放和衡量广告效果，这部分数据由 Google 收集与处理，不经过 nbaseer 的服务器。",
    s3b: "你可以在 Google 广告设置中管理个性化广告偏好：",
    s4: "服务器日志",
    s4a: "站点托管在 Cloudflare Pages 上。与任何网站一样，Cloudflare 会记录常规的访问日志（IP 地址、User-Agent、请求路径）用于安全防护和流量统计。这些日志由 Cloudflare 按其隐私政策管理。",
    s5: "第三方数据接口",
    s5a: "赛程与比分来自 ESPN，赔率来自 The Odds API。这些请求由服务端发起，不会携带你的任何信息。",
    s6: "儿童",
    s6a: "本站不面向 13 岁以下人群，也不会有意收集其信息。",
    s7: "联系方式",
    s7a: "隐私相关问题请联系",
  },
  en: {
    title: "Privacy Policy",
    intro: "What nbaseer collects, and what it doesn't.",
    updated: "Last updated: September 2026",
    s1: "What we don't collect",
    s1a: "nbaseer has no accounts. We do not ask for or store your name, email, phone number or any identifying information. There is no sign-up, no login, and no user profiling.",
    s2: "Browser storage",
    s2a: "Two settings are kept in your browser's localStorage: your language preference, and whether you dismissed the recommendations bar. They stay on your device, are never sent to a server, and clearing your browser data removes them.",
    s3: "Advertising",
    s3a: "This site shows Google AdSense ads. Google and its partners may use cookies or device identifiers to serve and measure ads. That data is collected and processed by Google, not by nbaseer's servers.",
    s3b: "You can manage personalised advertising in Google's ad settings:",
    s4: "Server logs",
    s4a: "The site is hosted on Cloudflare Pages. As with any website, Cloudflare records standard access logs (IP address, user agent, request path) for security and traffic analysis, handled under Cloudflare's own privacy policy.",
    s5: "Third-party data APIs",
    s5a: "Schedules and scores come from ESPN; odds come from The Odds API. Those requests are made server-side and carry none of your information.",
    s6: "Children",
    s6a: "This site is not directed at children under 13 and does not knowingly collect their information.",
    s7: "Contact",
    s7a: "Privacy questions go to",
  },
};

export default function PrivacyPage() {
  const { locale } = useLocale();
  const t = content[locale];

  return (
    <DocPage title={t.title} intro={t.intro} updated={t.updated}>
      <Section heading={t.s1}><p>{t.s1a}</p></Section>
      <Section heading={t.s2}><p>{t.s2a}</p></Section>
      <Section heading={t.s3}>
        <p>{t.s3a}</p>
        <p>
          {t.s3b}{" "}
          <a
            href="https://adssettings.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            adssettings.google.com
          </a>
        </p>
      </Section>
      <Section heading={t.s4}><p>{t.s4a}</p></Section>
      <Section heading={t.s5}><p>{t.s5a}</p></Section>
      <Section heading={t.s6}><p>{t.s6a}</p></Section>
      <Section heading={t.s7}>
        <p>
          {t.s7a}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>
    </DocPage>
  );
}
