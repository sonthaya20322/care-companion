import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { PageHeading } from "@/components/area/AreaShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { verificationMeta, type VerificationStatus } from "@/lib/domain/companion";
import { listCompanionsByStatus } from "@/lib/services/admin";
import { requireRole } from "@/lib/services/guard";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "ตรวจสอบผู้ช่วย" };

const tabs: VerificationStatus[] = ["pending", "approved", "rejected", "draft"];

export default async function VerificationsPage({ searchParams }: PageProps<"/admin/verifications">) {
  await requireRole("admin", "/admin/verifications");
  const params = await searchParams;
  const status = tabs.find((t) => t === params.status) ?? "pending";
  const companions = await listCompanionsByStatus(status);

  return (
    <>
      <PageHeading title="ตรวจสอบผู้ช่วย" description="ดูเอกสารยืนยันตัวตนและโปรไฟล์ก่อนอนุมัติให้รับงาน" />

      {params.done && (
        <p role="status" className="animate-rise mb-6 rounded-card bg-matcha-bg p-4 font-medium text-matcha">
          {params.done === "approve" ? "อนุมัติผู้ช่วยแล้ว โปรไฟล์จะแสดงในหน้าค้นหาทันที" : "บันทึกผลไม่อนุมัติพร้อมหมายเหตุแล้ว"}
        </p>
      )}

      <nav aria-label="สถานะการตรวจสอบ" className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/admin/verifications?status=${t}`}
            aria-current={t === status ? "page" : undefined}
            className={cn(
              "inline-flex min-h-12 items-center rounded-full px-5 ring-1 ring-inset transition-colors",
              t === status ? "bg-sakura-600 text-white ring-sakura-600" : "bg-washi-surface text-sumi ring-washi-line hover:bg-sakura-50",
            )}
          >
            {verificationMeta[t].label}
          </Link>
        ))}
      </nav>

      {companions.length === 0 ? (
        <EmptyState
          title={status === "pending" ? "ไม่มีผู้ช่วยรอตรวจสอบ" : "ไม่มีรายการ"}
          description={status === "pending" ? "เมื่อผู้ช่วยส่งเอกสาร รายชื่อจะมาแสดงที่นี่" : "ยังไม่มีผู้ช่วยในสถานะนี้"}
        />
      ) : (
        <ul className="stagger flex flex-col gap-3">
          {companions.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/verifications/${c.id}`}
                className="flex items-center gap-4 rounded-card bg-washi-surface p-5 shadow-soft ring-1 ring-washi-line transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Avatar name={c.full_name || "?"} src={c.avatar_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sumi">{c.full_name || "(ยังไม่ระบุชื่อ)"}</p>
                  <p className="truncate text-sm text-sumi-soft">{c.email}</p>
                  {c.submitted_at && (
                    <p className="text-sm text-sumi-soft">อัปเดตล่าสุด {formatDateTime(c.submitted_at)}</p>
                  )}
                </div>
                <StatusStamp tone={verificationMeta[c.verification_status].tone} label={verificationMeta[c.verification_status].label} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
