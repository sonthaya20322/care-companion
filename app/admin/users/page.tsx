import type { Metadata } from "next";
import { Avatar } from "@/components/Avatar";
import { PageHeading } from "@/components/area/AreaShell";
import { UserStatusButton } from "@/components/admin/UserStatusButton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Field";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { sanitizeSearch } from "@/lib/domain/admin";
import type { UserRole } from "@/lib/domain/roles";
import { listUsers } from "@/lib/services/admin";
import { requireRole } from "@/lib/services/guard";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "ผู้ใช้งาน" };

const roleLabels: Record<UserRole | "none", string> = {
  customer: "ผู้ใช้บริการ",
  companion: "ผู้ช่วย",
  admin: "ผู้ดูแลระบบ",
  none: "ยังไม่เลือก",
};
const roleFilters = Object.keys(roleLabels) as (UserRole | "none")[];

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const me = await requireRole("admin", "/admin/users");
  const params = await searchParams;
  const role = roleFilters.find((r) => r === params.role);
  const search = sanitizeSearch(params.q);
  const users = await listUsers({ role, search });

  return (
    <>
      <PageHeading title="ผู้ใช้งาน" description="ค้นหาบัญชี ดูประเภทบัญชี และระงับบัญชีที่ใช้งานไม่เหมาะสม" />

      <form method="get" role="search" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex min-w-60 flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="font-medium text-sumi">
            ชื่อหรืออีเมล
          </label>
          <Input id="q" name="q" type="search" defaultValue={search} maxLength={60} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="font-medium text-sumi">
            ประเภทบัญชี
          </label>
          <Select id="role" name="role" defaultValue={role ?? ""} className="w-48">
            <option value="">ทั้งหมด</option>
            {roleFilters.map((r) => (
              <option key={r} value={r}>
                {roleLabels[r]}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="secondary">
          ค้นหา
        </Button>
      </form>

      {users.length === 0 ? (
        <EmptyState title="ไม่พบผู้ใช้" description="ลองเปลี่ยนคำค้นหาหรือประเภทบัญชี" />
      ) : (
        <ul className="flex flex-col gap-3">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-col gap-4 rounded-card bg-washi-surface p-5 shadow-soft ring-1 ring-washi-line sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Avatar name={u.full_name || "?"} src={u.avatar_url} size="sm" />
                <div className="min-w-0">
                  <p className="font-medium text-sumi">
                    {u.full_name || "(ยังไม่ระบุชื่อ)"}
                    {u.id === me.id && <span className="ml-2 text-sm text-sumi-soft">(คุณ)</span>}
                  </p>
                  <p className="truncate text-sm text-sumi-soft">{u.email}</p>
                  <p className="text-sm text-sumi-soft">
                    {roleLabels[u.role ?? "none"]} · สมัครเมื่อ {formatDate(u.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <StatusStamp
                  tone={u.status === "active" ? "matcha" : "beni"}
                  label={u.status === "active" ? "ใช้งานอยู่" : "ถูกระงับ"}
                />
                {u.id !== me.id && u.role !== "admin" && (
                  <UserStatusButton userId={u.id} name={u.full_name || u.email} status={u.status} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
