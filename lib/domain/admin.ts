import { z } from "zod";

export const reviewDecisionSchema = z
  .object({
    companionId: z.uuid(),
    decision: z.enum(["approve", "reject"]),
    note: z.string().trim().max(500, "TEXT_TOO_LONG").optional().default(""),
  })
  .refine((v) => v.decision === "approve" || v.note.length > 0, { message: "NOTE_REQUIRED", path: ["note"] });

export const userStatusSchema = z.object({
  userId: z.uuid(),
  status: z.enum(["active", "suspended"]),
});

export const errandTypeSchema = z.object({
  id: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().positive().optional()),
  name_th: z.string().trim().min(2, "ERRAND_NAME_REQUIRED").max(60, "TEXT_TOO_LONG"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "INVALID_SLUG")
    .max(40, "INVALID_SLUG"),
  description: z.string().trim().max(300, "TEXT_TOO_LONG").optional().default(""),
  sort_order: z.coerce.number({ error: "INVALID_SORT_ORDER" }).int("INVALID_SORT_ORDER").min(0, "INVALID_SORT_ORDER").max(999, "INVALID_SORT_ORDER"),
  is_active: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
});

export type ErrandTypeInput = z.infer<typeof errandTypeSchema>;

/**
 * Free-text search for PostgREST `or=(…ilike…)` filters: characters that carry meaning in the
 * filter grammar (comma, parentheses, wildcard, backslash, quotes) are dropped.
 */
export function sanitizeSearch(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[,()*%\\"':.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export type DashboardStats = {
  users_by_role: Record<string, number>;
  suspended_users: number;
  companions_by_status: Record<string, number>;
  bookings_by_status: Record<string, number>;
  bookings_last_14_days: { day: string; total: number }[];
  bookings_by_errand: { name: string; total: number }[];
  completed_revenue_estimate: number;
  average_rating: number;
};

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, toNumber(v)]));
}

/** The RPC returns jsonb; normalize it so the UI never sees undefined or string numbers. */
export function parseDashboardStats(raw: unknown): DashboardStats {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const list = (v: unknown) => (Array.isArray(v) ? (v as Record<string, unknown>[]) : []);
  return {
    users_by_role: toCounts(r.users_by_role),
    suspended_users: toNumber(r.suspended_users),
    companions_by_status: toCounts(r.companions_by_status),
    bookings_by_status: toCounts(r.bookings_by_status),
    bookings_last_14_days: list(r.bookings_last_14_days).map((d) => ({ day: String(d.day), total: toNumber(d.total) })),
    bookings_by_errand: list(r.bookings_by_errand).map((d) => ({ name: String(d.name), total: toNumber(d.total) })),
    completed_revenue_estimate: toNumber(r.completed_revenue_estimate),
    average_rating: toNumber(r.average_rating),
  };
}

export function sumCounts(counts: Record<string, number>, keys?: string[]): number {
  return Object.entries(counts)
    .filter(([k]) => !keys || keys.includes(k))
    .reduce((sum, [, v]) => sum + v, 0);
}
