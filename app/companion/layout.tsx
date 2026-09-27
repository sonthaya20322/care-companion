import { AreaShell } from "@/components/area/AreaShell";
import { requireRole } from "@/lib/services/guard";

const nav = [
  { href: "/companion", label: "ภาพรวม" },
  { href: "/companion/requests", label: "คำขอรับงาน" },
  { href: "/companion/jobs", label: "งานของฉัน" },
  { href: "/companion/profile", label: "โปรไฟล์ผู้ช่วย" },
  { href: "/companion/verification", label: "ยืนยันตัวตน" },
];

export default async function CompanionLayout({ children }: LayoutProps<"/companion">) {
  const profile = await requireRole("companion", "/companion");
  return (
    <AreaShell title={profile.full_name || "ผู้ช่วย"} subtitle="ผู้ช่วยร่วมเดินทาง" nav={nav}>
      {children}
    </AreaShell>
  );
}
