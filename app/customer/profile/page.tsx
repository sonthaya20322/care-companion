import type { Metadata } from "next";
import { AvatarUpload } from "@/components/account/AvatarUpload";
import { ContactForm } from "@/components/account/ContactForm";
import { PageHeading } from "@/components/area/AreaShell";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "ข้อมูลของฉัน" };

export default async function CustomerProfilePage() {
  const profile = await requireRole("customer", "/customer/profile");
  return (
    <>
      <PageHeading
        title="ข้อมูลของฉัน"
        description="ชื่อและเบอร์โทรจะแสดงให้ผู้ช่วยเห็นหลังตอบรับนัดหมายแล้วเท่านั้น"
      />
      <Card className="max-w-2xl">
        <AvatarUpload userId={profile.id} name={profile.full_name} avatarUrl={profile.avatar_url} />
        <div className="mt-6 border-t border-washi-line pt-6">
          <ContactForm fullName={profile.full_name} phone={profile.phone} email={profile.email} />
        </div>
      </Card>
    </>
  );
}
