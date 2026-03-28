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

        {/* Right side - Mobile menu */}
        <div className="md:hidden">
          <button className="text-slate-400 hover:text-primary transition-all duration-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
