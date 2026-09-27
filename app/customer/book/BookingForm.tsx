"use client";

import { useState } from "react";
import { AreaSelect } from "@/components/companions/AreaSelect";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/Field";
import { FormStatus } from "@/components/ui/FormStatus";
import { bookingRules, computeEndsAt, estimatePrice, formatBaht } from "@/lib/domain/booking";
import { companionRules } from "@/lib/domain/companion";
import {
  bangkokDateString,
  bangkokLocalToDate,
  bangkokTimeString,
  checkStart,
  durationOptions,
  fitsAvailability,
  overlappingRanges,
  summarizeAreaRates,
  type WeeklySlot,
} from "@/lib/domain/booking-form";
import { errorMessages } from "@/lib/domain/errors";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { ErrandType, ProvinceWithDistricts } from "@/lib/services/catalog";
import { formatClock, formatDateTime, formatHours } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { createBooking, type BookingFormState } from "./actions";

type BookingFormProps = {
  errandTypes: ErrandType[];
  pickupLocations: ProvinceWithDistricts[];
  allLocations: ProvinceWithDistricts[];
  companion: { id: string; name: string; hourlyRate: number } | null;
  defaultPhone: string;
  minDate: string;
  maxDate: string;
  earliestStartIso: string;
  defaultStart: { date: string; time: string };
  activeBookings: { startsAt: string; endsAt: string }[];
  availability: WeeklySlot[];
  /** Companion rates per district; empty for a direct request. */
  areaRates: Record<number, number[]>;
};

export function BookingForm({
  errandTypes,
  pickupLocations,
  allLocations,
  companion,
  defaultPhone,
  minDate,
  maxDate,
  earliestStartIso,
  defaultStart,
  activeBookings,
  availability,
  areaRates,
}: BookingFormProps) {
  const { state, formAction, pending, formRef, handleSubmit } = useActionForm<BookingFormState>(createBooking, {});
  const values = state.values ?? {};
  const [edited, setEdited] = useState<string[]>([]);
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    setSeenState(state);
    setEdited([]);
  }
  const errors = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).filter(([field]) => !edited.includes(field)),
  );
  const markEdited = (...fields: string[]) => setEdited((prev) => [...prev, ...fields]);
  const [date, setDate] = useState(values.date ?? defaultStart.date);
  const [time, setTime] = useState(values.time ?? defaultStart.time);
  const [duration, setDuration] = useState(Number(values.durationHours ?? 3));
  const [pickupDistrict, setPickupDistrict] = useState(values.pickupDistrictId ?? "");
  const [budgetText, setBudgetText] = useState(values.maxHourlyRate ?? "");
  const budget = /^\d+$/.test(budgetText.trim()) ? Number(budgetText.trim()) : null;
  const estimate = estimatePrice(companion?.hourlyRate ?? null, duration);
  const budgetCap = companion ? null : estimatePrice(budget, duration);
  const rates = companion ? null : summarizeAreaRates(areaRates, pickupDistrict ? Number(pickupDistrict) : null, budget);

  const earliest = new Date(earliestStartIso);
  const startsAt = bangkokLocalToDate(date, time);
  const referenceNow = new Date(earliest.getTime() - bookingRules.minLeadHours * 60 * 60 * 1000);
  const startProblem = startsAt ? checkStart(startsAt, referenceNow) : null;

  function pickEarliest() {
    setDate(bangkokDateString(earliest));
    setTime(bangkokTimeString(earliest));
    markEdited("date", "time");
  }

  const endsAt = startsAt ? computeEndsAt(startsAt, duration) : null;
  const endsNextDay = startsAt && endsAt ? bangkokDateString(endsAt) !== bangkokDateString(startsAt) : false;
  const chosen = startsAt && endsAt && !startProblem ? { startsAt, endsAt } : null;
  const clashes = chosen
    ? overlappingRanges(
        chosen,
        activeBookings.map((b) => ({ startsAt: new Date(b.startsAt), endsAt: new Date(b.endsAt) })),
      ).length
    : 0;
  const outsideHours = companion && chosen ? fitsAvailability(chosen, availability) === false : false;

  const input = (name: string, hint?: string) => ({
    id: name,
    name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": describedBy(name, { hint, error: errors[name] }),
  });

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
      <input type="hidden" name="companionId" value={companion?.id ?? ""} />

      {state.message && (
        <p
          role="alert"
          tabIndex={-1}
          data-error-anchor
          className="scroll-mt-24 rounded-control bg-beni-bg px-4 py-3 font-medium text-beni"
        >
          {state.message}
        </p>
      )}

      <fieldset className="flex flex-col gap-3" aria-describedby={errors.errandTypeId ? "errandTypeId-error" : undefined}>
        <legend className="font-display text-xl text-sumi">1. ธุระที่ต้องการให้ช่วย</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {errandTypes.map((type, index) => (
            <label
              key={type.id}
              className={cn(
                "flex min-h-12 cursor-pointer items-center rounded-full bg-washi-surface px-5 ring-1 ring-sakura-200 transition-colors",
                "hover:bg-sakura-50 has-[:checked]:bg-sakura-600 has-[:checked]:text-white has-[:checked]:ring-sakura-600",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sora-600",
              )}
              title={type.description}
            >
              <input
                type="radio"
                name="errandTypeId"
                value={type.id}
                defaultChecked={values.errandTypeId === String(type.id)}
                data-error-anchor={errors.errandTypeId && index === 0 ? "" : undefined}
                className="sr-only"
                required
              />
              {type.name_th}
            </label>
          ))}
        </div>
        {errors.errandTypeId && (
          <p id="errandTypeId-error" role="alert" className="text-sm font-medium text-beni">
            {errors.errandTypeId}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="font-display text-xl text-sumi">2. วันและเวลา</legend>
        <div className="mt-3 grid gap-5 sm:grid-cols-3">
          <Field id="date" label="วันที่" required error={errors.date}>
            <Input
              {...input("date")}
              type="date"
              min={minDate}
              max={maxDate}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                markEdited("date", "time");
              }}
              required
            />
          </Field>
          <Field id="time" label="เวลาเริ่ม" hint="เวลาที่ผู้ช่วยไปถึงจุดรับ" required error={errors.time}>
            <Input
              {...input("time", "hint")}
              type="time"
              step={1800}
              value={time}
              onChange={(event) => {
                setTime(event.target.value);
                markEdited("date", "time");
              }}
              required
            />
          </Field>
          <Field
            id="durationHours"
            label="ระยะเวลา"
            hint="รวมเวลาเดินทางไป-กลับ"
            required
            error={errors.durationHours}
          >
            <Select
              {...input("durationHours", "hint")}
              value={duration}
              onChange={(event) => {
                setDuration(Number(event.target.value));
                markEdited("durationHours");
              }}
            >
              {durationOptions().map((hours) => (
                <option key={hours} value={hours}>
                  {formatHours(hours)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div aria-live="polite" className="flex flex-col gap-2 rounded-control bg-sora-50 px-4 py-3 text-sm">
          {startsAt && endsAt && !startProblem ? (
            <p className="text-sumi">
              ผู้ช่วยจะไปถึงจุดรับ <strong>{formatDateTime(startsAt)}</strong> และอยู่กับคุณจนถึง{" "}
              <strong>
                {formatClock(endsAt)}
                {endsNextDay && " ของวันถัดไป"}
              </strong>{" "}
              ({formatHours(duration)})
            </p>
          ) : (
            startProblem && <p className="font-medium text-beni">{errorMessages[startProblem]}</p>
          )}
          {clashes > 0 && (
            <p className="font-medium text-yamabuki">
              ช่วงเวลานี้ซ้อนกับนัดอื่นของคุณ {clashes} รายการ ตรวจสอบก่อนส่งคำขอ
            </p>
          )}
          {outsideHours && (
            <p className="font-medium text-yamabuki">
              เวลานี้อยู่นอกช่วงที่คุณ{companion?.name}สะดวก ผู้ช่วยอาจปฏิเสธคำขอ ลองเลือกเวลาตามตารางในหน้าโปรไฟล์ผู้ช่วย
            </p>
          )}
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sumi-soft">
            <span>
              จองได้เร็วที่สุด {formatDateTime(earliest)} (ล่วงหน้าอย่างน้อย {bookingRules.minLeadHours} ชั่วโมง
              ไม่เกิน {bookingRules.maxAdvanceDays} วัน)
            </span>
            {startProblem && startProblem !== "START_TOO_FAR" && (
              <button
                type="button"
                onClick={pickEarliest}
                className="min-h-10 rounded-full px-3 font-medium text-sora-700 underline underline-offset-4 hover:bg-sora-100"
              >
                ใช้เวลานี้
              </button>
            )}
          </p>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="font-display text-xl text-sumi">3. จุดรับ</legend>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <Field
            id="pickupDistrictId"
            label="เขต/อำเภอ"
            hint={companion ? `เฉพาะพื้นที่ที่คุณ${companion.name}ให้บริการ` : undefined}
            required
            error={errors.pickupDistrictId}
          >
            <AreaSelect
              {...input("pickupDistrictId", companion ? "hint" : undefined)}
              locations={pickupLocations}
              value={pickupDistrict}
              onChange={(event) => {
                setPickupDistrict(event.target.value);
                markEdited("pickupDistrictId");
              }}
              required
            />
          </Field>
          <Field id="contactPhone" label="เบอร์ติดต่อในวันนัด" required error={errors.contactPhone}>
            <Input
              {...input("contactPhone")}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              defaultValue={values.contactPhone ?? defaultPhone}
              required
            />
          </Field>
        </div>
        <Field
          id="pickupAddress"
          label="ที่อยู่จุดรับ"
          hint="บ้านเลขที่ ซอย ถนน จุดสังเกต ผู้ช่วยจะเห็นหลังตอบรับแล้วเท่านั้น"
          required
          error={errors.pickupAddress}
        >
          <Textarea
            {...input("pickupAddress", "hint")}
            rows={2}
            maxLength={500}
            autoComplete="street-address"
            defaultValue={values.pickupAddress}
            required
          />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="font-display text-xl text-sumi">4. จุดหมาย</legend>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <Field id="destinationName" label="ชื่อสถานที่" required error={errors.destinationName}>
            <Input
              {...input("destinationName")}
              maxLength={200}
              placeholder="เช่น โรงพยาบาลศิริราช"
              defaultValue={values.destinationName}
              required
            />
          </Field>
          <Field id="destinationDistrictId" label="เขต/อำเภอ (ถ้าทราบ)" error={errors.destinationDistrictId}>
            <AreaSelect
              {...input("destinationDistrictId")}
              locations={allLocations}
              placeholder="ไม่ระบุ"
              defaultValue={values.destinationDistrictId}
            />
          </Field>
        </div>
        <Field id="destinationAddress" label="ที่อยู่หรือรายละเอียดสถานที่ (ถ้ามี)" error={errors.destinationAddress}>
          <Input {...input("destinationAddress")} maxLength={500} defaultValue={values.destinationAddress} />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="font-display text-xl text-sumi">5. สิ่งที่ผู้ช่วยควรรู้</legend>
        <Field
          id="details"
          label="รายละเอียดธุระ"
          hint="เช่น นัดพบแพทย์ 10:00 น. ตึก 2 ชั้น 3 ต้องรับยาหลังพบแพทย์"
          error={errors.details}
          className="mt-3"
        >
          <Textarea {...input("details", "hint")} rows={3} maxLength={2000} defaultValue={values.details} />
        </Field>
        <Field
          id="specialNeeds"
          label="ความต้องการพิเศษ"
          hint="เช่น ใช้รถเข็น เดินช้า ได้ยินไม่ชัด แพ้อาหาร"
          error={errors.specialNeeds}
        >
          <Textarea {...input("specialNeeds", "hint")} rows={2} maxLength={1000} defaultValue={values.specialNeeds} />
        </Field>
      </fieldset>

      {!companion && (
        <fieldset className="flex flex-col gap-5">
          <legend className="font-display text-xl text-sumi">6. งบประมาณ</legend>
          <Field
            id="maxHourlyRate"
            label="งบสูงสุดต่อชั่วโมง (ไม่บังคับ)"
            hint="เว้นว่างได้ ถ้าใส่ไว้ จะมีแค่ผู้ช่วยที่ราคาไม่เกินงบเห็นคำขอนี้ และคุณจ่ายตามราคาของผู้ช่วยที่กดรับ"
            error={errors.maxHourlyRate}
            className="mt-3 sm:max-w-xs"
          >
            <Input
              {...input("maxHourlyRate", "hint")}
              type="number"
              inputMode="numeric"
              min={companionRules.minRate}
              max={companionRules.maxRate}
              step={10}
              placeholder="เช่น 300"
              value={budgetText}
              onChange={(event) => {
                setBudgetText(event.target.value);
                markEdited("maxHourlyRate");
              }}
            />
          </Field>
          <div aria-live="polite" className="rounded-control bg-sora-50 px-4 py-3 text-sm">
            {!rates ? (
              <p className="text-sumi-soft">เลือกเขตจุดรับในข้อ 3 เพื่อดูราคาของผู้ช่วยในพื้นที่</p>
            ) : rates.count === 0 ? (
              <p className="font-medium text-yamabuki">
                ตอนนี้ยังไม่มีผู้ช่วยให้บริการในเขตนี้ คำขอจะรอจนกว่าจะมีผู้ช่วยในเขตนี้กดรับ
              </p>
            ) : (
              <>
                <p className="text-sumi">
                  ผู้ช่วยในเขตนี้ {rates.count} คน ราคา{" "}
                  <strong>
                    {rates.min === rates.max
                      ? formatBaht(rates.min)
                      : `${formatBaht(rates.min)} – ${formatBaht(rates.max)}`}
                  </strong>{" "}
                  ต่อชั่วโมง
                </p>
                {budget != null &&
                  (rates.withinBudget > 0 ? (
                    <p className="text-sumi-soft">อยู่ในงบของคุณ {rates.withinBudget} คน</p>
                  ) : (
                    <p className="font-medium text-yamabuki">
                      ยังไม่มีผู้ช่วยในเขตนี้ที่ราคาอยู่ในงบ ลองเพิ่มงบหรือเว้นว่างไว้ เพื่อให้มีคนเห็นคำขอ
                    </p>
                  ))}
              </>
            )}
          </div>
        </fieldset>
      )}

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center justify-between gap-4 border-t border-washi-line bg-washi/95 px-5 py-4 backdrop-blur-sm md:static md:mx-0 md:rounded-card md:bg-sora-50 md:px-6">
        <div>
          <p className="text-sm text-sumi-soft">ราคาประเมิน ({formatHours(duration)})</p>
          <p className="font-display text-2xl text-sakura-700" aria-live="polite">
            {budgetCap != null ? `ไม่เกิน ${formatBaht(budgetCap)}` : formatBaht(estimate)}
          </p>
          <p className="text-sm text-sumi-soft">ชำระกับผู้ช่วยโดยตรงหลังจบบริการ</p>
        </div>
        <Button type="submit" size="lg" loading={pending}>
          {pending ? "กำลังส่งคำขอ..." : companion ? `ส่งคำขอถึงคุณ${companion.name}` : "โพสต์คำขอ"}
        </Button>
      </div>
      <FormStatus message={Object.keys(errors).length > 0 ? "กรุณาตรวจสอบข้อมูลที่ไฮไลต์สีแดง" : undefined} />
    </form>
  );
}
