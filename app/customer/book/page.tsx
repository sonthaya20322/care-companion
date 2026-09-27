import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { PageHeading } from "@/components/area/AreaShell";
import { formatBaht } from "@/lib/domain/booking";
import { bangkokDateString, defaultStart, earliestStart } from "@/lib/domain/booking-form";
import { bookingRules } from "@/lib/domain/booking";
import { getErrandTypes, getLocations } from "@/lib/services/catalog";
import { getPublicCompanion } from "@/lib/services/companions";
import { requireRole } from "@/lib/services/guard";
import { BookingForm } from "./BookingForm";

export const metadata: Metadata = { title: "จองผู้ช่วย" };

export default async function BookPage({ searchParams }: PageProps<"/customer/book">) {
  const profile = await requireRole("customer", "/customer/book");
  const params = await searchParams;
  const companionId = typeof params.companion === "string" ? params.companion : null;

  const [errandTypes, locations, companion] = await Promise.all([
    getErrandTypes(),
    getLocations(),
    companionId ? getPublicCompanion(companionId) : Promise.resolve(null),
  ]);

  const pickupLocations = companion
    ? locations
        .map((p) => ({ ...p, districts: p.districts.filter((d) => companion.district_ids.includes(d.id)) }))
        .filter((p) => p.districts.length > 0)
    : locations;

  const now = new Date();
  const minDate = bangkokDateString(now);
  const maxDate = bangkokDateString(new Date(now.getTime() + bookingRules.maxAdvanceDays * 24 * 60 * 60 * 1000));

  return (
    <>
      <PageHeading
        title={companion ? "ส่งคำขอจองผู้ช่วย" : "โพสต์คำขอหาผู้ช่วย"}
        description={
          companion
            ? "ผู้ช่วยจะได้รับคำขอและตอบรับหรือปฏิเสธ คุณติดตามสถานะได้ในหน้านัดหมายของฉัน"
            : "คำขอจะแสดงให้ผู้ช่วยที่ให้บริการในเขตจุดรับเห็น คนแรกที่กดรับจะเป็นผู้ช่วยของนัดนี้"
        }
      />

      {companionId && !companion && (
        <p role="alert" className="mb-6 rounded-control bg-yamabuki-bg px-4 py-3 text-yamabuki">
          ผู้ช่วยคนนี้ไม่พร้อมรับงานในขณะนี้ คุณยังโพสต์คำขอให้ผู้ช่วยในพื้นที่ได้ หรือ{" "}
          <Link href="/companions" className="underline underline-offset-4">
            เลือกผู้ช่วยคนอื่น
          </Link>
        </p>
      )}

      {companion ? (
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-card bg-sakura-50 p-5">
          <Avatar name={companion.full_name} src={companion.avatar_url} />
          <div className="flex-1">
            <p className="font-display text-lg text-sumi">{companion.full_name}</p>
            <p className="text-sumi-soft">{formatBaht(companion.hourly_rate)} / ชั่วโมง</p>
          </div>
          <Link href="/customer/book" className="text-sora-700 underline underline-offset-4">
            เปลี่ยนเป็นโพสต์คำขอแทน
          </Link>
        </div>
      ) : (
        <p className="mb-8 text-sumi-soft">
          อยากเลือกผู้ช่วยเอง?{" "}
          <Link href="/companions" className="text-sora-700 underline underline-offset-4">
            ดูรายชื่อผู้ช่วย
          </Link>
        </p>
      )}

      <BookingForm
        errandTypes={errandTypes.filter((type) => type.is_active)}
        pickupLocations={pickupLocations}
        allLocations={locations}
        companion={companion ? { id: companion.id, name: companion.full_name, hourlyRate: companion.hourly_rate } : null}
        defaultPhone={profile.phone ?? ""}
        minDate={minDate}
        maxDate={maxDate}
        earliestStartIso={earliestStart(now).toISOString()}
        defaultStart={defaultStart(now)}
      />
    </>
  );
}
