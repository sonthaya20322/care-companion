import type { Metadata } from "next";
import { PageHeading } from "@/components/area/AreaShell";
import { BookingActions } from "@/components/bookings/BookingActions";
import { BookingSection } from "@/components/bookings/BookingSection";
import { RequestCard } from "@/components/bookings/RequestCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { estimatePrice, formatBaht } from "@/lib/domain/booking";
import { findConflict, splitBookings } from "@/lib/domain/booking-list";
import { getPeople, listBookings, listOpenRequests } from "@/lib/services/bookings";
import { getMyCompanionProfile } from "@/lib/services/companion-self";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "คำขอรับงาน" };

export default async function CompanionRequestsPage() {
  const profile = await requireRole("companion", "/companion/requests");
  const companion = await getMyCompanionProfile(profile.id);

  if (companion?.verification_status !== "approved") {
    return (
      <>
        <PageHeading title="คำขอรับงาน" />
        <EmptyState
          title="ยืนยันตัวตนก่อนเริ่มรับงาน"
          description="เมื่อทีมงานอนุมัติเอกสารแล้ว คำขอจากผู้ใช้บริการในพื้นที่ของคุณจะแสดงที่นี่"
          action={<ButtonLink href="/companion/verification">ไปหน้ายืนยันตัวตน</ButtonLink>}
        />
      </>
    );
  }

  const now = new Date();
  const [mine, open] = await Promise.all([listBookings({ companionId: profile.id }), listOpenRequests()]);
  const direct = splitBookings(mine, now).upcoming.filter((b) => b.status === "requested");
  const jobs = mine.filter((b) => b.status === "accepted" || b.status === "in_progress");
  const people = await getPeople(direct.map((b) => b.customer_id));

  return (
    <>
      <PageHeading
        title="คำขอรับงาน"
        description="ตอบรับคำขอที่ส่งถึงคุณโดยตรง หรือรับคำขอเปิดในพื้นที่ที่คุณให้บริการ"
      />
      <div className="flex flex-col gap-10">
        <BookingSection title="ส่งถึงคุณโดยตรง" empty="ยังไม่มีคำขอที่ส่งถึงคุณ">
          {direct.map((b) => {
            const conflict = findConflict(b, jobs);
            return (
              <RequestCard
                key={b.id}
                conflict={conflict}
                errandName={b.errandName}
                startsAt={b.starts_at}
                durationHours={b.duration_hours}
                pickup={b.pickupLabel}
                destination={b.destination_name}
                details={b.details}
                specialNeeds={b.special_needs}
                meta={
                  <p className="text-right text-sm text-sumi-soft">
                    {people.get(b.customer_id)?.full_name ?? "ผู้ใช้บริการ"}
                    <span className="block font-medium text-sumi">{formatBaht(b.estimated_price)}</span>
                  </p>
                }
              >
                <BookingActions
                  bookingId={b.id}
                  actions={conflict ? ["reject"] : ["accept", "reject"]}
                  viewerRole="companion"
                />
              </RequestCard>
            );
          })}
        </BookingSection>

        <BookingSection title="คำขอเปิดในพื้นที่ของคุณ" empty="ตอนนี้ยังไม่มีคำขอเปิดในพื้นที่ที่คุณเลือกไว้">
          {open.map((r) => {
            const conflict = findConflict(r, jobs);
            return (
              <RequestCard
                key={r.id}
                conflict={conflict}
                errandName={r.errand_name}
                startsAt={r.starts_at}
                durationHours={r.duration_hours}
                pickup={`${r.pickup_district}, ${r.pickup_province}`}
                destination={r.destination_name}
                details={r.details}
                specialNeeds={r.special_needs}
                meta={
                  <p className="text-sm font-medium text-sumi">
                    {formatBaht(estimatePrice(companion.hourly_rate, r.duration_hours))}
                  </p>
                }
              >
                {!conflict && <BookingActions bookingId={r.id} actions={["claim"]} viewerRole="companion" />}
              </RequestCard>
            );
          })}
        </BookingSection>
      </div>
    </>
  );
}
