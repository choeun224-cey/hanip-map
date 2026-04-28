import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { DialogProvider } from "@/lib/dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "한입지도 | 우리만의 맛집 지도",
  description: "둘이서 모은 맛집을 지도에 기록하고, 다음 한 입을 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full`}>
      <body className="h-full font-sans">
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
