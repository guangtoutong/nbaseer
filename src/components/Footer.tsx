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
  },
  en: {
    copyright: "AI-Powered NBA Prediction",
    syncTime: "Data synced at",
    terms: "Terms",
    privacy: "Privacy",
    apiDocs: "API Docs",
    support: "Support",
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
