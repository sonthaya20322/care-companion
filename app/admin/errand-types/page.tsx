import type { Metadata } from "next";
import { PageHeading } from "@/components/area/AreaShell";
import { ErrandTypeForm } from "@/components/admin/ErrandTypeForm";
import { Card } from "@/components/ui/Card";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { getErrandTypes } from "@/lib/services/catalog";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "ประเภทธุระ" };

export default async function ErrandTypesPage() {
  await requireRole("admin", "/admin/errand-types");
  const errands = await getErrandTypes();
  const nextSortOrder = Math.max(0, ...errands.map((e) => e.sort_order)) + 1;

  return (
    <>
      <PageHeading
        title="ประเภทธุระ"
        description="ตัวเลือกที่ลูกค้าเห็นตอนจอง ปิดประเภทที่ไม่ใช้แทนการลบ เพื่อไม่ให้นัดหมายเก่าเสียข้อมูล"
      />
      <div className="flex flex-col gap-6">
        <Card className="bg-sakura-50/60">
          <h2 className="mb-4 font-display text-xl text-sumi">เพิ่มประเภทใหม่</h2>
          <ErrandTypeForm nextSortOrder={nextSortOrder} />
        </Card>

        <ul className="flex flex-col gap-4">
          {errands.map((e) => (
            <li key={e.id}>
              <Card>
                <details className="group">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3">
                    <span>
                      <span className="font-medium text-sumi">{e.name_th}</span>
                      <span className="ml-2 text-sm text-sumi-soft">
                        {e.slug} · ลำดับ {e.sort_order}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <StatusStamp tone={e.is_active ? "matcha" : "sumi"} label={e.is_active ? "เปิดใช้" : "ปิดอยู่"} />
                      <span aria-hidden className="text-sora-700 transition-transform group-open:rotate-90">
                        ›
                      </span>
                      <span className="sr-only">แก้ไข</span>
                    </span>
                  </summary>
                  <div className="mt-4 border-t border-washi-line pt-4">
                    <ErrandTypeForm errand={e} />
                  </div>
                </details>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
