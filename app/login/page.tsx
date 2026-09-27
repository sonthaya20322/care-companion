import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/app/auth/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { safeNextPath } from "@/lib/domain/access";
import { homePathFor } from "@/lib/domain/roles";
import { getCurrentProfile } from "@/lib/services/session";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
};

const errorText: Record<string, string> = {
  oauth: "เชื่อมต่อ Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  callback: "เข้าสู่ระบบไม่สำเร็จ ลิงก์อาจหมดอายุ กรุณากดเข้าสู่ระบบใหม่",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null, "");
  const error = typeof params.error === "string" ? errorText[params.error] : undefined;

  const profile = await getCurrentProfile();
  if (profile) redirect(profile.role && next ? next : homePathFor(profile.role));

  return (
    <section className="relative flex flex-1 items-center overflow-hidden px-5 py-16">
      <div
        aria-hidden
        className="bg-seigaiha absolute inset-x-0 bottom-0 h-48 opacity-60 [mask-image:linear-gradient(to_top,black,transparent)]"
      />
      <div className="relative mx-auto w-full max-w-md animate-rise rounded-card bg-washi-surface p-8 shadow-soft ring-1 ring-washi-line sm:p-10">
        <h1 className="text-3xl text-sumi">เข้าสู่ระบบ</h1>
        <p className="mt-3 text-sumi-soft">
          ใช้บัญชี Google ที่มีอยู่แล้ว ไม่ต้องตั้งรหัสผ่านใหม่ ครั้งแรกจะให้เลือกว่าเป็นผู้ใช้บริการหรือผู้ช่วย
        </p>

        {error && (
          <p role="alert" className="mt-6 rounded-control bg-beni-bg px-4 py-3 font-medium text-beni">
            {error}
          </p>
        )}

        <form action={signInWithGoogle} className="mt-8">
          <input type="hidden" name="next" value={next} />
          <SubmitButton size="lg" variant="secondary" className="w-full" pendingLabel="กำลังไปที่ Google...">
            <GoogleMark />
            เข้าสู่ระบบด้วย Google
          </SubmitButton>
        </form>

        <p className="mt-6 text-sm text-sumi-soft">
          เมื่อเข้าสู่ระบบ ถือว่าคุณยอมรับ{" "}
          <Link href="/terms" className="text-sora-700 underline underline-offset-4">
            ข้อตกลงการใช้งาน
          </Link>{" "}
          และ{" "}
          <Link href="/privacy" className="text-sora-700 underline underline-offset-4">
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>
      </div>
    </section>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
