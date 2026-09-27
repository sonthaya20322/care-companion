import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { formatBaht } from "@/lib/domain/booking";
import type { PublicCompanion } from "@/lib/services/companions";
import { RatingText } from "./RatingText";

type CompanionCardProps = {
  companion: PublicCompanion;
  areaLabels: string[];
};

export function CompanionCard({ companion, areaLabels }: CompanionCardProps) {
  const shownAreas = areaLabels.slice(0, 3);
  const moreAreas = areaLabels.length - shownAreas.length;

  return (
    <article className="group relative flex h-full flex-col rounded-card bg-washi-surface p-6 shadow-soft ring-1 ring-washi-line transition-[transform,box-shadow] duration-200 ease-out-quart hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-4">
        <Avatar name={companion.display_name} src={companion.avatar_url} />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl text-sumi">
            <Link href={`/companions/${companion.id}`} className="after:absolute after:inset-0 after:rounded-card">
              {companion.display_name}
            </Link>
          </h3>
          <p className="text-sumi-soft">
            ประสบการณ์ {companion.experience_years > 0 ? `${companion.experience_years} ปี` : "น้อยกว่า 1 ปี"}
          </p>
          <RatingText avg={companion.rating_avg} count={companion.rating_count} className="mt-1" />
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sumi-soft">{companion.bio}</p>

      <p className="mt-4 text-sm text-sumi-soft">
        <span className="font-medium text-sumi">พื้นที่: </span>
        {shownAreas.join(" · ")}
        {moreAreas > 0 && ` และอีก ${moreAreas} เขต`}
      </p>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-5">
        <p>
          <span className="font-display text-2xl text-sakura-700">{formatBaht(companion.hourly_rate)}</span>
          <span className="text-sumi-soft"> / ชั่วโมง</span>
        </p>
        {companion.has_vehicle && (
          <span className="rounded-full bg-sora-100 px-3 py-1 text-sm font-medium text-sora-700">มีรถรับส่ง</span>
        )}
      </div>
    </article>
  );
}
