import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/services/session";

export const metadata: Metadata = {
  title: "สมัครเป็นผู้ช่วยร่วมเดินทาง",
  description: "ใช้เวลาว่างพาผู้สูงอายุไปทำธุระ กำหนดพื้นที่ เวลา และอัตราค่าบริการได้เอง",
};

const perks = [
  { title: "กำหนดเองได้ทั้งหมด", body: "เลือกเขตที่สะดวก ช่วงเวลาที่ว่าง และอัตราค่าบริการต่อชั่วโมง" },
  { title: "เลือกรับงานได้", body: "ดูรายละเอียดธุระก่อนตอบรับ หรือกดรับคำขอเปิดในพื้นที่ของคุณ" },
  { title: "รับค่าบริการโดยตรง", body: "ผู้ใช้บริการชำระกับคุณหลังจบงาน ระบบไม่หักค่าธรรมเนียม" },
];

const requirements = [
  "อายุ 18 ปีขึ้นไป และมีบัญชี Google",
  "เอกสารยืนยันตัวตน เช่น บัตรประชาชน (ภาพถ่ายหรือ PDF ไม่เกิน 5 MB)",
  "ใจเย็น สุภาพ และพร้อมช่วยเหลือผู้สูงอายุ",
  "เข้าใจว่างานนี้ไม่ใช่งานพยาบาล ไม่จ่ายยาหรือทำหัตถการทางการแพทย์",
];

export default async function BecomeCompanionPage() {
  const profile = await getCurrentProfile();
  const cta =
    !profile ? (
      <ButtonLink href="/login?next=/companion/profile" size="lg">
        เข้าสู่ระบบเพื่อสมัคร
      </ButtonLink>
    ) : profile.role === null ? (
      <ButtonLink href="/onboarding" size="lg">
        เลือก “ผู้ช่วยร่วมเดินทาง”
      </ButtonLink>
    ) : profile.role === "companion" ? (
      <ButtonLink href="/companion/profile" size="lg">
        ไปที่โปรไฟล์ผู้ช่วย
      </ButtonLink>
    ) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <header className="animate-rise max-w-2xl">
        <h1 className="text-3xl text-sumi md:text-4xl">สมัครเป็นผู้ช่วยร่วมเดินทาง</h1>
        <p className="mt-3 text-lg text-sumi-soft">
          พาผู้สูงอายุและผู้ที่ไปคนเดียวไม่สะดวกไปหาหมอ ไปธนาคาร หรือทำธุระนอกบ้านอย่างปลอดภัย
        </p>
        <div className="mt-6">{cta}</div>
        {profile?.role === "customer" && (
          <p className="mt-6 rounded-control bg-yamabuki-bg px-4 py-3 text-yamabuki">
            บัญชีนี้เป็นบัญชีผู้ใช้บริการ หากต้องการเป็นผู้ช่วย กรุณาเข้าสู่ระบบด้วยบัญชี Google อีกบัญชีหนึ่ง
          </p>
        )}
      </header>

      <section aria-label="ข้อดี" className="mt-14 grid gap-8 md:grid-cols-3">
        {perks.map((perk) => (
          <div key={perk.title} className="border-t-2 border-sora-200 pt-5">
            <h2 className="text-lg text-sumi">{perk.title}</h2>
            <p className="mt-2 text-sumi-soft">{perk.body}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="req-heading" className="mt-14 rounded-card bg-sakura-50 p-6 md:p-8">
        <h2 id="req-heading" className="text-2xl text-sumi">
          คุณสมบัติและสิ่งที่ต้องเตรียม
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sumi-soft">
          {requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-sumi-soft">
          เอกสารยืนยันตัวตนเก็บแบบส่วนตัว เห็นได้เฉพาะคุณและผู้ดูแลระบบเท่านั้น
        </p>
      </section>
    </div>
  );
}
