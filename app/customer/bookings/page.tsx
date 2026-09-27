import type { Metadata } from "next";
import { PageHeading } from "@/components/area/AreaShell";
import { BookingCard } from "@/components/bookings/BookingCard";
import { BookingSection } from "@/components/bookings/BookingSection";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { activeBookingsLabel, splitBookings } from "@/lib/domain/booking-list";
import { getPeople, listBookings, type BookingView } from "@/lib/services/bookings";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "นัดหมายของฉัน" };

export default async function CustomerBookingsPage() {
  const profile = await requireRole("customer", "/customer/bookings");
  const bookings = await listBookings({ customerId: profile.id });
  const people = await getPeople(bookings.map((b) => b.companion_id ?? ""));
  const now = new Date();
  const { upcoming, past } = splitBookings(bookings, now);

  const card = (b: BookingView) => (
    <BookingCard
      key={b.id}
      booking={b}
      href={`/customer/bookings/${b.id}`}
      counterpart={b.companion_id ? (people.get(b.companion_id) ?? null) : null}
      counterpartFallback={b.status === "requested" ? "รอผู้ช่วยรับงาน" : "ไม่มีผู้ช่วยรับงาน"}
      now={now}
    />
  );

  return (
    <>
      <PageHeading
        title="นัดหมายของฉัน"
        description="ติดตามสถานะคำขอ ดูเบอร์ติดต่อผู้ช่วย และรีวิวหลังจบงาน"
        action={<ButtonLink href="/customer/book">จองผู้ช่วย</ButtonLink>}
      />

      {bookings.length === 0 ? (
        <EmptyState
          title="ยังไม่มีนัดหมาย"
          description="เลือกผู้ช่วยที่ถูกใจจากรายชื่อ หรือโพสต์คำขอให้ผู้ช่วยในพื้นที่ช่วยรับงาน"
          action={<ButtonLink href="/companions">ดูรายชื่อผู้ช่วย</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-10">
          <BookingSection title={activeBookingsLabel} empty={`ไม่มี${activeBookingsLabel}`}>
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
