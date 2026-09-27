"use client";

import Form from "next/form";
import { AreaSelect } from "@/components/companions/AreaSelect";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { ProvinceWithDistricts } from "@/lib/services/catalog";

type AreaFilterFormProps = {
  locations: ProvinceWithDistricts[];
  defaultValue: string;
};

/** Area filter that applies as soon as a value is picked; the button remains for keyboard and no-JS users. */
export function AreaFilterForm({ locations, defaultValue }: AreaFilterFormProps) {
  return (
    <Form
      action="/companions"
      scroll={false}
      className="mt-8 flex flex-col gap-3 rounded-card bg-sora-50 p-5 sm:flex-row sm:items-end"
    >
      <Field id="area" label="พื้นที่จุดรับ" className="flex-1">
        <AreaSelect
          id="area"
          name="area"
          locations={locations}
          allowProvince
          defaultValue={defaultValue}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        />
      </Field>
      <Button type="submit">ค้นหา</Button>
    </Form>
  );
}
