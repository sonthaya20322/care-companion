"use client";

import Link from "next/link";
import { fontVariables } from "./fonts";
import "./globals.css";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="th" className={fontVariables}>
      <body className="flex min-h-screen items-center justify-center bg-washi px-5">
        <main className="max-w-lg">
          <h1 className="text-3xl text-sumi">ขออภัย ระบบขัดข้อง</h1>
          <p className="mt-4 text-sumi-soft">
            กรุณาลองใหม่อีกครั้งในอีกสักครู่
            {error.digest && <span className="mt-2 block text-sm">รหัสอ้างอิง: {error.digest}</span>}
          </p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="min-h-12 rounded-control bg-sakura-600 px-5 font-medium text-white hover:bg-sakura-700"
            >
              ลองใหม่
            </button>
            <Link href="/" className="flex min-h-12 items-center rounded-control px-5 text-sora-700 hover:bg-sora-50">
              กลับหน้าแรก
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
