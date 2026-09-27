import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/area/AreaShell";
import { Card } from "@/components/ui/Card";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { canSubmitVerification, companionRules, verificationChecklist, verificationMeta } from "@/lib/domain/companion";
import { getMyCompanionProfile, getMyServiceAreaIds } from "@/lib/services/companion-self";
import { requireRole } from "@/lib/services/guard";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import { DocumentUpload } from "./DocumentUpload";
import { SubmitVerification } from "./SubmitVerification";

export const metadata: Metadata = { title: "ยืนยันตัวตน" };

export default async function VerificationPage() {
  const profile = await requireRole("companion", "/companion/verification");
  const [companion, areaIds] = await Promise.all([getMyCompanionProfile(profile.id), getMyServiceAreaIds(profile.id)]);
  if (!companion) throw new Error("companion profile row missing");

  const status = companion.verification_status;
  const meta = verificationMeta[status];
  const checklist = verificationChecklist({
    bio: companion.bio,
    areaCount: areaIds.length,
    documentPath: companion.id_document_path,
  });
  const editable = status === "draft" || status === "rejected";

  let documentUrl: string | null = null;
  if (companion.id_document_path) {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("companion-documents")
      .createSignedUrl(companion.id_document_path, 300);
    if (error) console.error("createSignedUrl failed", { message: error.message });
    documentUrl = data?.signedUrl ?? null;
  }

  const items = [
    {
      done: checklist.bio,
      title: `แนะนำตัวอย่างน้อย ${companionRules.minBioLength} ตัวอักษร`,
      link: { href: "/companion/profile", label: "แก้ไขโปรไฟล์" },
    },
    {
      done: checklist.serviceArea,
      title: "เลือกพื้นที่ให้บริการอย่างน้อย 1 เขต",
      link: { href: "/companion/profile", label: "เลือกพื้นที่" },
    },
    { done: checklist.document, title: "อัปโหลดเอกสารยืนยันตัวตน", link: null },
  ];

  return (
    <>
      <PageHeading
        title="ยืนยันตัวตน"
        description="ผู้ดูแลระบบจะตรวจเอกสารก่อนเปิดให้โปรไฟล์แสดงในหน้าค้นหา เอกสารเห็นได้เฉพาะคุณและผู้ดูแลระบบ"
      />

      <Card className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusStamp tone={meta.tone} label={meta.label} stamp={status === "approved"} />
          {companion.verified_at && status === "approved" && (
            <span className="text-sumi-soft">เมื่อ {formatDate(companion.verified_at)}</span>
          )}
        </div>
        <p className="text-sumi-soft">{meta.description}</p>
        {status === "rejected" && companion.verification_note && (
          <p className="rounded-control bg-beni-bg px-4 py-3 text-beni">
            <span className="font-medium">หมายเหตุจากผู้ดูแลระบบ: </span>
            {companion.verification_note}
          </p>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="text-xl text-sumi">สิ่งที่ต้องทำก่อนส่งตรวจสอบ</h2>
        <ol className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.title} className="flex flex-wrap items-center gap-3">
              <span
                className={
                  item.done
                    ? "flex size-7 items-center justify-center rounded-full bg-matcha text-white"
                    : "flex size-7 items-center justify-center rounded-full ring-2 ring-washi-line"
                }
                aria-hidden
              >
                {item.done && (
                  <svg viewBox="0 0 24 24" className="size-4">
                    <path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={item.done ? "text-sumi" : "text-sumi-soft"}>
                {item.title}
                <span className="sr-only">{item.done ? " (เรียบร้อย)" : " (ยังไม่เรียบร้อย)"}</span>
              </span>
              {!item.done && item.link && (
                <Link href={item.link.href} className="text-sora-700 underline underline-offset-4">
                  {item.link.label}
                </Link>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-6 border-t border-washi-line pt-6">
          <h3 className="text-lg text-sumi">เอกสารยืนยันตัวตน</h3>
          {documentUrl && (
            <p className="mt-2 text-sumi-soft">
              อัปโหลดแล้ว ·{" "}
              <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-sora-700 underline underline-offset-4">
                เปิดดูไฟล์
              </a>
            </p>
          )}
          <div className="mt-4">
            <DocumentUpload userId={profile.id} hasDocument={Boolean(companion.id_document_path)} disabled={!editable} />
          </div>
        </div>

        {editable && (
          <div className="mt-6 border-t border-washi-line pt-6">
            <SubmitVerification ready={canSubmitVerification(status, checklist)} />
          </div>
        )}
      </Card>
    </>
  );
}
