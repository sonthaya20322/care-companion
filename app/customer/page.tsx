import type { Metadata } from "next";
import { PageHeading } from "@/components/area/AreaShell";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "ภาพรวม" };

export default function CustomerHomePage() {
  return (
    <>
      <PageHeading title="สวัสดีค่ะ" description="จองผู้ช่วยร่วมเดินทางและติดตามนัดหมายได้จากหน้านี้" />
      <EmptyState
        title="ยังไม่มีนัดหมาย"
        description="เริ่มจากเลือกผู้ช่วยที่ถูกใจ หรือโพสต์คำขอให้ผู้ช่วยในพื้นที่กดรับ"
        action={<ButtonLink href="/customer/book">จองผู้ช่วย</ButtonLink>}
      />
    </>
  );
}
