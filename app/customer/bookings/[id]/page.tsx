import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingDetailView } from "@/components/bookings/BookingDetailView";
import { getBookingDetail } from "@/lib/services/bookings";
import { requireRole } from "@/lib/services/guard";

export const metadata: Metadata = { title: "รายละเอียดนัดหมาย" };

export default async function CustomerBookingPage({ params, searchParams }: PageProps<"/customer/bookings/[id]">) {
  const { id } = await params;
  const profile = await requireRole("customer", `/customer/bookings/${id}`);
  const [booking, query] = await Promise.all([getBookingDetail(id), searchParams]);
  if (!booking || booking.customer_id !== profile.id) notFound();

  return (
    <>
      <Link href="/customer/bookings" className="mb-4 inline-flex min-h-12 items-center text-sora-700 hover:underline">
        ← นัดหมายของฉัน
      </Link>
      <BookingDetailView
        booking={booking}
        viewer={{ id: profile.id, role: "customer" }}
        now={new Date()}
        justCreated={query.created === "1"}
      />
    </>
  );
}
