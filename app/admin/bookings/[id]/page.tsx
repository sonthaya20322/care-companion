import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingDetailView } from "@/components/bookings/BookingDetailView";
import { getBookingDetail } from "@/lib/services/bookings";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "รายละเอียดนัดหมาย" };

export default async function AdminBookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
  const { id } = await params;
  const profile = await requireRole("admin", `/admin/bookings/${id}`);
  const booking = await getBookingDetail(id);
  if (!booking) notFound();

  return (
    <>
      <Link href="/admin/bookings" className="mb-4 inline-flex min-h-12 items-center text-sora-700 hover:underline">
        ← นัดหมายทั้งหมด
      </Link>
      <BookingDetailView booking={booking} viewer={{ id: profile.id, role: "admin" }} now={new Date()} />
    </>
  );
}
