"use server";

import { refresh } from "next/cache";
import { availabilitySlotSchema, companionProfileSchema, serviceAreasSchema } from "@/lib/domain/companion";
import { toUserMessage } from "@/lib/domain/errors";
import { actionProfile, fieldMessages, notAllowed, type ActionState } from "@/lib/services/action-helpers";
import { createClient } from "@/lib/supabase/server";

export async function saveCompanionDetails(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await actionProfile("companion");
  if (!profile) return notAllowed;

  const parsed = companionProfileSchema.safeParse({
    bio: formData.get("bio")?.toString() ?? "",
    experienceYears: formData.get("experienceYears")?.toString() ?? "",
    hourlyRate: formData.get("hourlyRate")?.toString() ?? "",
    skills: formData.get("skills")?.toString() ?? "",
    languages: formData.get("languages")?.toString() ?? "",
    hasVehicle: formData.get("hasVehicle") === "on",
  });
  if (!parsed.success) return { fieldErrors: fieldMessages(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("companion_profiles")
    .update({
      bio: parsed.data.bio,
      experience_years: parsed.data.experienceYears,
      hourly_rate: parsed.data.hourlyRate,
      skills: parsed.data.skills,
      languages: parsed.data.languages,
      has_vehicle: parsed.data.hasVehicle,
    })
    .eq("id", profile.id);
  if (error) {
    console.error("saveCompanionDetails failed", { code: error.code });
    return { message: toUserMessage(error) };
  }

  refresh();
  return { ok: true, message: "บันทึกข้อมูลแล้ว" };
}

export async function saveServiceAreas(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await actionProfile("companion");
  if (!profile) return notAllowed;

  const parsed = serviceAreasSchema.safeParse(formData.getAll("districtIds"));
  if (!parsed.success) return { message: fieldMessages(parsed.error).form ?? "ข้อมูลพื้นที่ไม่ถูกต้อง" };

  const supabase = await createClient();
  const { error: deleteError } = await supabase.from("companion_service_areas").delete().eq("companion_id", profile.id);
  if (deleteError) {
    console.error("saveServiceAreas delete failed", { code: deleteError.code });
    return { message: toUserMessage(deleteError) };
  }
  if (parsed.data.length > 0) {
    const { error } = await supabase
      .from("companion_service_areas")
      .insert(parsed.data.map((districtId) => ({ companion_id: profile.id, district_id: districtId })));
    if (error) {
      console.error("saveServiceAreas insert failed", { code: error.code });
      return { message: toUserMessage(error) };
    }
  }

  refresh();
  return { ok: true, message: `บันทึกพื้นที่ให้บริการ ${parsed.data.length} เขตแล้ว` };
}

export async function saveAvailability(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await actionProfile("companion");
  if (!profile) return notAllowed;

  const slots = [];
  const fieldErrors: Record<string, string> = {};
  for (let day = 0; day < 7; day++) {
    if (formData.get(`day-${day}`) !== "on") continue;
    const parsed = availabilitySlotSchema.safeParse({
      dayOfWeek: day,
      startTime: formData.get(`start-${day}`)?.toString() ?? "",
      endTime: formData.get(`end-${day}`)?.toString() ?? "",
    });
    if (parsed.success) slots.push(parsed.data);
    else fieldErrors[`day-${day}`] = Object.values(fieldMessages(parsed.error))[0];
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const supabase = await createClient();
  const { error: deleteError } = await supabase.from("companion_availability").delete().eq("companion_id", profile.id);
  if (deleteError) {
    console.error("saveAvailability delete failed", { code: deleteError.code });
    return { message: toUserMessage(deleteError) };
  }
  if (slots.length > 0) {
    const { error } = await supabase.from("companion_availability").insert(
      slots.map((slot) => ({
        companion_id: profile.id,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime,
      })),
    );
    if (error) {
      console.error("saveAvailability insert failed", { code: error.code });
      return { message: toUserMessage(error) };
    }
  }

  refresh();
  return { ok: true, message: "บันทึกช่วงเวลาที่สะดวกแล้ว" };
}
