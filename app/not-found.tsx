import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-xl px-5 py-20">
      <p className="font-brand text-5xl font-bold text-sakura-300" aria-hidden>
        404
      </p>
      <h1 className="mt-2 text-3xl text-sumi">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="mt-4 text-sumi-soft">ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">กลับหน้าแรก</ButtonLink>
        <ButtonLink href="/companions" variant="secondary">
          ค้นหาผู้ช่วย
        </ButtonLink>
      </div>
    </section>
  );
}
