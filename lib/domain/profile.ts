import { z } from "zod";

/** Removes spaces, dashes and dots people type in phone numbers ("081-234 5678"). */
export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-.]/g, "");
}

export const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .pipe(z.string().regex(/^0[0-9]{8,9}$/, "INVALID_PHONE"));

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "INVALID_NAME")
  .max(100, "INVALID_NAME");

export const onboardingSchema = z.object({
  role: z.enum(["customer", "companion"], { error: "INVALID_ROLE" }),
  fullName: fullNameSchema,
  phone: phoneSchema,
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const contactSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
});

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

/** First error code per field, for showing next to each input. */
export function fieldErrorCodes<K extends string>(error: z.ZodError): FieldErrors<K> {
  const result: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    result[key] ??= issue.message;
  }
  return result as FieldErrors<K>;
}
