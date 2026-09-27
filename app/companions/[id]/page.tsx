import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { RatingText } from "@/components/companions/RatingText";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatBaht } from "@/lib/domain/booking";
import { getDistrictLabels } from "@/lib/services/catalog";
import { getCompanionAvailability, getCompanionReviews, getPublicCompanion } from "@/lib/services/companions";
import { dayNames, formatDate, formatTime } from "@/lib/utils/format";

export async function generateMetadata({ params }: PageProps<"/companions/[id]">): Promise<Metadata> {
  const { id } = await params;
  const companion = await getPublicCompanion(id);
  return { title: companion ? `ผู้ช่วย ${companion.display_name}` : "ไม่พบผู้ช่วย" };
}

export default async function CompanionDetailPage({ params }: PageProps<"/companions/[id]">) {
  const { id } = await params;
  const companion = await getPublicCompanion(id);
  if (!companion) notFound();

  const [availability, reviews, labels] = await Promise.all([
    getCompanionAvailability(id),
    getCompanionReviews(id),
    getDistrictLabels(),
  ]);
  const bookHref = `/customer/book?companion=${companion.id}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <Link href="/companions" className="text-sora-700 underline-offset-4 hover:underline">
        ← กลับไปหน้าค้นหา
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-8">
          <header className="animate-rise flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar name={companion.display_name} src={companion.avatar_url} size="lg" />
            <div>
              <h1 className="text-3xl text-sumi md:text-4xl">{companion.display_name}</h1>
              <p className="mt-1 text-sumi-soft">
                ผู้ช่วยร่วมเดินทาง · ประสบการณ์{" "}
                {companion.experience_years > 0 ? `${companion.experience_years} ปี` : "น้อยกว่า 1 ปี"}
              </p>
              <RatingText avg={companion.rating_avg} count={companion.rating_count} className="mt-1" />
            </div>
          </header>

          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-xl text-sumi">
              แนะนำตัว
            </h2>
            <p className="mt-2 whitespace-pre-line text-sumi-soft">{companion.bio}</p>
            {(companion.skills.length > 0 || companion.languages.length > 0) && (
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {companion.skills.length > 0 && (
                  <div>
                    <dt className="font-medium text-sumi">ความถนัด</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {companion.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-sakura-50 px-3 py-1 text-sm text-sakura-700 ring-1 ring-sakura-200">
                          {skill}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-sumi">ภาษา</dt>
                  <dd className="mt-1 text-sumi-soft">{companion.languages.join(", ")}</dd>
                </div>
              </dl>
            )}
          </section>

          <section aria-labelledby="areas-heading">
            <h2 id="areas-heading" className="text-xl text-sumi">
              พื้นที่ให้บริการ
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {companion.district_ids.map((districtId) => (
                <li key={districtId} className="rounded-full bg-sora-50 px-3 py-1 text-sm text-sora-700 ring-1 ring-sora-200">
                  {labels.get(districtId) ?? "-"}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="time-heading">
            <h2 id="time-heading" className="text-xl text-sumi">
              ช่วงเวลาที่สะดวก
            </h2>
            {availability.length === 0 ? (
              <p className="mt-2 text-sumi-soft">ผู้ช่วยยังไม่ได้ระบุเวลา สามารถส่งคำขอแล้วรอผู้ช่วยตอบรับได้</p>
            ) : (
              <table className="mt-3 w-full max-w-md text-left">
                <caption className="sr-only">ช่วงเวลาที่ผู้ช่วยสะดวกในแต่ละวัน</caption>
                <tbody>
                  {availability.map((slot) => (
                    <tr key={slot.id} className="border-b border-washi-line last:border-0">
                      <th scope="row" className="py-2 pr-4 font-medium text-sumi">
                        วัน{dayNames[slot.day_of_week]}
                      </th>
                      <td className="py-2 text-sumi-soft">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)} น.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="text-xl text-sumi">
              รีวิวจากผู้ใช้บริการ
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-2 text-sumi-soft">ยังไม่มีรีวิว</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {reviews.map((review) => (
                  <li key={review.id} className="rounded-card bg-washi-surface p-4 ring-1 ring-washi-line">
                    <p className="font-medium text-sumi">
                      <span aria-hidden className="text-yamabuki">
                        {"★".repeat(review.rating)}
                        <span className="text-washi-line">{"★".repeat(5 - review.rating)}</span>
                      </span>
                      <span className="sr-only">{review.rating} จาก 5 ดาว</span>
                      <span className="ml-2 text-sm font-normal text-sumi-soft">{formatDate(review.created_at)}</span>
                    </p>
                    {review.comment && <p className="mt-1 text-sumi-soft">{review.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Card className="animate-rise [animation-delay:120ms]">
            <p className="text-sumi-soft">อัตราค่าบริการ</p>
            <p className="mt-1">
              <span className="font-display text-3xl text-sakura-700">{formatBaht(companion.hourly_rate)}</span>
              <span className="text-sumi-soft"> / ชั่วโมง</span>
            </p>
            {companion.has_vehicle && <p className="mt-2 text-sm font-medium text-sora-700">มีรถรับส่ง</p>}
            <ButtonLink href={bookHref} size="lg" className="mt-6 w-full">
              ส่งคำขอจอง
            </ButtonLink>
            <p className="mt-4 text-sm text-sumi-soft">
              ราคาเป็นค่าประมาณ ชำระกับผู้ช่วยโดยตรงหลังจบบริการ ผู้ช่วยไม่ใช่บุคลากรทางการแพทย์
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
