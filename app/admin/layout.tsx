import { AreaShell } from "@/components/area/AreaShell";
import { requireRole } from "@/lib/services/guard";

const nav = [
  { href: "/admin", label: "ภาพรวมระบบ" },
  { href: "/admin/verifications", label: "ตรวจสอบผู้ช่วย" },
  { href: "/admin/bookings", label: "นัดหมายทั้งหมด" },
  { href: "/admin/users", label: "ผู้ใช้งาน" },
  { href: "/admin/errand-types", label: "ประเภทธุระ" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireRole("admin", "/admin");
  return (
    <AreaShell title="ผู้ดูแลระบบ" subtitle="Care Companion" nav={nav}>
      {children}
    </AreaShell>
  );
}
