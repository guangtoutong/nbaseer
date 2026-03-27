import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-950 w-full py-12 px-8 mt-20 border-t border-slate-800/50">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo */}
        <div className="text-lg font-bold text-slate-200">nbaseer</div>

        {/* Copyright & Sync Time */}
        <p className="text-sm tracking-wide text-slate-500">
          © 2024 nbaseer. AI驱动的NBA赛事预测. 数据同步时间: {new Date().toLocaleString("zh-CN")}
        </p>

        {/* Links */}
        <div className="flex gap-8">
          <Link
            href="/terms"
            className="text-slate-500 hover:text-primary underline underline-offset-4 transition-all"
          >
            条款
          </Link>
          <Link
            href="/privacy"
            className="text-slate-500 hover:text-primary underline underline-offset-4 transition-all"
          >
            隐私
          </Link>
          <Link
            href="/api"
            className="text-slate-500 hover:text-primary underline underline-offset-4 transition-all"
          >
            API文档
          </Link>
          <Link
            href="/support"
            className="text-slate-500 hover:text-primary underline underline-offset-4 transition-all"
          >
            支持
          </Link>
        </div>
      </div>
    </footer>
  );
}
