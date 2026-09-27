import type { ReactNode } from "react";
import { formatClock, formatDateTime, formatHours } from "@/lib/utils/format";

type Props = {
  errandName: string;
  startsAt: string;
  durationHours: number;
  pickup: string;
  destination: string;
  details: string | null;
  specialNeeds: string | null;
  meta?: ReactNode;
  /** The companion's own confirmed job that overlaps this request, if any. */
  conflict?: { starts_at: string; ends_at: string } | null;
  children: ReactNode;
};

/** A request a companion can act on straight from the list. */
export function RequestCard({
  errandName,
  startsAt,
  durationHours,
  pickup,
  destination,
  details,
  specialNeeds,
  meta,
  conflict,
  children,
}: Props) {
  return (
    <li className="flex flex-col gap-4 rounded-card bg-washi-surface p-5 shadow-soft ring-1 ring-washi-line">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg text-sumi">{errandName}</p>
          <p className="text-sumi-soft">
            <time dateTime={startsAt}>{formatDateTime(startsAt)}</time> · {formatHours(durationHours)}
          </p>
        </div>
        {meta}
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-sumi-soft">จุดรับ</dt>
          <dd className="text-sumi">{pickup}</dd>
        </div>
        <div>
          <dt className="text-sumi-soft">ปลายทาง</dt>
          <dd className="text-sumi">{destination}</dd>
        </div>
        {details && (
          <div className="sm:col-span-2">
            <dt className="text-sumi-soft">รายละเอียด</dt>
            <dd className="whitespace-pre-line text-sumi">{details}</dd>
          </div>
        )}
        {specialNeeds && (
          <div className="sm:col-span-2">
            <dt className="text-sumi-soft">ความต้องการพิเศษ</dt>
            <dd className="whitespace-pre-line text-sumi">{specialNeeds}</dd>
          </div>
        )}
      </dl>
      {conflict && (
        <p className="rounded-control bg-yamabuki-bg px-4 py-3 text-sm text-sumi">
          <span className="font-medium">ทับกับงานของคุณ</span> {formatDateTime(conflict.starts_at)} –{" "}
          {formatClock(conflict.ends_at)} จึงรับงานนี้ไม่ได้
        </p>
      )}
      {children}
    </li>
  );
}
