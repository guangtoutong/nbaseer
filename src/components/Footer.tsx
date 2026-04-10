"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLocale } from "@/lib/LocaleContext";

const content = {
  zh: {
    copyright: "AI驱动的NBA赛事预测",
    syncTime: "数据同步时间",
    terms: "条款",
    privacy: "隐私",
    apiDocs: "API文档",
    support: "支持",
    recommended: "推荐工具",
    solomdDesc: "轻量级 Markdown 编辑器",
    storyalterDesc: "AI 网文创作平台",
  },
  en: {
    copyright: "AI-Powered NBA Prediction",
    syncTime: "Data synced at",
    terms: "Terms",
    privacy: "Privacy",
    apiDocs: "API Docs",
    support: "Support",
    recommended: "Recommended",
    solomdDesc: "Lightweight Markdown Editor",
    storyalterDesc: "AI Writing Platform",
  },
};

export function Footer() {
  const { locale } = useLocale();
  const t = content[locale];
  const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString(dateLocale));
  }, [dateLocale]);

  return (
    <footer className="bg-slate-950 w-full py-12 px-8 mt-20 border-t border-slate-800/50">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo */}
        <div className="text-lg font-bold text-slate-200">nbaseer</div>

        {/* Copyright & Sync Time */}
        <p className="text-sm tracking-wide text-slate-500">
          © 2024 nbaseer. {t.copyright}. {t.syncTime}: {currentTime}
        </p>

        {/* Recommended */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">{t.recommended}:</span>
          <a
            href="https://solomd.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-full text-xs text-slate-400 hover:text-slate-200 transition-all"
          >
            <span>📝</span>
            <span>SoloMD</span>
            <span className="text-slate-600">- {t.solomdDesc}</span>
          </a>
          <a
            href="https://storyalter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-full text-xs text-slate-400 hover:text-slate-200 transition-all"
          >
            <span>📖</span>
            <span>StoryAlter</span>
            <span className="text-slate-600">- {t.storyalterDesc}</span>
          </a>
        </div>

        {/* Links */}
        <div className="flex gap-8">
          <Link
            href="/terms"
            className="text-slate-500 hover:text-primary underline underline-offset-4 transition-all"
          >
            {t.terms}
          </Link>
          <Link
            href="/privacy"
            className="text-slate-500 hover:text-primary underline underline-offset-4 transition-all"
          >
            {t.privacy}
          </Link>
          <Link
            href="/api"
            className="text-slate-500 hover:text-primary underline underline-offset-4 transition-all"
          >
            {t.apiDocs}
          </Link>
          <Link
            href="/support"
            className="text-slate-500 hover:text-primary underline underline-offset-4 transition-all"
          >
            {t.support}
          </Link>
        </div>
      </div>
    </footer>
  );
}
