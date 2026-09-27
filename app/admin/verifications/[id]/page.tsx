import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar } from "@/components/Avatar";
import { ReviewCompanionForm } from "@/components/admin/ReviewCompanionForm";
import { Card } from "@/components/ui/Card";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { formatBaht } from "@/lib/domain/booking";
import { verificationMeta } from "@/lib/domain/companion";
import { getCompanionForReview } from "@/lib/services/admin";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "ตรวจสอบผู้ช่วย" };

export default async function VerificationDetailPage({ params }: PageProps<"/admin/verifications/[id]">) {
  const { id } = await params;
  await requireRole("admin", `/admin/verifications/${id}`);
  const c = await getCompanionForReview(id);
  if (!c) notFound();
  const meta = verificationMeta[c.verification_status];

  return (
    <>
      <Link href="/admin/verifications" className="mb-4 inline-flex min-h-12 items-center text-sora-700 hover:underline">
        ← รายการตรวจสอบ
      </Link>

      <div className="flex flex-col gap-6">
        <Card className="flex flex-wrap items-center gap-5">
          <Avatar name={c.full_name || "?"} src={c.avatar_url} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl text-sumi">{c.full_name || "(ยังไม่ระบุชื่อ)"}</h1>
            <p className="text-sumi-soft">{c.email}</p>
            {c.phone && <p className="text-sumi-soft">{c.phone}</p>}
          </div>
          <StatusStamp tone={meta.tone} label={meta.label} />
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="font-display text-xl text-sumi">เอกสารยืนยันตัวตน</h2>
            {!c.documentUrl ? (
              <p className="mt-4 text-sumi-soft">ยังไม่มีเอกสาร หรือเปิดไฟล์ไม่ได้</p>
            ) : c.documentIsPdf ? (
              <a
                href={c.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-12 items-center text-sora-700 underline-offset-4 hover:underline"
              >
                เปิดไฟล์ PDF (ลิงก์ใช้ได้ 5 นาที)
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL; must not be cached by the image optimizer
              <img src={c.documentUrl} alt="เอกสารยืนยันตัวตนของผู้ช่วย" className="mt-4 max-h-[28rem] w-full rounded-control object-contain ring-1 ring-washi-line" />
            )}
          </Card>

          <Card>
            <h2 className="font-display text-xl text-sumi">โปรไฟล์</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="อัตราค่าบริการ">{formatBaht(c.hourly_rate)} / ชั่วโมง</Detail>
              <Detail label="ประสบการณ์">{c.experience_years} ปี</Detail>
              <Detail label="ภาษา">{c.languages.join(", ") || "-"}</Detail>
              <Detail label="มีรถส่วนตัว">{c.has_vehicle ? "มี" : "ไม่มี"}</Detail>
              <Detail label="ทักษะ" wide>
                {c.skills.join(", ") || "-"}
              </Detail>
              <Detail label="พื้นที่ให้บริการ" wide>
                {c.areaLabels.join(" · ") || "-"}
              </Detail>
              <Detail label="แนะนำตัว" wide>
                {c.bio || "-"}
              </Detail>
            </dl>
          </Card>
        </div>

        {c.verification_note && (
          <p className="rounded-card bg-washi p-4 text-sumi-soft ring-1 ring-washi-line">หมายเหตุล่าสุด: {c.verification_note}</p>
        )}

        {c.verification_status === "pending" ? (
          <Card>
            <h2 className="mb-4 font-display text-xl text-sumi">ผลการตรวจสอบ</h2>
            <ReviewCompanionForm companionId={c.id} />
          </Card>
        ) : (
          <p className="text-sumi-soft">ตัดสินผลได้เฉพาะผู้ช่วยที่อยู่ในสถานะ “รอตรวจสอบ”</p>
        )}
      </div>
    </>
  );
}

function Detail({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-sm text-sumi-soft">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sumi">{children}</dd>
    </div>
  );
}
