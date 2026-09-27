import type { BookingStatus } from "@/lib/domain/booking";
import type { BookingQuery } from "@/lib/domain/booking-list";
import { createClient } from "@/lib/supabase/server";
import { getDistrictLabels, getErrandTypes } from "./catalog";

export type Booking = {
  id: string;
  customer_id: string;
  companion_id: string | null;
  errand_type_id: number;
  starts_at: string;
  ends_at: string;
  duration_hours: number;
  pickup_district_id: number;
  destination_name: string;
  destination_address: string | null;
  destination_district_id: number | null;
  details: string | null;
  special_needs: string | null;
  hourly_rate: number | null;
  estimated_price: number | null;
  /** Customer budget per hour on an open request; null = any rate. */
  max_hourly_rate: number | null;
  status: BookingStatus;
  cancel_reason: string | null;
  cancelled_by: string | null;
  reopened_as: string | null;
  created_at: string;
};

export type BookingView = Booking & {
  errandName: string;
  pickupLabel: string;
  destinationLabel: string | null;
};

export type PersonSummary = { id: string; full_name: string; avatar_url: string | null; phone?: string | null };

export type StatusLog = {
  id: number;
  from_status: BookingStatus | null;
  to_status: BookingStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};

export type BookingDetail = BookingView & {
  contact: { contact_phone: string; pickup_address: string } | null;
  logs: StatusLog[];
  review: { rating: number; comment: string | null; created_at: string } | null;
  customer: PersonSummary | null;
  companion: PersonSummary | null;
};

const columns =
  "id, customer_id, companion_id, errand_type_id, starts_at, ends_at, duration_hours, pickup_district_id, destination_name, destination_address, destination_district_id, details, special_needs, hourly_rate, estimated_price, max_hourly_rate, status, cancel_reason, cancelled_by, reopened_as, created_at";

function fail(what: string, error: { code?: string }): never {
  console.error(`${what} failed`, { code: error.code });
  throw new Error(`${what} failed`, { cause: error });
}

function toNumberOrNull(value: unknown): number | null {
  return value == null ? null : Number(value);
}

async function decorate(rows: Record<string, unknown>[]): Promise<BookingView[]> {
  const [labels, errands] = await Promise.all([getDistrictLabels(), getErrandTypes()]);
  const errandNames = new Map(errands.map((e) => [e.id, e.name_th]));
  return rows.map((row) => {
    const b = row as unknown as Booking;
    return {
      ...b,
      duration_hours: Number(b.duration_hours),
      hourly_rate: toNumberOrNull(b.hourly_rate),
      estimated_price: toNumberOrNull(b.estimated_price),
      max_hourly_rate: toNumberOrNull(b.max_hourly_rate),
      errandName: errandNames.get(b.errand_type_id) ?? "ธุระ",
      pickupLabel: labels.get(b.pickup_district_id) ?? "-",
      destinationLabel: b.destination_district_id ? (labels.get(b.destination_district_id) ?? null) : null,
    };
  });
}

/** Names/photos for companions: approved ones via the public view, others via profiles RLS (confirmed counterpart or admin). */
export async function getPeople(ids: string[]): Promise<Map<string, PersonSummary>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const people = new Map<string, PersonSummary>();
  if (unique.length === 0) return people;

  const supabase = await createClient();
  const [publicRows, profileRows] = await Promise.all([
    supabase.from("public_companions").select("id, display_name, avatar_url").in("id", unique),
    supabase.from("profiles").select("id, full_name, avatar_url, phone").in("id", unique),
  ]);
  if (publicRows.error) fail("getPeople public", publicRows.error);
  if (profileRows.error) fail("getPeople profiles", profileRows.error);
  for (const row of publicRows.data ?? []) {
    people.set(row.id, { id: row.id, full_name: row.display_name, avatar_url: row.avatar_url } as PersonSummary);
  }
  for (const row of profileRows.data ?? []) people.set(row.id, row as PersonSummary);
  return people;
}

export async function listBookings(
  filter: { customerId?: string; companionId?: string; query?: BookingQuery; limit?: number } = {},
) {
  const supabase = await createClient();
  let query = supabase.from("bookings").select(columns).order("starts_at", { ascending: false }).limit(filter.limit ?? 100);
  if (filter.customerId) query = query.eq("customer_id", filter.customerId);
  if (filter.companionId) query = query.eq("companion_id", filter.companionId);
  const q = filter.query;
  if (q) {
    query = query.eq("status", q.status);
    if (q.companion === "none") query = query.is("companion_id", null);
    if (q.companion === "assigned") query = query.not("companion_id", "is", null);
    if (q.startsAfter) query = query.gt("starts_at", q.startsAfter.toISOString());
    if (q.startsAtOrBefore) query = query.lte("starts_at", q.startsAtOrBefore.toISOString());
  }
  const { data, error } = await query;
  if (error) fail("listBookings", error);
  return decorate(data ?? []);
}

/** Full booking as the caller is allowed to see it; null when RLS hides it. */
export async function getBookingDetail(id: string): Promise<BookingDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bookings").select(columns).eq("id", id).maybeSingle();
  if (error) {
    if (error.code === "22P02") return null;
    fail("getBookingDetail", error);
  }
  if (!data) return null;

  const [view] = await decorate([data]);
  const [contact, logs, review, people] = await Promise.all([
    supabase.from("booking_contacts").select("contact_phone, pickup_address").eq("booking_id", id).maybeSingle(),
    supabase
      .from("booking_status_logs")
      .select("id, from_status, to_status, changed_by, note, created_at")
      .eq("booking_id", id)
      .order("created_at"),
    supabase.from("reviews").select("rating, comment, created_at").eq("booking_id", id).maybeSingle(),
    getPeople([view.customer_id, view.companion_id ?? ""]),
  ]);
  if (contact.error) fail("booking contact", contact.error);
  if (logs.error) fail("booking logs", logs.error);
  if (review.error) fail("booking review", review.error);

  return {
    ...view,
    contact: contact.data,
    logs: (logs.data ?? []) as StatusLog[],
    review: review.data,
    customer: people.get(view.customer_id) ?? null,
    companion: view.companion_id ? (people.get(view.companion_id) ?? null) : null,
  };
}

export type OpenRequest = {
  id: string;
  errand_name: string;
  starts_at: string;
  ends_at: string;
  duration_hours: number;
  pickup_district: string;
  pickup_province: string;
  destination_name: string;
  details: string | null;
  special_needs: string | null;
};

export async function listOpenRequests(): Promise<OpenRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_open_requests");
  if (error) fail("list_open_requests", error);
  return ((data ?? []) as OpenRequest[]).map((r) => ({ ...r, duration_hours: Number(r.duration_hours) }));
}
