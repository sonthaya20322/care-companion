"use client";

import { useActionState } from "react";
import { FormStatus } from "@/components/ui/FormStatus";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionState } from "@/lib/services/action-helpers";
import type { AvailabilitySlot } from "@/lib/services/companions";
import { dayNames, formatTime } from "@/lib/utils/format";
import { saveAvailability } from "./actions";

const timeInput =
  "min-h-12 rounded-control bg-washi-surface px-3 text-sumi ring-1 ring-inset ring-washi-line focus:outline-none focus:ring-2 focus:ring-sora-600 disabled:opacity-50";

/** One time range per weekday keeps the form simple for everyone. */
export function AvailabilityForm({ slots }: { slots: AvailabilitySlot[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveAvailability, {});
  const errors = state.fieldErrors ?? {};
  const byDay = new Map(slots.map((slot) => [slot.day_of_week, slot]));
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <ul className="flex flex-col divide-y divide-washi-line rounded-card ring-1 ring-washi-line">
        {order.map((day) => {
          const slot = byDay.get(day);
          const errorId = `day-${day}-error`;
          return (
            <li key={day} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
              <label className="flex min-h-12 w-36 cursor-pointer items-center gap-3">
                <input type="checkbox" name={`day-${day}`} defaultChecked={Boolean(slot)} className="peer size-5 accent-sakura-600" />
                <span className="font-medium text-sumi">วัน{dayNames[day]}</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`start-${day}`}>
                  เวลาเริ่มวัน{dayNames[day]}
                </label>
                <input
                  id={`start-${day}`}
                  name={`start-${day}`}
                  type="time"
                  step={1800}
                  defaultValue={slot ? formatTime(slot.start_time) : "08:00"}
                  className={timeInput}
                  aria-describedby={errors[`day-${day}`] ? errorId : undefined}
                />
                <span aria-hidden className="text-sumi-soft">
                  ถึง
                </span>
                <label className="sr-only" htmlFor={`end-${day}`}>
                  เวลาสิ้นสุดวัน{dayNames[day]}
                </label>
                <input
                  id={`end-${day}`}
                  name={`end-${day}`}
                  type="time"
                  step={1800}
                  defaultValue={slot ? formatTime(slot.end_time) : "17:00"}
                  className={timeInput}
                  aria-describedby={errors[`day-${day}`] ? errorId : undefined}
                />
              </div>
              {errors[`day-${day}`] && (
                <p id={errorId} role="alert" className="w-full text-sm font-medium text-beni">
                  {errors[`day-${day}`]}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingLabel="กำลังบันทึก...">บันทึกช่วงเวลา</SubmitButton>
        <FormStatus ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
