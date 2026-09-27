import type { Metadata } from "next";
import { PageHeading } from "@/components/area/AreaShell";
import { BookingCard } from "@/components/bookings/BookingCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { splitBookings } from "@/lib/domain/booking-list";
import { getPeople, listBookings } from "@/lib/services/bookings";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "ภาพรวม" };

export default async function CustomerHomePage() {
  const profile = await requireRole("customer", "/customer");
  const bookings = await listBookings({ customerId: profile.id });
  const now = new Date();
  const { upcoming, past } = splitBookings(bookings, now);
  const next = upcoming.slice(0, 3);
  const people = await getPeople(next.map((b) => b.companion_id ?? ""));
  const completedCount = past.filter((b) => b.status === "completed").length;
  const firstName = profile.full_name.split(" ")[0];

  return (
    <>
      <PageHeading
        title={firstName ? `สวัสดีค่ะ คุณ${firstName}` : "สวัสดีค่ะ"}
        description="จองผู้ช่วยร่วมเดินทางและติดตามนัดหมายได้จากหน้านี้"
        action={<ButtonLink href="/customer/book">จองผู้ช่วย</ButtonLink>}
      />

      {bookings.length === 0 ? (
        <EmptyState
          title="ยังไม่มีนัดหมาย"
          description="เริ่มจากเลือกผู้ช่วยที่ถูกใจ หรือโพสต์คำขอให้ผู้ช่วยในพื้นที่กดรับ"
          action={<ButtonLink href="/companions">ดูรายชื่อผู้ช่วย</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="stagger grid gap-4 sm:grid-cols-3">
            <Stat label="นัดหมายที่รออยู่" value={upcoming.length} tone="bg-sora-50 text-sora-700" />
            <Stat label="ใช้บริการแล้ว" value={completedCount} tone="bg-matcha-bg text-matcha" />
            <Stat label="นัดหมายทั้งหมด" value={bookings.length} tone="bg-sakura-50 text-sakura-700" />
          </div>

          <section aria-labelledby="next-heading">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 id="next-heading" className="font-display text-xl text-sumi">
                นัดหมายถัดไป
              </h2>
              <ButtonLink href="/customer/bookings" variant="ghost">
                ดูทั้งหมด
              </ButtonLink>
            </div>
            {next.length === 0 ? (
              <p className="text-sumi-soft">ไม่มีนัดหมายที่รออยู่</p>
            ) : (
              <ul className="stagger flex flex-col gap-3">
                {next.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    href={`/customer/bookings/${b.id}`}
                    counterpart={b.companion_id ? (people.get(b.companion_id) ?? null) : null}
                    counterpartFallback="รอผู้ช่วยรับงาน"
                    now={now}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className={`self-start rounded-full px-3 py-1 text-sm font-medium ${tone}`}>{label}</span>
      <span className="font-display text-4xl text-sumi">{value}</span>
    </Card>
  );
}
