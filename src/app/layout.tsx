import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "NBAseer - AI NBA 预测引擎",
  description: "AI驱动的NBA比赛预测系统，提供胜负概率、分差预测和大小分分析",
  keywords: ["NBA", "预测", "AI", "篮球", "比分预测"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7786364053868586"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <LocaleProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
