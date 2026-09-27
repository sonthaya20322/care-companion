import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { bookingStatusMeta, displayStatus, formatBaht } from "@/lib/domain/booking";
import type { BookingView, PersonSummary } from "@/lib/services/bookings";
import { formatDateTime, formatHours } from "@/lib/utils/format";

type Props = {
  booking: BookingView;
  href: string;
  counterpart: PersonSummary | null;
  counterpartFallback: string;
  /** Extra line under the counterpart, e.g. the companion's name in the admin list. */
  extra?: string;
  now: Date;
};

export function BookingCard({ booking, href, counterpart, counterpartFallback, extra, now }: Props) {
  const meta =
    bookingStatusMeta[
      displayStatus({ status: booking.status, startsAt: new Date(booking.starts_at), companionId: booking.companion_id }, now)
    ];
  return (
    <li>
      <Link
        href={href}
        className="group flex flex-col gap-4 rounded-card bg-washi-surface p-5 shadow-soft ring-1 ring-washi-line transition-[transform,box-shadow] duration-200 ease-out-quart hover:-translate-y-0.5 hover:shadow-lift sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar name={counterpart?.full_name ?? "?"} src={counterpart?.avatar_url ?? null} size="sm" />
          <div className="min-w-0">
            <p className="font-display text-lg text-sumi group-hover:text-sakura-700">{booking.errandName}</p>
            <p className="text-sumi-soft">
              <time dateTime={booking.starts_at}>{formatDateTime(booking.starts_at)}</time> · {formatHours(booking.duration_hours)}
            </p>
            <p className="truncate text-sm text-sumi-soft">
              {counterpart?.full_name ?? counterpartFallback} · {booking.destination_name}
            </p>
            {extra && <p className="truncate text-sm text-sumi-soft">{extra}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <StatusStamp tone={meta.tone} label={meta.label} />
          <span className="text-sm text-sumi-soft">{formatBaht(booking.estimated_price)}</span>
        </div>
      </Link>
    </li>
  );
}