import { displayStatus, rangesOverlap, type BookingStatus, type DisplayStatus } from "./booking";

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
