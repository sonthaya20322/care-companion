import type { Metadata } from "next";
import { PageHeading } from "@/components/area/AreaShell";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "ภาพรวมผู้ช่วย" };

export default function CompanionHomePage() {
  return (
    <>
      <PageHeading title="สวัสดีค่ะ" description="จัดการโปรไฟล์ รับคำขอ และติดตามงานของคุณ" />
      <EmptyState
        title="เริ่มจากกรอกโปรไฟล์"
        description="แนะนำตัว เลือกพื้นที่และเวลาที่สะดวก แล้วส่งเอกสารยืนยันตัวตนเพื่อเริ่มรับงาน"
        action={<ButtonLink href="/companion/profile">กรอกโปรไฟล์</ButtonLink>}
      />
    </>
  );
}
