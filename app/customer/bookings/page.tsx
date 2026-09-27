import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeading } from "@/components/area/AreaShell";
import { BookingCard } from "@/components/bookings/BookingCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { splitBookings } from "@/lib/domain/booking-list";
import { getPeople, listBookings } from "@/lib/services/bookings";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "นัดหมายของฉัน" };

export default async function CustomerBookingsPage() {
  const profile = await requireRole("customer", "/customer/bookings");
  const bookings = await listBookings({ customerId: profile.id });
  const people = await getPeople(bookings.map((b) => b.companion_id ?? ""));
  const now = new Date();
  const { upcoming, past } = splitBookings(bookings, now);

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
          <BookingSection title="กำลังจะมาถึง" empty="ไม่มีนัดหมายที่รออยู่">
            {upcoming.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                href={`/customer/bookings/${b.id}`}
                counterpart={b.companion_id ? (people.get(b.companion_id) ?? null) : null}
                counterpartFallback="รอผู้ช่วยรับงาน"
                now={now}
              />
            ))}
          </BookingSection>
          <BookingSection title="ประวัติ" empty="ยังไม่มีประวัติ">
            {past.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                href={`/customer/bookings/${b.id}`}
                counterpart={b.companion_id ? (people.get(b.companion_id) ?? null) : null}
                counterpartFallback="ไม่มีผู้ช่วยรับงาน"
                now={now}
              />
            ))}
          </BookingSection>
        </div>
      )}
    </>
  );
}

function BookingSection({ title, empty, children }: { title: string; empty: string; children: ReactNode[] }) {
  return (
    <section aria-labelledby={`section-${title}`}>
      <h2 id={`section-${title}`} className="mb-4 font-display text-xl text-sumi">
        {title} <span className="text-base text-sumi-soft">({children.length})</span>
      </h2>
      {children.length === 0 ? (
        <p className="text-sumi-soft">{empty}</p>
      ) : (
        <ul className="stagger flex flex-col gap-3">{children}</ul>
      )}
    </section>
  );
}
