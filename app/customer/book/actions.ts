"use server";

import { redirect } from "next/navigation";
import { parseBookingForm } from "@/lib/domain/booking-form";
import { toUserMessage } from "@/lib/domain/errors";
import { actionProfile, fieldMessages, notAllowed, type ActionState } from "@/lib/services/action-helpers";
import { createClient } from "@/lib/supabase/server";

const fields = [
  "companionId",
  "errandTypeId",
  "date",
  "time",
  "durationHours",
  "pickupDistrictId",
  "pickupAddress",
  "contactPhone",
  "destinationName",
  "destinationAddress",
  "destinationDistrictId",
  "details",
  "specialNeeds",
  "maxHourlyRate",
] as const;

export type BookingFormState = ActionState & { values?: Partial<Record<(typeof fields)[number], string>> };

export async function createBooking(_prev: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const profile = await actionProfile("customer");
  if (!profile) return notAllowed;

  const values = Object.fromEntries(fields.map((key) => [key, formData.get(key)?.toString() ?? ""])) as Record<
    (typeof fields)[number],
    string
  >;
  const parsed = parseBookingForm(values, new Date());
  if (!parsed.success) return { fieldErrors: fieldMessages(parsed.error), values };

  const input = parsed.data;
  const supabase = await createClient();
  const { data: bookingId, error } = await supabase.rpc("create_booking", {
    p_companion_id: input.companionId,
    p_errand_type_id: input.errandTypeId,
    p_starts_at: input.startsAt.toISOString(),
    p_duration_hours: input.durationHours,
    p_pickup_district_id: input.pickupDistrictId,
    p_pickup_address: input.pickupAddress,
    p_contact_phone: input.contactPhone,
    p_destination_name: input.destinationName,
    p_destination_address: input.destinationAddress,
    p_destination_district_id: input.destinationDistrictId,
    p_details: input.details,
    p_special_needs: input.specialNeeds,
    p_max_hourly_rate: input.maxHourlyRate,
  });

  if (error || typeof bookingId !== "string") {
    console.error("create_booking failed", { code: error?.code });
    return { message: toUserMessage(error), values };
  }

  redirect(`/customer/bookings/${bookingId}?created=1`);
}
