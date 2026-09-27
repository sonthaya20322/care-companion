import type { Metadata } from "next";
import { AreaFilterForm } from "@/components/companions/AreaFilterForm";
import { CompanionCard } from "@/components/companions/CompanionCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { areaFilterLabel, areaFilterValue, districtIdsFor, parseAreaFilter } from "@/lib/domain/area";
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
  const areaLabel = areaFilterLabel(filter, locations);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="animate-rise max-w-2xl">
        <h1 className="text-3xl text-sumi md:text-4xl">ค้นหาผู้ช่วยร่วมเดินทาง</h1>
        <p className="mt-3 text-sumi-soft">
          ผู้ช่วยทุกคนยืนยันตัวตนและผ่านการอนุมัติจากผู้ดูแลระบบแล้ว เลือกพื้นที่จุดรับเพื่อดูผู้ช่วยที่ให้บริการใกล้คุณ
        </p>
      </div>

      <AreaFilterForm key={areaFilterValue(filter)} locations={locations} defaultValue={areaFilterValue(filter)} />

      <p className="mt-8 text-sumi-soft" aria-live="polite">
        พบผู้ช่วย {companions.length} คน {areaLabel ? <>ที่ให้บริการใน<strong className="text-sumi">{areaLabel}</strong></> : "(ทุกพื้นที่)"}
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
