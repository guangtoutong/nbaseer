"use client";

import { ReactNode } from "react";

/** Shared shell for the static text pages (terms, privacy, support, API docs). */
export function DocPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="pt-8 pb-16 px-4 md:px-8 max-w-3xl mx-auto space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-black">{title}</h1>
        {intro && <p className="text-slate-400 leading-relaxed">{intro}</p>}
        {updated && <p className="text-xs text-slate-600">{updated}</p>}
      </header>
      <div className="space-y-8">{children}</div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-slate-100">{heading}</h2>
      <div className="space-y-3 text-slate-400 leading-relaxed">{children}</div>
    </section>
  );
}
