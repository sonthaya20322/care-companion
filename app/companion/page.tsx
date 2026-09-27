import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/area/AreaShell";
import { BookingCard } from "@/components/bookings/BookingCard";
import { RatingText } from "@/components/companions/RatingText";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { splitBookings } from "@/lib/domain/booking-list";
import { verificationMeta } from "@/lib/domain/companion";
import { getPeople, listBookings, listOpenRequests } from "@/lib/services/bookings";
import { getMyCompanionProfile } from "@/lib/services/companion-self";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "ภาพรวมผู้ช่วย" };

export default async function CompanionHomePage() {
  const profile = await requireRole("companion", "/companion");
  const companion = await getMyCompanionProfile(profile.id);
  const status = companion?.verification_status ?? "draft";
  const approved = status === "approved";
  const verification = verificationMeta[status];

  const now = new Date();
  const [mine, open] = await Promise.all([
    listBookings({ companionId: profile.id }),
    approved ? listOpenRequests() : Promise.resolve([]),
  ]);
  const { upcoming, past } = splitBookings(mine, now);
  const waiting = upcoming.filter((b) => b.status === "requested").length + open.length;
  const jobs = upcoming.filter((b) => b.status !== "requested");
  const next = jobs.slice(0, 3);
  const people = await getPeople(next.map((b) => b.customer_id));
  const firstName = profile.full_name.split(" ")[0];

  return (
    <>
      <PageHeading
        title={firstName ? `สวัสดีค่ะ คุณ${firstName}` : "สวัสดีค่ะ"}
        description="รับคำขอ ติดตามงาน และดูแลโปรไฟล์ของคุณได้จากหน้านี้"
      />

      <div className="flex flex-col gap-8">
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-sumi-soft">สถานะการยืนยันตัวตน</p>
            <StatusStamp tone={verification.tone} label={verification.label} className="mt-1" />
            <p className="mt-2 text-sumi-soft">{verification.description}</p>
            {companion?.verification_note && status === "rejected" && (
              <p className="mt-2 rounded-control bg-beni-bg px-4 py-2 text-beni">หมายเหตุ: {companion.verification_note}</p>
            )}
          </div>
          {!approved && (
            <ButtonLink href={status === "draft" ? "/companion/profile" : "/companion/verification"}>
              {status === "draft" ? "กรอกโปรไฟล์" : "ดูรายละเอียด"}
            </ButtonLink>
          )}
          {approved && companion && <RatingText avg={companion.rating_avg} count={companion.rating_count} />}
        </Card>

        {approved && (
          <div className="stagger grid gap-4 sm:grid-cols-3">
            <Stat label="คำขอรอคุณ" value={waiting} tone="bg-sora-50 text-sora-700" href="/companion/requests" />
            <Stat label="งานที่รับไว้" value={jobs.length} tone="bg-sakura-50 text-sakura-700" href="/companion/jobs" />
            <Stat
              label="งานที่เสร็จแล้ว"
              value={past.filter((b) => b.status === "completed").length}
              tone="bg-matcha-bg text-matcha"
              href="/companion/jobs"
            />
          </div>
        )}

        {approved && (
          <section aria-labelledby="next-jobs">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 id="next-jobs" className="font-display text-xl text-sumi">
                งานถัดไป
              </h2>
              <ButtonLink href="/companion/jobs" variant="ghost">
                ดูทั้งหมด
              </ButtonLink>
            </div>
            {next.length === 0 ? (
              <p className="text-sumi-soft">ยังไม่มีงานที่รับไว้ ลองดูคำขอในพื้นที่ของคุณ</p>
            ) : (
              <ul className="stagger flex flex-col gap-3">
                {next.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    href={`/companion/jobs/${b.id}`}
                    counterpart={people.get(b.customer_id) ?? null}
                    counterpartFallback="ผู้ใช้บริการ"
                    now={now}
                  />
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, tone, href }: { label: string; value: number; tone: string; href: string }) {
  return (
    <Link href={href} className="rounded-card">
      <Card interactive className="flex flex-col gap-1">
        <span className={`self-start rounded-full px-3 py-1 text-sm font-medium ${tone}`}>{label}</span>
        <span className="font-display text-4xl text-sumi">{value}</span>
      </Card>
    </Link>
  );
}
