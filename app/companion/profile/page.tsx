import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AvatarUpload } from "@/components/account/AvatarUpload";
import { ContactForm } from "@/components/account/ContactForm";
import { PageHeading } from "@/components/area/AreaShell";
import { Card } from "@/components/ui/Card";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { serviceAreaRequired, verificationMeta } from "@/lib/domain/companion";
import { getLocations } from "@/lib/services/catalog";
import { getMyAvailability, getMyCompanionProfile, getMyServiceAreaIds } from "@/lib/services/companion-self";
import { requireRole } from "@/lib/services/guard";
import { AreasForm } from "./AreasForm";
import { AvailabilityForm } from "./AvailabilityForm";
import { DetailsForm } from "./DetailsForm";

export const metadata: Metadata = { title: "โปรไฟล์ผู้ช่วย" };

export default async function CompanionProfilePage() {
  const profile = await requireRole("companion", "/companion/profile");
  const [companion, areaIds, slots, locations] = await Promise.all([
    getMyCompanionProfile(profile.id),
    getMyServiceAreaIds(profile.id),
    getMyAvailability(profile.id),
    getLocations(),
  ]);
  if (!companion) throw new Error("companion profile row missing");
  const meta = verificationMeta[companion.verification_status];

  return (
    <>
      <PageHeading
        title="โปรไฟล์ผู้ช่วย"
        description="ข้อมูลนี้จะแสดงให้ผู้ใช้บริการเห็นเมื่อได้รับการอนุมัติแล้ว"
        action={
          companion.verification_status === "approved" ? (
            <Link href={`/companions/${profile.id}`} className="text-sora-700 underline underline-offset-4">
              ดูหน้าโปรไฟล์สาธารณะ
            </Link>
          ) : undefined
        }
      />

      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-card bg-washi-surface px-5 py-4 ring-1 ring-washi-line">
        <StatusStamp tone={meta.tone} label={meta.label} />
        <p className="text-sumi-soft">{meta.description}</p>
        {companion.verification_status !== "approved" && (
          <Link href="/companion/verification" className="ml-auto text-sora-700 underline underline-offset-4">
            ไปหน้ายืนยันตัวตน
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <Section title="รูปและข้อมูลติดต่อ">
          <AvatarUpload userId={profile.id} name={profile.full_name} avatarUrl={profile.avatar_url} />
          <div className="mt-6 border-t border-washi-line pt-6">
            <ContactForm fullName={profile.full_name} phone={profile.phone} email={profile.email} />
          </div>
        </Section>
        <Section title="ข้อมูลผู้ช่วย">
          <DetailsForm profile={companion} />
        </Section>
        <Section title="พื้นที่ให้บริการ" description="เลือกเขตที่รับผู้ใช้บริการได้ คำขอเปิดในเขตเหล่านี้จะแสดงให้คุณเห็น">
          <AreasForm
            locations={locations}
            selected={areaIds}
            required={serviceAreaRequired(companion.verification_status)}
          />
        </Section>
        <Section title="ช่วงเวลาที่สะดวก" description="ผู้ใช้บริการจะเห็นตารางนี้ในหน้าโปรไฟล์ของคุณ">
          <AvailabilityForm slots={slots} />
        </Section>
      </div>
    </>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <h2 className="text-xl text-sumi">{title}</h2>
      {description && <p className="mt-1 text-sumi-soft">{description}</p>}
      <div className="mt-5">{children}</div>
    </Card>
  );
}
