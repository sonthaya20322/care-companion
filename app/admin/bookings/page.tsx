import type { Metadata } from "next";
import { PageHeading } from "@/components/area/AreaShell";
import { BookingCard } from "@/components/bookings/BookingCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";
import { bookingStatusMeta, type DisplayStatus } from "@/lib/domain/booking";
import { queryForDisplayStatus } from "@/lib/domain/booking-list";
import { getPeople, listBookings } from "@/lib/services/bookings";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "นัดหมายทั้งหมด" };

const statuses: DisplayStatus[] = [
  "requested",
  "open",
  "expired",
  "accepted",
  "overdue",
  "in_progress",
  "completed",
  "rejected",
  "cancelled",
];

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  await requireRole("admin", "/admin/bookings");
  const params = await searchParams;
  const status = statuses.find((s) => s === params.status);
  const now = new Date();
  const bookings = await listBookings({ query: status ? queryForDisplayStatus(status, now) : undefined, limit: 200 });
  const people = await getPeople(bookings.flatMap((b) => [b.customer_id, b.companion_id ?? ""]));

  return (
    <>
      <PageHeading title="นัดหมายทั้งหมด" description="ดูรายละเอียดและยกเลิกนัดหมายที่มีปัญหาได้" />

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="font-medium text-sumi">
            สถานะ
          </label>
          <Select id="status" name="status" defaultValue={status ?? ""} className="w-56">
            <option value="">ทั้งหมด</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {bookingStatusMeta[s].label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="secondary">
          กรอง
        </Button>
      </form>

      {bookings.length === 0 ? (
        <EmptyState title="ไม่มีนัดหมาย" description="ยังไม่มีนัดหมายในสถานะที่เลือก" />
      ) : (
        <ul className="stagger flex flex-col gap-3">
          {bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              href={`/admin/bookings/${b.id}`}
              counterpart={people.get(b.customer_id) ?? null}
              counterpartFallback="ผู้ใช้บริการ"
              extra={`ผู้ช่วย: ${b.companion_id ? (people.get(b.companion_id)?.full_name ?? "-") : "ยังไม่มีผู้รับงาน"}`}
              now={now}
            />
          ))}
        </ul>
      )}
    </>
  );
}
