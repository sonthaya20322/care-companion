import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { homePathFor } from "@/lib/domain/roles";
import { getCurrentProfile } from "@/lib/services/session";
import { OnboardingForm } from "./OnboardingForm";

export const metadata: Metadata = {
  title: "ตั้งค่าบัญชี",
};

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/onboarding");
  if (profile.status === "suspended") redirect("/suspended");
  if (profile.role) redirect(homePathFor(profile.role));

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-14">
      <div className="animate-rise">
        <p className="text-sm font-medium text-sakura-700">ขั้นตอนสุดท้าย</p>
        <h1 className="mt-1 text-3xl text-sumi md:text-4xl">ยินดีต้อนรับ{profile.full_name ? ` คุณ${profile.full_name.split(" ")[0]}` : ""}</h1>
        <p className="mt-3 text-sumi-soft">บอกเราอีกนิดว่าจะใช้งานแบบไหน แล้วเริ่มได้เลย</p>
      </div>
      <div className="mt-10 animate-rise [animation-delay:120ms]">
        <OnboardingForm defaultName={profile.full_name} />
      </div>
    </section>
  );
}
