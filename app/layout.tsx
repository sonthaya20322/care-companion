import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Care Companion | ผู้ช่วยร่วมเดินทาง",
    template: "%s | Care Companion",
  },
  description:
    "หาผู้ช่วยร่วมเดินทางพาไปหาหมอ ธนาคาร ติดต่อราชการ หรือทำธุระนอกบ้าน สำหรับผู้สูงอายุและผู้ที่เดินทางคนเดียวไม่สะดวก",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-washi-surface focus:px-4 focus:py-3 focus:shadow-lift"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <SiteHeader />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
