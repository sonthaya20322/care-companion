import { displayStatus, type BookingStatus } from "./booking";

type Listed = { status: BookingStatus; starts_at: string };

/** Upcoming = still actionable, soonest first; history keeps the incoming (newest first) order. */
export function splitBookings<T extends Listed>(bookings: T[], now: Date) {
  const upcoming: T[] = [];
  const past: T[] = [];
  for (const b of bookings) {
    const status = displayStatus({ status: b.status, startsAt: new Date(b.starts_at) }, now);
    if (status === "requested" || status === "accepted" || status === "in_progress") upcoming.push(b);
    else past.push(b);
  }
  upcoming.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  return { upcoming, past };
}

export function countByStatus<T extends Listed>(bookings: T[], now: Date) {
  const counts: Partial<Record<ReturnType<typeof displayStatus>, number>> = {};
  for (const b of bookings) {
    const status = displayStatus({ status: b.status, startsAt: new Date(b.starts_at) }, now);
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}
