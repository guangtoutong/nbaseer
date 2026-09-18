"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";

const content = {
  zh: {
    ads: [
      {
        name: "SoloMD",
        icon: "📝",
        tagline: "轻量级 Markdown 编辑器",
        description: "仅 15MB，实时预览、KaTeX 公式、Mermaid 图表、完全离线",
        url: "https://solomd.app",
      },
      {
        name: "StoryAlter",
        icon: "📖",
        tagline: "AI 网文创作平台",
        description: "支持 7 大 AI 模型，智能大纲、自动章节、AI 封面生成，免费使用",
        url: "https://storyalter.com",
      },
    ],
    close: "关闭",
  },
  en: {
    ads: [
      {
        name: "SoloMD",
        icon: "📝",
        tagline: "Lightweight Markdown Editor",
        description: "Only 15MB, live preview, KaTeX math, Mermaid diagrams, fully offline",
        url: "https://solomd.app",
      },
      {
        name: "StoryAlter",
        icon: "📖",
        tagline: "AI Writing Platform",
        description: "7 AI models supported, smart outlines, auto chapters, AI covers, free to use",
        url: "https://storyalter.com",
      },
    ],
    close: "Close",
  },
};

const DISMISS_KEY = "nbaseer.adbanner.dismissed";

export function AdBanner() {
  // Start hidden so the server-rendered markup matches the first client paint,
  // then reveal unless the visitor already dismissed it.
  const [isVisible, setIsVisible] = useState(false);
  const { locale } = useLocale();
  const t = content[locale];

  useEffect(() => {
    try {
      setIsVisible(localStorage.getItem(DISMISS_KEY) !== "1");
    } catch {
      setIsVisible(true);
    }
  }, []);

  function dismiss() {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private mode: dismissing for this page view is still better than nothing.
    }
  }

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Ads — one scrollable row so the banner height never grows enough to
              push the page content off screen on a phone. */}
          <div className="flex-1 flex flex-row items-center gap-3 sm:gap-6 overflow-x-auto">
            {t.ads.map((ad) => (
              <a
                key={ad.name}
                href={ad.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 hover:border-primary/30 rounded-lg transition-all min-w-fit"
              >
                <span className="text-2xl">{ad.icon}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 group-hover:text-primary transition-colors">
                      {ad.name}
                    </span>
                    <span className="hidden sm:inline text-xs text-slate-400">
                      {ad.tagline}
                    </span>
                  </div>
                  <span className="hidden lg:inline text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                    {ad.description}
                  </span>
                </div>
                <svg
                  className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={dismiss}
            className="flex-shrink-0 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded transition-all"
            title={t.close}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
