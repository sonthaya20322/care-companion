import type { Metadata } from "next";
import { signOut } from "@/app/auth/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "บัญชีถูกระงับ" };

export default function SuspendedPage() {
  return (
    <section className="mx-auto w-full max-w-xl px-5 py-20">
      <h1 className="animate-rise text-3xl text-sumi">บัญชีนี้ถูกระงับการใช้งานชั่วคราว</h1>
      <p className="mt-4 text-sumi-soft">
        หากคิดว่าเกิดความผิดพลาด กรุณาติดต่อผู้ดูแลระบบที่{" "}
        <a href={`mailto:${site.contactEmail}`} className="text-sora-700 underline underline-offset-4">
          {site.contactEmail}
        </a>
      </p>
      <form action={signOut} className="mt-8">
        <SubmitButton variant="secondary">ออกจากระบบ</SubmitButton>
      </form>
    </section>
  );
}
