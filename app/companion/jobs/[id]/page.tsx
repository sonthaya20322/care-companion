import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingDetailView } from "@/components/bookings/BookingDetailView";
import { getBookingDetail } from "@/lib/services/bookings";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "รายละเอียดงาน" };

export default async function CompanionJobPage({ params, searchParams }: PageProps<"/companion/jobs/[id]">) {
  const { id } = await params;
  const profile = await requireRole("companion", `/companion/jobs/${id}`);
  const [booking, query] = await Promise.all([getBookingDetail(id), searchParams]);
  if (!booking || booking.companion_id !== profile.id) notFound();

  return (
    <>
      <Link href="/companion/jobs" className="mb-4 inline-flex min-h-12 items-center text-sora-700 hover:underline">
        ← งานของฉัน
      </Link>
      {query.accepted === "1" && (
        <p role="status" className="animate-rise mb-6 rounded-card bg-matcha-bg p-5 font-medium text-matcha">
          รับงานเรียบร้อย ติดต่อผู้ใช้บริการเพื่อยืนยันจุดนัดพบได้เลย
        </p>
      )}
      <BookingDetailView booking={booking} viewer={{ id: profile.id, role: "companion" }} now={new Date()} />
    </>
  );
}
