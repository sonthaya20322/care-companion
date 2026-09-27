import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type PublicCompanion = {
  id: string;
  /** "ชื่อ + อักษรแรกของนามสกุล" computed in the DB; the full name is never public. */
  display_name: string;
  avatar_url: string | null;
  bio: string;
  experience_years: number;
  skills: string[];
  languages: string[];
  hourly_rate: number;
  has_vehicle: boolean;
  rating_avg: number;
  rating_count: number;
  verified_at: string | null;
  district_ids: number[];
};

export type AvailabilitySlot = {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type PublicReview = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
};

const companionColumns =
  "id, display_name, avatar_url, bio, experience_years, skills, languages, hourly_rate, has_vehicle, rating_avg, rating_count, verified_at, district_ids";

function toCompanion(row: Record<string, unknown>): PublicCompanion {
  return {
    ...(row as unknown as PublicCompanion),
    hourly_rate: Number(row.hourly_rate),
    rating_avg: Number(row.rating_avg),
  };
}

export async function listPublicCompanions(filter: { districtIds?: number[] } = {}): Promise<PublicCompanion[]> {
  const supabase = await createClient();
  let query = supabase
    .from("public_companions")
    .select(companionColumns)
    .order("rating_avg", { ascending: false })
    .order("rating_count", { ascending: false })
    .limit(60);
  if (filter.districtIds?.length) query = query.overlaps("district_ids", filter.districtIds);

  const { data, error } = await query;
  if (error) {
    console.error("listPublicCompanions failed", { code: error.code });
    throw new Error("listPublicCompanions failed", { cause: error });
  }
  return (data ?? []).map(toCompanion);
}

export const getPublicCompanion = cache(async (id: string): Promise<PublicCompanion | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("public_companions").select(companionColumns).eq("id", id).maybeSingle();
  if (error) {
    // Malformed uuid in the URL is a "not found", not a crash.
    if (error.code === "22P02") return null;
    console.error("getPublicCompanion failed", { code: error.code });
    throw new Error("getPublicCompanion failed", { cause: error });
  }
  return data ? toCompanion(data) : null;
});

export async function getCompanionAvailability(companionId: string): Promise<AvailabilitySlot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companion_availability")
    .select("id, day_of_week, start_time, end_time")
    .eq("companion_id", companionId)
    .order("day_of_week")
    .order("start_time");
  if (error) {
    console.error("getCompanionAvailability failed", { code: error.code });
    throw new Error("getCompanionAvailability failed", { cause: error });
  }
  return data as AvailabilitySlot[];
}

export async function getCompanionReviews(companionId: string, limit = 10): Promise<PublicReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("companion_id", companionId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getCompanionReviews failed", { code: error.code });
    throw new Error("getCompanionReviews failed", { cause: error });
  }
  return data as PublicReview[];
}
