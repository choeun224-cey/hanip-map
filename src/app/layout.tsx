import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { DialogProvider } from "@/lib/dialog";
import { AuthProvider } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://hanip-map.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "한입지도 | 우리만의 맛집 지도",
  description: "둘이서 모은 맛집을 지도에 기록하고, 다음 한 입을 찾아보세요.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "한입지도",
    title: "한입지도 | 우리만의 맛집 지도",
    description: "둘이서 모은 맛집을 지도에 기록하고, 다음 한 입을 찾아보세요.",
  },
  twitter: {
    card: "summary_large_image",
    title: "한입지도 | 우리만의 맛집 지도",
    description: "둘이서 모은 맛집을 지도에 기록하고, 다음 한 입을 찾아보세요.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full`}>
      <body className="h-full font-sans">
        <AuthProvider>
          <DialogProvider>{children}</DialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
