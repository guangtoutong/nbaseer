"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "预测" },
  { href: "/scores", label: "比分" },
  { href: "/history", label: "历史" },
  { href: "/about", label: "关于" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur-xl shadow-2xl shadow-black/50 border-b border-white/5">
      <div className="max-w-screen-2xl mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black italic tracking-tighter text-primary uppercase">
          nbaseer
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 uppercase tracking-tight">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium pb-1 transition-colors duration-300 ${
                  isActive
                    ? "text-primary border-b-2 border-primary font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side - Icons */}
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-primary transition-all duration-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="text-slate-400 hover:text-primary transition-all duration-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
