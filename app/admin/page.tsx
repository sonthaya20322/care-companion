import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/area/AreaShell";
import { Card } from "@/components/ui/Card";
import { activeBookingCount, sumCounts } from "@/lib/domain/admin";
import { formatBaht } from "@/lib/domain/booking";
import { getDashboardStats } from "@/lib/services/admin";
import { requireRole } from "@/lib/services/guard";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "ภาพรวมระบบ" };

export default async function AdminHomePage() {
  await requireRole("admin", "/admin");
  const stats = await getDashboardStats();
  const pending = stats.companions_by_status.pending ?? 0;
  const active = activeBookingCount(stats);
  const maxDay = Math.max(1, ...stats.bookings_last_14_days.map((d) => d.total));
  const maxErrand = Math.max(1, ...stats.bookings_by_errand.map((d) => d.total));

  return (
    <>
      <PageHeading title="ภาพรวมระบบ" description="สถิติผู้ใช้ ผู้ช่วย และนัดหมายทั้งหมด" />

      <div className="flex flex-col gap-8">
        {pending > 0 && (
          <Link
            href="/admin/verifications"
            className="animate-rise flex items-center justify-between gap-4 rounded-card bg-yamabuki-bg p-5 text-yamabuki ring-1 ring-yamabuki/25 transition-shadow hover:shadow-soft"
          >
            <span className="font-medium">มีผู้ช่วยรอตรวจสอบเอกสาร {pending} คน</span>
            <span aria-hidden>→</span>
          </Link>
        )}
        {stats.overdue_jobs > 0 && (
          <Link
            href="/admin/bookings?status=overdue"
            className="animate-rise flex items-center justify-between gap-4 rounded-card bg-yamabuki-bg p-5 text-yamabuki ring-1 ring-yamabuki/25 transition-shadow hover:shadow-soft"
          >
            <span className="font-medium">
              มีนัด {stats.overdue_jobs} รายการที่เลยเวลานัดแล้วแต่ผู้ช่วยยังไม่เริ่มงาน
            </span>
            <span aria-hidden>→</span>
          </Link>
        )}

        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="ผู้ใช้บริการ" value={stats.users_by_role.customer ?? 0} />
          <Stat
            label="ผู้ช่วย (อนุมัติแล้ว)"
            value={stats.companions_by_status.approved ?? 0}
            note={`ทั้งหมด ${stats.users_by_role.companion ?? 0} คน`}
          />
          <Stat
            label="นัดหมายที่ดำเนินอยู่"
            value={active}
            note={`ทั้งหมด ${sumCounts(stats.bookings_by_status)} รายการ · หมดเวลา ${stats.expired_requests}`}
          />
          <Stat label="งานที่เสร็จแล้ว" value={stats.bookings_by_status.completed ?? 0} />
          <Stat label="มูลค่างานโดยประมาณ" value={formatBaht(stats.completed_revenue_estimate)} note="จากงานที่เสร็จแล้ว" />
          <Stat label="คะแนนรีวิวเฉลี่ย" value={stats.average_rating ? stats.average_rating.toFixed(2) : "-"} />
          <Stat label="บัญชีที่ถูกระงับ" value={stats.suspended_users} />
          <Stat label="ยังไม่เลือกประเภทบัญชี" value={stats.users_by_role.unassigned ?? 0} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="font-display text-xl text-sumi">นัดหมายใหม่ 14 วันล่าสุด</h2>
            <ol className="mt-6 flex h-40 items-end gap-1.5" aria-label="จำนวนนัดหมายใหม่รายวัน">
              {stats.bookings_last_14_days.map((d) => (
                <li key={d.day} className="flex h-full flex-1 flex-col justify-end" title={`${formatDate(d.day)}: ${d.total}`}>
                  <span className="sr-only">
                    {formatDate(d.day)} {d.total} รายการ
                  </span>
                  <span
                    aria-hidden
                    className="block min-h-1 rounded-t-md bg-sakura-300 transition-[height] duration-500"
                    style={{ height: `${(d.total / maxDay) * 100}%` }}
                  />
                </li>
              ))}
            </ol>
            <div aria-hidden className="mt-2 flex justify-between text-xs text-sumi-soft">
              <span>{stats.bookings_last_14_days[0] && formatDate(stats.bookings_last_14_days[0].day)}</span>
              <span>วันนี้</span>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-xl text-sumi">นัดหมายตามประเภทธุระ</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {stats.bookings_by_errand.map((e) => (
                <li key={e.name}>
                  <div className="flex justify-between text-sm">
                    <span className="text-sumi">{e.name}</span>
                    <span className="text-sumi-soft">{e.total}</span>
                  </div>
                  <span aria-hidden className="mt-1 block h-2 rounded-full bg-sora-50">
                    <span className="block h-full rounded-full bg-sora-400" style={{ width: `${(e.total / maxErrand) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-sm text-sumi-soft">{label}</span>
      <span className="font-display text-3xl text-sumi">{value}</span>
      {note && <span className="text-sm text-sumi-soft">{note}</span>}
    </Card>
  );
}
