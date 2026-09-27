import type { ReactNode } from "react";
import { Avatar } from "@/components/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { availableActions, bookingStatusMeta, displayStatus, formatBaht, type Actor } from "@/lib/domain/booking";
import { contactVisible, timelineText, visibleNote } from "@/lib/domain/booking-timeline";
import type { BookingDetail } from "@/lib/services/bookings";
import { formatClock, formatDateTime, formatHours } from "@/lib/utils/format";
import { BookingActions } from "./BookingActions";
import { Petals } from "./Petals";

type Props = {
  booking: BookingDetail;
  viewer: Actor;
  now: Date;
  justCreated?: boolean;
};

export function BookingDetailView({ booking, viewer, now, justCreated = false }: Props) {
  const startsAt = new Date(booking.starts_at);
  const status = displayStatus({ status: booking.status, startsAt }, now);
  const meta = bookingStatusMeta[status];
  const actions = availableActions(
    {
      status: booking.status,
      customerId: booking.customer_id,
      companionId: booking.companion_id,
      startsAt,
      hasReview: booking.review !== null,
    },
    viewer,
    now,
  );
  const parties = { customerId: booking.customer_id, companionId: booking.companion_id };
  const viewerIsCustomer = viewer.id === booking.customer_id;

  return (
    <div className="flex flex-col gap-6">
      {justCreated && (
        <div role="status" className="animate-rise relative overflow-hidden rounded-card bg-sakura-50 p-6 ring-1 ring-sakura-200">
          <Petals />
          <p className="font-display text-xl text-sakura-700">ส่งคำขอเรียบร้อยแล้ว</p>
          <p className="mt-1 text-sumi-soft">
            {booking.companion_id
              ? "เราแจ้งผู้ช่วยแล้ว เมื่อผู้ช่วยตอบรับ คุณจะเห็นเบอร์ติดต่อของกันและกันในหน้านี้"
              : "คำขอของคุณแสดงให้ผู้ช่วยในพื้นที่เห็นแล้ว ผู้ช่วยคนแรกที่รับงานจะเป็นผู้ดูแลคุณ"}
          </p>
        </div>
      )}

      <Card className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-sumi-soft">{booking.errandName}</p>
            <p className="font-display text-2xl text-sumi">
              <time dateTime={booking.starts_at}>{formatDateTime(booking.starts_at)}</time>
            </p>
            <p className="text-sumi-soft">
              ถึง {formatClock(booking.ends_at)} · {formatHours(booking.duration_hours)}
            </p>
          </div>
          <StatusStamp tone={meta.tone} label={meta.label} stamp={justCreated} />
        </div>
        <p className="text-sumi-soft">{meta.description}</p>
        {status === "expired" && viewerIsCustomer && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-yamabuki-bg px-4 py-3">
            <p className="text-sumi">
              คำขอนี้ปิดแล้ว ไม่มีการคิดค่าบริการ หากยังต้องการผู้ช่วย ลองจองใหม่โดยเลือกเวลาล่วงหน้ามากขึ้น
              หรือเลือกผู้ช่วยจากหน้าค้นหาโดยตรง
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/customer/book">จองใหม่</ButtonLink>
              <ButtonLink href="/companions" variant="secondary">
                ค้นหาผู้ช่วย
              </ButtonLink>
            </div>
          </div>
        )}
        {booking.status === "cancelled" && booking.cancel_reason && (
          <p className="rounded-control bg-beni-bg px-4 py-3 text-beni">เหตุผล: {booking.cancel_reason}</p>
        )}
        <BookingActions bookingId={booking.id} actions={actions} viewerRole={viewer.role} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <h2 className="font-display text-xl text-sumi">รายละเอียด</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail label="จุดรับ">
              {booking.pickupLabel}
              {booking.contact && <span className="block text-sumi-soft">{booking.contact.pickup_address}</span>}
            </Detail>
            <Detail label="ปลายทาง">
              {booking.destination_name}
              {(booking.destination_address || booking.destinationLabel) && (
                <span className="block text-sumi-soft">
                  {[booking.destination_address, booking.destinationLabel].filter(Boolean).join(" · ")}
                </span>
              )}
            </Detail>
            <Detail label="ค่าบริการโดยประมาณ">
              {formatBaht(booking.estimated_price)}
              <span className="block text-sm text-sumi-soft">ชำระกับผู้ช่วยโดยตรง</span>
            </Detail>
            {booking.contact && (
              <Detail label="เบอร์ติดต่อหน้างาน">
                <a href={`tel:${booking.contact.contact_phone}`} className="text-sora-700 underline-offset-4 hover:underline">
                  {booking.contact.contact_phone}
                </a>
              </Detail>
            )}
            {booking.details && (
              <Detail label="รายละเอียดเพิ่มเติม" wide>
                {booking.details}
              </Detail>
            )}
            {booking.special_needs && (
              <Detail label="ความต้องการพิเศษ" wide>
                {booking.special_needs}
              </Detail>
            )}
          </dl>
        </Card>

        <div className="flex flex-col gap-6">
          <Counterpart booking={booking} viewerIsCustomer={viewerIsCustomer} isAdmin={viewer.role === "admin"} />

          {booking.review && (
            <Card>
              <h2 className="font-display text-lg text-sumi">รีวิว</h2>
              <p className="mt-2 text-yamabuki" aria-label={`${booking.review.rating} จาก 5 ดาว`}>
                {"★".repeat(booking.review.rating)}
                <span className="text-washi-line">{"★".repeat(5 - booking.review.rating)}</span>
              </p>
              {booking.review.comment && <p className="mt-2 text-sumi">{booking.review.comment}</p>}
            </Card>
          )}

          <Card>
            <h2 className="font-display text-lg text-sumi">ความเคลื่อนไหว</h2>
            <ol className="mt-4 flex flex-col gap-4 border-l-2 border-sakura-100 pl-5">
              {booking.logs.map((log) => (
                <li key={log.id} className="relative">
                  <span aria-hidden className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-sakura-400 ring-4 ring-washi-surface" />
                  <p className="font-medium text-sumi">{timelineText(log, parties, viewer.id)}</p>
                  <p className="text-sm text-sumi-soft">
                    <time dateTime={log.created_at}>{formatDateTime(log.created_at)}</time>
                  </p>
                  {visibleNote(log) && <p className="mt-1 text-sm text-sumi-soft">“{visibleNote(log)}”</p>}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-sm text-sumi-soft">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sumi">{children}</dd>
    </div>
  );
}

function Counterpart({
  booking,
  viewerIsCustomer,
  isAdmin,
}: {
  booking: BookingDetail;
  viewerIsCustomer: boolean;
  isAdmin: boolean;
}) {
  const people = isAdmin
    ? [
        { role: "ผู้ใช้บริการ", person: booking.customer },
        { role: "ผู้ช่วย", person: booking.companion },
      ]
    : [{ role: viewerIsCustomer ? "ผู้ช่วย" : "ผู้ใช้บริการ", person: viewerIsCustomer ? booking.companion : booking.customer }];
  const shared = contactVisible(booking.status);

  return (
    <Card>
      {people.map(({ role, person }) => (
        <div key={role} className="flex items-center gap-4 [&+&]:mt-4">
          <Avatar name={person?.full_name ?? "?"} src={person?.avatar_url ?? null} size="sm" />
          <div className="min-w-0">
            <p className="text-sm text-sumi-soft">{role}</p>
            <p className="font-medium text-sumi">
              {person?.full_name ?? (role === "ผู้ช่วย" ? "ยังไม่มีผู้ช่วยรับงาน" : "ผู้ใช้บริการ")}
            </p>
            {person?.phone && (shared || isAdmin) && (
              <a href={`tel:${person.phone}`} className="text-sora-700 underline-offset-4 hover:underline">
                {person.phone}
              </a>
            )}
          </div>
        </div>
      ))}
      {!shared && !isAdmin && (
        <p className="mt-4 text-sm text-sumi-soft">เบอร์โทรจะแสดงเมื่อผู้ช่วยตอบรับนัดหมาย</p>
      )}
    </Card>
  );
}
