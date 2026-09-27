import type { Metadata } from "next";
import { CompanionCard } from "@/components/companions/CompanionCard";
import { AreaSelect } from "@/components/companions/AreaSelect";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { areaFilterValue, districtIdsFor, parseAreaFilter } from "@/lib/domain/area";
import { getDistrictLabels, getLocations } from "@/lib/services/catalog";
import { listPublicCompanions } from "@/lib/services/companions";

export const metadata: Metadata = {
  title: "ค้นหาผู้ช่วยร่วมเดินทาง",
  description: "ค้นหาผู้ช่วยร่วมเดินทางที่ผ่านการตรวจสอบ ตามพื้นที่ที่คุณต้องการ",
};

export default async function CompanionsPage({ searchParams }: PageProps<"/companions">) {
  const params = await searchParams;
  const filter = parseAreaFilter(params.area);
  const [locations, labels] = await Promise.all([getLocations(), getDistrictLabels()]);
  const districtIds = districtIdsFor(filter, locations);
  const companions = districtIds?.length === 0 ? [] : await listPublicCompanions({ districtIds });

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="animate-rise max-w-2xl">
        <h1 className="text-3xl text-sumi md:text-4xl">ค้นหาผู้ช่วยร่วมเดินทาง</h1>
        <p className="mt-3 text-sumi-soft">
          ผู้ช่วยทุกคนยืนยันตัวตนและผ่านการอนุมัติจากผู้ดูแลระบบแล้ว เลือกพื้นที่จุดรับเพื่อดูผู้ช่วยที่ให้บริการใกล้คุณ
        </p>
      </div>

      <form method="get" className="mt-8 flex flex-col gap-3 rounded-card bg-sora-50 p-5 sm:flex-row sm:items-end">
        <Field id="area" label="พื้นที่จุดรับ" className="flex-1">
          <AreaSelect id="area" name="area" locations={locations} allowProvince defaultValue={areaFilterValue(filter)} />
        </Field>
        <SubmitButton>ค้นหา</SubmitButton>
      </form>

      <p className="mt-8 text-sumi-soft" aria-live="polite">
        พบผู้ช่วย {companions.length} คน
      </p>

      {companions.length === 0 ? (
        <EmptyState
          className="mt-4"
          title="ยังไม่มีผู้ช่วยในพื้นที่นี้"
          description="ลองเลือกพื้นที่ใกล้เคียง หรือโพสต์คำขอไว้ ผู้ช่วยในพื้นที่จะเห็นและกดรับงานได้"
          action={<ButtonLink href="/customer/book">โพสต์คำขอ</ButtonLink>}
        />
      ) : (
        <ul className="stagger mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companions.map((companion) => (
            <li key={companion.id} className="animate-rise">
              <CompanionCard
                companion={companion}
                areaLabels={companion.district_ids.map((id) => labels.get(id)?.split(",")[0] ?? "").filter(Boolean)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
