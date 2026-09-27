import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { bookingRules, bookingStatusMeta, type BookingStatus } from "@/lib/domain/booking";

export const metadata: Metadata = {
  title: "วิธีใช้บริการ",
  description: "ขั้นตอนการจองผู้ช่วยร่วมเดินทาง สถานะนัดหมาย และกติกาการใช้บริการ",
};

const customerSteps = [
  {
    title: "เข้าสู่ระบบด้วย Google",
    body: "ครั้งแรกเลือกว่าเป็น “ผู้ใช้บริการ” แล้วกรอกชื่อและเบอร์โทรศัพท์",
  },
  {
    title: "เลือกวิธีจอง",
    body: "เลือกผู้ช่วยที่ถูกใจจากหน้าค้นหา หรือโพสต์คำขอให้ผู้ช่วยทุกคนในพื้นที่เห็นแล้วกดรับ",
  },
  {
    title: "กรอกรายละเอียดธุระ",
    body: "ประเภทธุระ วันเวลา ระยะเวลา จุดรับ จุดหมาย และสิ่งที่ผู้ช่วยควรรู้ เช่น ใช้รถเข็น",
  },
  {
    title: "รอผู้ช่วยตอบรับ",
    body: "เมื่อตอบรับแล้ว ผู้ช่วยจึงเห็นเบอร์โทรและที่อยู่จุดรับ ติดตามสถานะได้ในหน้า “นัดหมายของฉัน”",
  },
  {
    title: "ไปทำธุระ จบงาน และรีวิว",
    body: "ชำระค่าบริการกับผู้ช่วยโดยตรงตามราคาประเมิน แล้วให้คะแนนเพื่อช่วยผู้ใช้คนถัดไป",
  },
];

const companionSteps = [
  "เข้าสู่ระบบด้วย Google แล้วเลือก “ผู้ช่วยร่วมเดินทาง”",
  "กรอกโปรไฟล์ ประสบการณ์ อัตราค่าบริการ พื้นที่ และช่วงเวลาที่สะดวก",
  "อัปโหลดเอกสารยืนยันตัวตน แล้วส่งให้ผู้ดูแลระบบตรวจสอบ",
  "เมื่อได้รับอนุมัติ โปรไฟล์จะแสดงในหน้าค้นหา และเริ่มรับคำขอได้",
];

const flow: BookingStatus[] = ["requested", "accepted", "in_progress", "completed"];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <header className="animate-rise max-w-2xl">
        <h1 className="text-3xl text-sumi md:text-4xl">วิธีใช้บริการ</h1>
        <p className="mt-3 text-sumi-soft">
          Care Companion ช่วยหาผู้ช่วยพาไปทำธุระนอกบ้าน ผู้ช่วยไม่ใช่บุคลากรทางการแพทย์
          และไม่ให้บริการพยาบาลหรือจ่ายยา
        </p>
      </header>

      <section aria-labelledby="customer-heading" className="mt-12">
        <h2 id="customer-heading" className="text-2xl text-sumi">
          สำหรับผู้ใช้บริการ
        </h2>
        <ol className="mt-6 flex flex-col gap-6 border-l-2 border-dashed border-sakura-200 pl-6">
          {customerSteps.map((step, index) => (
            <li key={step.title} className="relative">
              <span
                aria-hidden
                className="absolute -left-[2.35rem] top-0 flex size-8 items-center justify-center rounded-full bg-washi-surface font-brand font-bold text-sakura-700 ring-2 ring-sakura-300"
              >
                {index + 1}
              </span>
              <h3 className="text-lg text-sumi">{step.title}</h3>
              <p className="mt-1 text-sumi-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="status-heading" className="mt-14 rounded-card bg-sora-50 p-6 md:p-8">
        <h2 id="status-heading" className="text-2xl text-sumi">
          สถานะนัดหมาย
        </h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((status) => (
            <li key={status} className="flex flex-col items-start gap-2">
              <StatusStamp tone={bookingStatusMeta[status].tone} label={bookingStatusMeta[status].label} />
              <p className="text-sm text-sumi-soft">{bookingStatusMeta[status].description}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm text-sumi-soft">
          นัดหมายอาจเป็น “{bookingStatusMeta.rejected.label}” “{bookingStatusMeta.cancelled.label}” หรือ “
          {bookingStatusMeta.expired.label}” หากไม่มีผู้ช่วยตอบรับภายใน {bookingRules.requestDeadlineHours} ชั่วโมงก่อนเวลานัด
        </p>
      </section>

      <section aria-labelledby="rules-heading" className="mt-14">
        <h2 id="rules-heading" className="text-2xl text-sumi">
          กติกาสำคัญ
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sumi-soft">
          <li>จองล่วงหน้าอย่างน้อย {bookingRules.minLeadHours} ชั่วโมง และไม่เกิน {bookingRules.maxAdvanceDays} วัน</li>
          <li>
            ระยะเวลา {bookingRules.minDurationHours}-{bookingRules.maxDurationHours} ชั่วโมง เลือกได้ทีละครึ่งชั่วโมง
          </li>
          <li>
            ยกเลิกนัดที่ผู้ช่วยตอบรับแล้วได้ก่อนเวลานัดอย่างน้อย {bookingRules.customerCancelCutoffHours} ชั่วโมง
          </li>
          <li>
            ถ้าเลยเวลานัด {bookingRules.noShowAfterMinutes} นาทีแล้วผู้ช่วยยังไม่มา กด “ผู้ช่วยไม่มาตามนัด”
            เพื่อปิดนัดได้เอง และถ้าเลยเวลาสิ้นสุดแล้วผู้ช่วยลืมกดจบงาน คุณยืนยันจบงานเองแล้วรีวิวต่อได้
          </li>
          <li>ราคาที่แสดงเป็นราคาประเมิน (อัตราต่อชั่วโมง × ชั่วโมง) ชำระกับผู้ช่วยโดยตรง ไม่ผ่านระบบ</li>
          <li>กรณีฉุกเฉินทางการแพทย์ โทร 1669 ทันที</li>
        </ul>
      </section>

      <section aria-labelledby="companion-heading" className="mt-14 grid gap-8 rounded-card bg-sakura-50 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8">
        <div>
          <h2 id="companion-heading" className="text-2xl text-sumi">
            สำหรับผู้ช่วยร่วมเดินทาง
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-sumi-soft">
            {companionSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <ButtonLink href="/become-companion" size="lg">
          สมัครเป็นผู้ช่วย
        </ButtonLink>
      </section>
    </div>
  );
}
