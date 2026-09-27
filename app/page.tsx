import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusStamp } from "@/components/ui/StatusStamp";

const errands = [
  "พบแพทย์ตามนัด",
  "ไปโรงพยาบาล",
  "ไปธนาคาร",
  "ติดต่อหน่วยงานราชการ",
  "ซื้อของ",
  "ธุระอื่น ๆ นอกบ้าน",
];

const steps = [
  {
    title: "บอกสิ่งที่ต้องการ",
    body: "เลือกประเภทธุระ วัน เวลา จุดรับ จุดหมาย และระยะเวลาที่ต้องการ",
  },
  {
    title: "เลือกผู้ช่วยที่ใช่",
    body: "ดูประวัติ ประสบการณ์ และพื้นที่ให้บริการ แล้วส่งคำขอ หรือโพสต์ให้ผู้ช่วยในพื้นที่กดรับ",
  },
  {
    title: "ออกเดินทางด้วยกัน",
    body: "ผู้ช่วยตอบรับแล้วจึงเห็นข้อมูลติดต่อ และพาไปทำธุระตามนัดหมาย",
  },
  {
    title: "จบงานและรีวิว",
    body: "ติดตามสถานะได้ทุกขั้นตอน เมื่อเสร็จแล้วให้คะแนนเพื่อช่วยคนถัดไป",
  },
];

const assurances = [
  {
    title: "ผู้ช่วยผ่านการตรวจสอบ",
    body: "ผู้ช่วยทุกคนต้องส่งเอกสารยืนยันตัวตน และได้รับอนุมัติจากผู้ดูแลระบบก่อนรับงาน",
  },
  {
    title: "ข้อมูลติดต่อเปิดเมื่อจำเป็น",
    body: "เบอร์โทรและที่อยู่ของคุณจะแสดงให้ผู้ช่วยเห็นหลังตอบรับงานแล้วเท่านั้น",
  },
  {
    title: "เข้าสู่ระบบด้วย Google",
    body: "ไม่ต้องจำรหัสผ่านใหม่ ใช้บัญชี Google ที่มีอยู่แล้ว",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="bg-seigaiha absolute inset-x-0 bottom-0 h-40 opacity-70 [mask-image:linear-gradient(to_top,black,transparent)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-14 md:grid-cols-[1.15fr_1fr] md:pt-20">
          <div className="stagger flex flex-col items-start gap-6">
            <p className="animate-rise rounded-full bg-sakura-100 px-4 py-1.5 text-sm font-medium text-sakura-700">
              ผู้ช่วยร่วมเดินทางสำหรับผู้สูงอายุและผู้ที่ไปคนเดียวไม่สะดวก
            </p>
            <h1 className="animate-rise text-4xl leading-tight text-sumi md:text-5xl">
              ไปหาหมอ ไปธนาคาร
              <br />
              <span className="text-sakura-600">ไม่ต้องไปคนเดียว</span>
            </h1>
            <p className="animate-rise max-w-xl text-lg text-sumi-soft">
              วันที่ลูกหลานไปด้วยไม่ได้ Care Companion ช่วยหาผู้ช่วยที่ผ่านการตรวจสอบ
              พาไปทำธุระนอกบ้านอย่างอุ่นใจ ตั้งแต่ออกจากบ้านจนกลับถึงบ้าน
            </p>
            <div className="animate-rise flex flex-wrap gap-3">
              <ButtonLink href="/companions" size="lg">
                หาผู้ช่วยร่วมเดินทาง
              </ButtonLink>
              <ButtonLink href="/become-companion" size="lg" variant="secondary">
                สมัครเป็นผู้ช่วย
              </ButtonLink>
            </div>
          </div>

          <div className="animate-rise [animation-delay:240ms]">
            <Card padded={false} className="relative mx-auto max-w-sm rotate-1 overflow-hidden">
              <div className="flex items-center justify-between bg-sora-100 px-6 py-4">
                <span className="font-medium text-sora-700">ตัวอย่างการนัดหมาย</span>
                <StatusStamp tone="matcha" label="ตอบรับแล้ว" stamp className="[animation-delay:700ms]" />
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 px-6 py-5">
                <dt className="text-sumi-soft">ธุระ</dt>
                <dd className="font-medium">พบแพทย์ตามนัด</dd>
                <dt className="text-sumi-soft">วันเวลา</dt>
                <dd className="font-medium">พฤหัสบดี 9:00 น. · 4 ชั่วโมง</dd>
                <dt className="text-sumi-soft">จุดรับ</dt>
                <dd className="font-medium">บ้าน เขตบางกะปิ</dd>
                <dt className="text-sumi-soft">จุดหมาย</dt>
                <dd className="font-medium">โรงพยาบาลรามาธิบดี</dd>
              </dl>
              <div className="flex items-center gap-3 border-t border-dashed border-washi-line px-6 py-4">
                <span
                  aria-hidden
                  className="flex size-11 items-center justify-center rounded-full bg-sakura-100 font-display text-lg text-sakura-700"
                >
                  ม
                </span>
                <div>
                  <p className="font-medium">คุณมะลิ</p>
                  <p className="text-sm text-sumi-soft">ผู้ช่วยร่วมเดินทาง · ประสบการณ์ 3 ปี</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section aria-labelledby="errands-heading" className="mx-auto w-full max-w-6xl px-5 py-16">
        <h2 id="errands-heading" className="text-2xl text-sumi md:text-3xl">
          ธุระแบบไหนก็มีคนไปด้วย
        </h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {errands.map((errand) => (
            <li
              key={errand}
              className="rounded-full bg-washi-surface px-5 py-2.5 text-sumi ring-1 ring-sakura-200"
            >
              {errand}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-heading" className="bg-sora-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="steps-heading" className="text-2xl text-sumi md:text-3xl">
              ใช้งานง่าย 4 ขั้นตอน
            </h2>
            <p className="mt-3 text-sumi-soft">
              ติดตามได้ทุกขั้นตอน ตั้งแต่ส่งคำขอจนจบงาน
            </p>
          </div>
          <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 -rotate-6 items-center justify-center rounded-full border-2 border-sora-600 font-brand text-lg font-bold text-sora-700"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg text-sumi">{step.title}</h3>
                  <p className="mt-1 text-sumi-soft">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="trust-heading" className="mx-auto w-full max-w-6xl px-5 py-20">
        <h2 id="trust-heading" className="max-w-xl text-2xl text-sumi md:text-3xl">
          อุ่นใจทั้งคนไปและคนที่อยู่บ้าน
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {assurances.map((item) => (
            <div key={item.title} className="border-t-2 border-sakura-200 pt-5">
              <h3 className="text-lg text-sumi">{item.title}</h3>
              <p className="mt-2 text-sumi-soft">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-20 w-full max-w-6xl px-5">
        <div className="flex flex-col items-start justify-between gap-6 rounded-card bg-sakura-100 px-8 py-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl text-sumi">อยากเป็นผู้ช่วยร่วมเดินทาง?</h2>
            <p className="mt-2 max-w-xl text-sumi-soft">
              ใช้เวลาว่างช่วยเหลือผู้อื่น กำหนดพื้นที่และช่วงเวลาที่สะดวกได้เอง
            </p>
          </div>
          <ButtonLink href="/become-companion" size="lg">
            สมัครเป็นผู้ช่วย
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
