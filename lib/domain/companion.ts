import { z } from "zod";

export type VerificationStatus = "draft" | "pending" | "approved" | "rejected";

export const verificationMeta: Record<
  VerificationStatus,
  { label: string; tone: "sumi" | "yamabuki" | "matcha" | "beni"; description: string }
> = {
  draft: { label: "ยังไม่ส่งตรวจสอบ", tone: "sumi", description: "กรอกโปรไฟล์และอัปโหลดเอกสาร แล้วกดส่งตรวจสอบ" },
  pending: { label: "รอตรวจสอบ", tone: "yamabuki", description: "ผู้ดูแลระบบกำลังตรวจสอบเอกสารของคุณ" },
  approved: { label: "อนุมัติแล้ว", tone: "matcha", description: "โปรไฟล์ของคุณแสดงในหน้าค้นหาและรับงานได้" },
  rejected: { label: "ไม่ผ่านการตรวจสอบ", tone: "beni", description: "แก้ไขตามหมายเหตุแล้วส่งตรวจสอบใหม่ได้" },
};

export const companionRules = {
  minBioLength: 20,
  maxBioLength: 1500,
  minRate: 50,
  maxRate: 5000,
  maxTags: 10,
  maxTagLength: 40,
} as const;

/** "ภาษาไทย, English ,ภาษาไทย" -> ["ภาษาไทย", "English"] */
export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(/[,\n]/)) {
    const tag = part.trim().replace(/\s+/g, " ");
    if (tag) seen.add(tag);
  }
  return [...seen];
}

const tagsSchema = z
  .string()
  .transform(parseTags)
  .pipe(
    z
      .array(z.string().max(companionRules.maxTagLength, "TAG_TOO_LONG"))
      .max(companionRules.maxTags, "TOO_MANY_TAGS"),
  );

export const companionProfileSchema = z.object({
  bio: z.string().trim().max(companionRules.maxBioLength, "BIO_TOO_LONG"),
  experienceYears: z.coerce.number({ error: "INVALID_EXPERIENCE" }).int("INVALID_EXPERIENCE").min(0, "INVALID_EXPERIENCE").max(60, "INVALID_EXPERIENCE"),
  hourlyRate: z.coerce.number({ error: "INVALID_RATE" }).min(companionRules.minRate, "INVALID_RATE").max(companionRules.maxRate, "INVALID_RATE"),
  skills: tagsSchema,
  languages: tagsSchema.pipe(z.array(z.string()).min(1, "LANGUAGE_REQUIRED")),
  hasVehicle: z.boolean(),
});

export type CompanionProfileInput = z.infer<typeof companionProfileSchema>;

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "INVALID_TIME");

export const availabilitySlotSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((slot) => slot.endTime > slot.startTime, { message: "END_BEFORE_START", path: ["endTime"] });

export type AvailabilitySlotInput = z.infer<typeof availabilitySlotSchema>;

export const serviceAreasSchema = z
  .array(z.coerce.number().int().positive())
  .max(60, "TOO_MANY_AREAS")
  .transform((ids) => [...new Set(ids)]);

export type VerificationChecklist = {
  bio: boolean;
  serviceArea: boolean;
  document: boolean;
};

/** Mirrors the checks in submit_companion_verification so the UI can guide before submitting. */
export function verificationChecklist(input: { bio: string; areaCount: number; documentPath: string | null }): VerificationChecklist {
  return {
    bio: input.bio.trim().length >= companionRules.minBioLength,
    serviceArea: input.areaCount > 0,
    document: Boolean(input.documentPath),
  };
}

export function canSubmitVerification(status: VerificationStatus, checklist: VerificationChecklist): boolean {
  return (status === "draft" || status === "rejected") && checklist.bio && checklist.serviceArea && checklist.document;
}
