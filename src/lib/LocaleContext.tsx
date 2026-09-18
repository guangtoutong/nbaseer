"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Locale } from "./i18n";

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const STORAGE_KEY = "nbaseer.locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Always start from the server-rendered default so hydration matches, then adopt
  // the visitor's stored choice.
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "zh" || stored === "en") {
        setLocaleState(stored);
        return;
      }
    } catch {
      // Storage unavailable — fall through to the browser's preference.
    }
    if (typeof navigator !== "undefined" && !navigator.language?.toLowerCase().startsWith("zh")) {
      setLocaleState("en");
    }
  }, []);

  // Keep the document language in step so screen readers and translation tools
  // are not told every page is Chinese.
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference just won't survive the session.
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
