import type { Metadata } from "next";
import { PageHeading } from "@/components/area/AreaShell";

export const metadata: Metadata = { title: "ภาพรวมระบบ" };

export default function AdminHomePage() {
  return <PageHeading title="ภาพรวมระบบ" description="สถิติผู้ใช้ ผู้ช่วย และนัดหมายทั้งหมด" />;
}
