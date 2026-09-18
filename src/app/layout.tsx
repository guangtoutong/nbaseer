import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";

export const metadata: Metadata = {
  metadataBase: new URL('https://nbaseer.pages.dev'),
  title: {
    default: "NBAseer - AI NBA 预测引擎 | NBA比赛预测分析",
    template: "%s | NBAseer"
  },
  description: "NBAseer是领先的AI驱动NBA比赛预测平台，提供精准的胜负概率、分差预测、大小分分析。实时赔率对比，专业数据支持，助您洞察NBA赛事。",
  keywords: ["NBA预测", "NBA比分预测", "NBA胜负预测", "NBA让分", "NBA大小分", "篮球预测", "AI预测", "NBA赔率", "NBA分析", "NBA数据"],
  authors: [{ name: "NBAseer" }],
  creator: "NBAseer",
  publisher: "NBAseer",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://nbaseer.pages.dev',
    siteName: 'NBAseer',
    title: 'NBAseer - AI NBA 预测引擎',
    description: 'AI驱动的NBA比赛预测系统，提供精准的胜负概率、分差预测和大小分分析',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NBAseer - AI NBA 预测引擎',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NBAseer - AI NBA 预测引擎',
    description: 'AI驱动的NBA比赛预测系统，提供精准的胜负概率、分差预测和大小分分析',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://nbaseer.pages.dev',
  },
  // Add `verification: { google: '<code>' }` here once Search Console issues one.
  // A placeholder string was previously emitted as a real meta tag.
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "NBAseer",
              "alternateName": "NBA预测引擎",
              "url": "https://nbaseer.pages.dev",
              "description": "AI驱动的NBA比赛预测系统，提供精准的胜负概率、分差预测和大小分分析",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://nbaseer.pages.dev/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "NBAseer",
              "url": "https://nbaseer.pages.dev",
              "logo": "https://nbaseer.pages.dev/logo.png",
              "sameAs": []
            })
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <LocaleProvider>
          <Navbar />
          {/* The navbar is fixed; this reserves its height so everything below can
              live in normal flow. The ad banner used to be fixed too and overlapped
              the top of every page on narrow screens. */}
          <div className="h-20 shrink-0" aria-hidden />
          <AdBanner />
          <main className="flex-1">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
