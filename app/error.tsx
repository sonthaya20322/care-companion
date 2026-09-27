"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("Route error", { digest: error.digest });
  }, [error]);

  return (
    <section className="mx-auto w-full max-w-xl px-5 py-20">
      <h1 className="text-3xl text-sumi">ขออภัย เกิดข้อผิดพลาด</h1>
      <p className="mt-4 text-sumi-soft">
        ระบบไม่สามารถแสดงหน้านี้ได้ในขณะนี้ ลองใหม่อีกครั้ง หรือกลับไปหน้าแรก
        {error.digest && <span className="mt-2 block text-sm">รหัสอ้างอิง: {error.digest}</span>}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>ลองใหม่</Button>
        <ButtonLink href="/" variant="secondary">
          กลับหน้าแรก
        </ButtonLink>
      </div>
    </section>
  );
}
