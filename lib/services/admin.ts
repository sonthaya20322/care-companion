import { parseDashboardStats, type DashboardStats } from "@/lib/domain/admin";
import type { VerificationStatus } from "@/lib/domain/companion";
import type { UserRole } from "@/lib/domain/roles";
import { createClient } from "@/lib/supabase/server";
import { getDistrictLabels } from "./catalog";
import type { MyCompanionProfile } from "./companion-self";

const DOCUMENT_BUCKET = "companion-documents";
const SIGNED_URL_SECONDS = 300;

function fail(what: string, error: { code?: string }): never {
  console.error(`${what} failed`, { code: error.code });
  throw new Error(`${what} failed`, { cause: error });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_dashboard_stats");
  if (error) fail("admin_dashboard_stats", error);
  return parseDashboardStats(data);
}

export type AdminUser = {
  id: string;
  role: UserRole | null;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  status: "active" | "suspended";
  created_at: string;
};

/** `search` must already be passed through sanitizeSearch. */
export async function listUsers(filter: { role?: UserRole | "none"; search?: string; limit?: number } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, role, email, full_name, phone, avatar_url, status, created_at")
    .order("created_at", { ascending: false })
    .limit(filter.limit ?? 200);
  if (filter.role === "none") query = query.is("role", null);
  else if (filter.role) query = query.eq("role", filter.role);
  if (filter.search) query = query.or(`full_name.ilike."*${filter.search}*",email.ilike."*${filter.search}*"`);
  const { data, error } = await query;
  if (error) fail("listUsers", error);
  return (data ?? []) as AdminUser[];
}

export type UserBookingSummary = { bookings: number; lateCancels: number };

export async function getUserBookingSummaries(ids: string[]): Promise<Map<string, UserBookingSummary>> {
  const summaries = new Map<string, UserBookingSummary>();
  if (ids.length === 0) return summaries;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_user_booking_summary", { p_user_ids: ids });
  if (error) fail("admin_user_booking_summary", error);
  for (const row of (data ?? []) as { user_id: string; bookings: number | string; late_cancels: number | string }[]) {
    summaries.set(row.user_id, { bookings: Number(row.bookings), lateCancels: Number(row.late_cancels) });
  }
  return summaries;
}

export type CompanionReviewItem = Omit<MyCompanionProfile, "id"> & {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  submitted_at: string | null;
};

const companionColumns =
  "id, bio, experience_years, skills, languages, hourly_rate, has_vehicle, verification_status, verification_note, id_document_path, verified_at, rating_avg, rating_count, updated_at";

async function withProfiles(rows: Record<string, unknown>[]): Promise<CompanionReviewItem[]> {
  if (rows.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url")
    .in(
      "id",
      rows.map((r) => r.id as string),
    );
  if (error) fail("companion profiles", error);
  const byId = new Map((data ?? []).map((p) => [p.id, p]));
  return rows.map((r) => {
    const p = byId.get(r.id as string);
    return {
      ...(r as unknown as MyCompanionProfile),
      hourly_rate: Number(r.hourly_rate),
      rating_avg: Number(r.rating_avg),
      full_name: p?.full_name ?? "",
      email: p?.email ?? "",
      phone: p?.phone ?? null,
      avatar_url: p?.avatar_url ?? null,
      submitted_at: (r.updated_at as string) ?? null,
    };
  });
}

export async function listCompanionsByStatus(status: VerificationStatus) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companion_profiles")
    .select(companionColumns)
    .eq("verification_status", status)
    .order("updated_at", { ascending: true })
    .limit(200);
  if (error) fail("listCompanionsByStatus", error);
  return withProfiles(data ?? []);
}

export type CompanionReviewDetail = CompanionReviewItem & {
  areaLabels: string[];
  documentUrl: string | null;
  documentIsPdf: boolean;
};

export async function getCompanionForReview(id: string): Promise<CompanionReviewDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("companion_profiles").select(companionColumns).eq("id", id).maybeSingle();
  if (error) {
    if (error.code === "22P02") return null;
    fail("getCompanionForReview", error);
  }
  if (!data) return null;

  const [[item], areas, labels] = await Promise.all([
    withProfiles([data]),
    supabase.from("companion_service_areas").select("district_id").eq("companion_id", id),
    getDistrictLabels(),
  ]);
  if (areas.error) fail("review areas", areas.error);

  let documentUrl: string | null = null;
  if (item.id_document_path) {
    const signed = await supabase.storage.from(DOCUMENT_BUCKET).createSignedUrl(item.id_document_path, SIGNED_URL_SECONDS);
    if (signed.error) console.error("sign companion document failed", { name: signed.error.name });
    else documentUrl = signed.data.signedUrl;
  }

  return {
    ...item,
    areaLabels: (areas.data ?? []).map((a) => labels.get(a.district_id as number) ?? "-"),
    documentUrl,
    documentIsPdf: item.id_document_path?.toLowerCase().endsWith(".pdf") ?? false,
  };
}
