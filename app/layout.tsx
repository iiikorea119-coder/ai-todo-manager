import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 기본 메타데이터
  title: {
    default: "AI 할 일 관리 서비스",
    template: "%s | AI 할 일 관리",
  },
  description: "AI가 도와주는 똑똑한 할 일 관리 서비스",
  keywords: [
    "할 일 관리",
    "todo",
    "AI",
    "생산성",
    "업무 관리",
    "일정 관리",
    "할일 앱",
    "스마트 플래너",
  ],
  authors: [{ name: "AI Todo Manager Team" }],
  creator: "AI Todo Manager",
  publisher: "AI Todo Manager",
  
  // robots 설정 (검색 엔진)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph (Facebook, LinkedIn 등)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://your-domain.com",
    siteName: "AI 할 일 관리 서비스",
    title: "AI 할 일 관리 서비스",
    description: "AI가 도와주는 똑똑한 할 일 관리 서비스",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI 할 일 관리 서비스",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "AI 할 일 관리 서비스",
    description: "AI가 도와주는 똑똑한 할 일 관리 서비스",
    images: ["/og-image.png"],
    creator: "@your_twitter_handle",
  },

  // 아이콘 설정
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // 추가 메타데이터
  metadataBase: new URL("https://your-domain.com"),
  alternates: {
    canonical: "/",
  },
  
  // 앱 관련 메타데이터
  applicationName: "AI 할 일 관리",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI 할 일 관리",
  },
  
  // 포맷 감지
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
