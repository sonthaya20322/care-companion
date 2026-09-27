import { bookingRules, displayStatus, rangesOverlap, type BookingStatus, type DisplayStatus } from "./booking";

export type BookingQuery = {
  status: BookingStatus;
  companion?: "none" | "assigned";
  startsAfter?: Date;
  startsAtOrBefore?: Date;
};

/** Translates a status people see (e.g. "expired") into the stored status plus a time window. */
export function queryForDisplayStatus(status: DisplayStatus, now: Date): BookingQuery {
  const deadline = new Date(now.getTime() + bookingRules.requestDeadlineHours * 60 * 60 * 1000);
  const noShow = new Date(now.getTime() - bookingRules.noShowAfterMinutes * 60 * 1000);
  switch (status) {
    case "requested":
      return { status: "requested", companion: "assigned", startsAfter: deadline };
    case "open":
      return { status: "requested", companion: "none", startsAfter: deadline };
    case "expired":
      return { status: "requested", startsAtOrBefore: deadline };
    case "accepted":
      return { status: "accepted", startsAfter: noShow };
    case "overdue":
      return { status: "accepted", startsAtOrBefore: noShow };
    default:
      return { status };
  }
}

type Timed = { starts_at: string; ends_at: string };

/** The first confirmed job (accepted / in progress) whose time overlaps the request; mirrors the DB exclusion constraint. */
export function findConflict<T extends Timed & { status: BookingStatus }>(request: Timed, jobs: T[]): T | null {
  const start = new Date(request.starts_at);
  const end = new Date(request.ends_at);
  return (
    jobs.find(
      (job) =>
        (job.status === "accepted" || job.status === "in_progress") &&
        rangesOverlap(start, end, new Date(job.starts_at), new Date(job.ends_at)),
    ) ?? null
  );
}

type Listed = { status: BookingStatus; starts_at: string; companion_id?: string | null };

function statusOf(b: Listed, now: Date): DisplayStatus {
  return displayStatus({ status: b.status, startsAt: new Date(b.starts_at), companionId: b.companion_id }, now);
}

const actionable: DisplayStatus[] = ["requested", "open", "accepted", "overdue", "in_progress"];

/** Upcoming = still actionable, soonest first; history keeps the incoming (newest first) order. */
export function splitBookings<T extends Listed>(bookings: T[], now: Date) {
  const upcoming: T[] = [];
  const past: T[] = [];
  for (const b of bookings) {
    if (actionable.includes(statusOf(b, now))) upcoming.push(b);
    else past.push(b);
  }
  upcoming.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  return { upcoming, past };
}

export function countByStatus<T extends Listed>(bookings: T[], now: Date) {
  const counts: Partial<Record<DisplayStatus, number>> = {};
  for (const b of bookings) {
    const status = statusOf(b, now);
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}
