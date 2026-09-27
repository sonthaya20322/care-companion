import type { Metadata } from "next";
import { PageHeading } from "@/components/area/AreaShell";
import { BookingCard } from "@/components/bookings/BookingCard";
import { BookingSection } from "@/components/bookings/BookingSection";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { splitBookings } from "@/lib/domain/booking-list";
import { getPeople, listBookings, type BookingView } from "@/lib/services/bookings";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "งานของฉัน" };

export default async function CompanionJobsPage() {
  const profile = await requireRole("companion", "/companion/jobs");
  const bookings = await listBookings({ companionId: profile.id });
  const people = await getPeople(bookings.map((b) => b.customer_id));
  const now = new Date();
  const { upcoming, past } = splitBookings(bookings, now);

  const card = (b: BookingView) => (
    <BookingCard
      key={b.id}
      booking={b}
      href={`/companion/jobs/${b.id}`}
      counterpart={people.get(b.customer_id) ?? null}
      counterpartFallback="ผู้ใช้บริการ"
      now={now}
    />
  );

  return (
    <>
      <PageHeading title="งานของฉัน" description="นัดหมายที่ส่งถึงคุณหรือที่คุณรับไว้ เปิดดูเพื่อเริ่มงานและจบงาน" />
      {bookings.length === 0 ? (
        <EmptyState
          title="ยังไม่มีงาน"
          description="เมื่อมีผู้ใช้บริการส่งคำขอถึงคุณ หรือคุณรับคำขอในพื้นที่ งานจะมาแสดงที่นี่"
          action={<ButtonLink href="/companion/requests">ดูคำขอรับงาน</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-10">
          <BookingSection title="กำลังจะมาถึง" empty="ไม่มีงานที่รออยู่">
            {upcoming.map(card)}
          </BookingSection>
          <BookingSection title="ประวัติ" empty="ยังไม่มีประวัติ">
            {past.map(card)}
          </BookingSection>
        </div>
      )}
    </>
  );
}
