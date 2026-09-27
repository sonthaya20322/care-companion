import { z } from "zod";
import { bookingRules, rangesOverlap, validateSchedule } from "./booking";
import { companionRules } from "./companion";
import { phoneSchema } from "./profile";

/** Thailand has no daylight saving, so local wall time is always UTC+7. */
export function bangkokLocalToDate(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const result = new Date(`${date}T${time}:00+07:00`);
  return Number.isNaN(result.getTime()) ? null : result;
}

/** "YYYY-MM-DD" of the given instant in Bangkok, for <input type="date"> min/max. */
export function bangkokDateString(instant: Date): string {
  return new Date(instant.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** "HH:MM" of the given instant in Bangkok. */
export function bangkokTimeString(instant: Date): string {
  return new Date(instant.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(11, 16);
}

const SLOT_MS = 30 * 60 * 1000;

/** Soonest bookable start: now + minimum lead time, rounded up to the next half hour. */
export function earliestStart(now: Date): Date {
  const min = now.getTime() + bookingRules.minLeadHours * 60 * 60 * 1000;
  return new Date(Math.ceil(min / SLOT_MS) * SLOT_MS);
}

const DEFAULT_TIME = "09:00";
const LATEST_DEFAULT_TIME = "17:00";

/** Pre-filled date/time: 09:00 on the earliest day, the earliest slot if 09:00 has passed, or next morning after 17:00. */
export function defaultStart(now: Date): { date: string; time: string } {
  const earliest = earliestStart(now);
  const date = bangkokDateString(earliest);
  const time = bangkokTimeString(earliest);
  if (time <= DEFAULT_TIME) return { date, time: DEFAULT_TIME };
  if (time <= LATEST_DEFAULT_TIME) return { date, time };
  return { date: bangkokDateString(new Date(earliest.getTime() + 24 * 60 * 60 * 1000)), time: DEFAULT_TIME };
}

export type StartProblem = "START_IN_PAST" | "START_TOO_SOON" | "START_TOO_FAR";

/** Start-time rule with a separate code for times that have already passed, so the message is not misleading. */
export function checkStart(startsAt: Date, now: Date): StartProblem | null {
  if (startsAt.getTime() <= now.getTime()) return "START_IN_PAST";
  const problem = validateSchedule(startsAt, bookingRules.minDurationHours, now);
  return problem === "START_TOO_SOON" || problem === "START_TOO_FAR" ? problem : null;
}

export type TimeRange = { startsAt: Date; endsAt: Date };

/** The customer's other bookings that overlap the chosen time; a warning only, the customer may still book. */
export function overlappingRanges(chosen: TimeRange, others: TimeRange[]): TimeRange[] {
  return others.filter((o) => rangesOverlap(chosen.startsAt, chosen.endsAt, o.startsAt, o.endsAt));
}

export type WeeklySlot = { day_of_week: number; start_time: string; end_time: string };

const minutesOf = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Whether the booking fits inside one of the companion's weekly slots, in Bangkok time.
 * Returns null when the companion has not stated any hours, so there is nothing to warn about.
 */
export function fitsAvailability(chosen: TimeRange, slots: WeeklySlot[]): boolean | null {
  if (slots.length === 0) return null;
  const local = new Date(chosen.startsAt.getTime() + 7 * 60 * 60 * 1000);
  const day = local.getUTCDay();
  const start = local.getUTCHours() * 60 + local.getUTCMinutes();
  const end = start + (chosen.endsAt.getTime() - chosen.startsAt.getTime()) / 60000;
  return slots.some((s) => s.day_of_week === day && minutesOf(s.start_time) <= start && end <= minutesOf(s.end_time));
}

export type AreaRates = { count: number; min: number; max: number; withinBudget: number };

/**
 * Hourly rates of the companions serving one pickup district, so an open request can show a price range.
 * `ratesByDistrict` holds each district's rates; returns null before a district is chosen.
 */
export function summarizeAreaRates(
  ratesByDistrict: Record<number, number[]>,
  districtId: number | null,
  budget: number | null,
): AreaRates | null {
  if (districtId == null) return null;
  const rates = ratesByDistrict[districtId] ?? [];
  if (rates.length === 0) return { count: 0, min: 0, max: 0, withinBudget: 0 };
  return {
    count: rates.length,
    min: Math.min(...rates),
    max: Math.max(...rates),
    withinBudget: budget == null ? rates.length : rates.filter((rate) => rate <= budget).length,
  };
}

/** Groups companions' hourly rates by each district they serve. */
export function ratesByDistrict(companions: { hourly_rate: number; district_ids: number[] }[]): Record<number, number[]> {
  const result: Record<number, number[]> = {};
  for (const companion of companions) {
    for (const districtId of companion.district_ids) {
      (result[districtId] ??= []).push(companion.hourly_rate);
    }
  }
  return result;
}

export function durationOptions(): number[] {
  const options: number[] = [];
  for (let h = bookingRules.minDurationHours; h <= bookingRules.maxDurationHours; h += bookingRules.durationStepHours) {
    options.push(h);
  }
  return options;
}

const optionalText = (max: number, code: string) =>
  z
    .string()
    .trim()
    .max(max, code)
    .transform((v) => (v === "" ? null : v));

const optionalId = z
  .string()
  .transform((v) => (v === "" ? null : Number(v)))
  .pipe(z.number().int().positive().nullable());

const optionalBudget = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .pipe(
    z
      .number({ error: "INVALID_BUDGET" })
      .int("INVALID_BUDGET")
      .min(companionRules.minRate, "INVALID_BUDGET")
      .max(companionRules.maxRate, "INVALID_BUDGET")
      .nullable(),
  );

export const bookingFormSchema = z
  .object({
    companionId: z
      .string()
      .transform((v) => (v === "" ? null : v))
      .pipe(z.uuid().nullable()),
    errandTypeId: z.coerce.number({ error: "INVALID_ERRAND_TYPE" }).int().positive("INVALID_ERRAND_TYPE"),
    date: z.string().min(1, "DATE_REQUIRED"),
    time: z.string().min(1, "TIME_REQUIRED"),
    durationHours: z.coerce.number({ error: "INVALID_DURATION" }),
    pickupDistrictId: z.coerce.number({ error: "INVALID_DISTRICT" }).int().positive("INVALID_DISTRICT"),
    pickupAddress: z.string().trim().min(1, "PICKUP_REQUIRED").max(500, "TEXT_TOO_LONG"),
    contactPhone: phoneSchema,
    destinationName: z.string().trim().min(1, "DESTINATION_REQUIRED").max(200, "TEXT_TOO_LONG"),
    destinationAddress: optionalText(500, "TEXT_TOO_LONG"),
    destinationDistrictId: optionalId,
    details: optionalText(2000, "TEXT_TOO_LONG"),
    specialNeeds: optionalText(1000, "TEXT_TOO_LONG"),
    maxHourlyRate: optionalBudget.default(null),
  })
  .transform((value, ctx) => {
    const startsAt = bangkokLocalToDate(value.date, value.time);
    if (!startsAt) {
      ctx.addIssue({ code: "custom", message: "INVALID_TIME", path: ["time"] });
      return z.NEVER;
    }
    // A direct request already has the chosen companion's rate, so a budget does not apply.
    return { ...value, maxHourlyRate: value.companionId ? null : value.maxHourlyRate, startsAt };
  });

export type BookingFormInput = z.infer<typeof bookingFormSchema>;

/** Schema check plus the time-dependent rules, evaluated at `now`. */
export function parseBookingForm(raw: Record<string, string>, now: Date) {
  const parsed = bookingFormSchema.safeParse(raw);
  if (!parsed.success) return parsed;
  const scheduleError =
    validateSchedule(parsed.data.startsAt, parsed.data.durationHours, now) === "INVALID_DURATION"
      ? "INVALID_DURATION"
      : checkStart(parsed.data.startsAt, now);
  if (scheduleError) {
    const path = scheduleError === "INVALID_DURATION" ? "durationHours" : scheduleError === "START_TOO_FAR" ? "date" : "time";
    return {
      success: false as const,
      error: new z.ZodError([{ code: "custom", message: scheduleError, path: [path], input: undefined }]),
    };
  }
  return parsed;
}
