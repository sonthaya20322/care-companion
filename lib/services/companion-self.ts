import type { VerificationStatus } from "@/lib/domain/companion";
import { createClient } from "@/lib/supabase/server";
import type { AvailabilitySlot } from "./companions";

export type MyCompanionProfile = {
  id: string;
  bio: string;
  experience_years: number;
  skills: string[];
  languages: string[];
  hourly_rate: number;
  has_vehicle: boolean;
  verification_status: VerificationStatus;
  verification_note: string | null;
  id_document_path: string | null;
  verified_at: string | null;
  rating_avg: number;
  rating_count: number;
};

function fail(what: string, error: { code?: string }): never {
  console.error(`${what} failed`, { code: error.code });
  throw new Error(`${what} failed`, { cause: error });
}

/** The signed-in companion's own row (RLS: read own). */
export async function getMyCompanionProfile(userId: string): Promise<MyCompanionProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companion_profiles")
    .select(
      "id, bio, experience_years, skills, languages, hourly_rate, has_vehicle, verification_status, verification_note, id_document_path, verified_at, rating_avg, rating_count",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) fail("getMyCompanionProfile", error);
  if (!data) return null;
  return { ...data, hourly_rate: Number(data.hourly_rate), rating_avg: Number(data.rating_avg) } as MyCompanionProfile;
}

export async function getMyServiceAreaIds(userId: string): Promise<number[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companion_service_areas")
    .select("district_id")
    .eq("companion_id", userId);
  if (error) fail("getMyServiceAreaIds", error);
  return (data ?? []).map((row) => row.district_id as number);
}

export async function getMyAvailability(userId: string): Promise<AvailabilitySlot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companion_availability")
    .select("id, day_of_week, start_time, end_time")
    .eq("companion_id", userId)
    .order("day_of_week")
    .order("start_time");
  if (error) fail("getMyAvailability", error);
  return data as AvailabilitySlot[];
}
