import { AreaShell } from "@/components/area/AreaShell";
import { requireRole } from "@/lib/services/guard";

const nav = [
  { href: "/customer", label: "ภาพรวม" },
  { href: "/customer/book", label: "จองผู้ช่วย" },
  { href: "/customer/bookings", label: "นัดหมายของฉัน" },
  { href: "/customer/profile", label: "ข้อมูลของฉัน" },
];

export default async function CustomerLayout({ children }: LayoutProps<"/customer">) {
  const profile = await requireRole("customer", "/customer");
  return (
    <AreaShell title={profile.full_name || "ผู้ใช้บริการ"} subtitle="ผู้ใช้บริการ" nav={nav}>
      {children}
    </AreaShell>
  );
}
