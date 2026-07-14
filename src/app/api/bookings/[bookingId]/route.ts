import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const counselorTransitions: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
};

export async function PATCH(
  req: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const { status } = await req.json();

    if (!status || !Object.values(BookingStatus).includes(status as BookingStatus)) {
      return NextResponse.json({ error: "Status booking tidak valid" }, { status: 400 });
    }

    const nextStatus = status as BookingStatus;

    const booking = await db.booking.findUnique({
      where: {
        id: params.bookingId,
      },
      select: {
        id: true,
        status: true,
        patientId: true,
        counselorId: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role === "COUNSELOR") {
      if (booking.counselorId !== session.user.id) {
        return NextResponse.json({ error: "Anda tidak berhak mengubah booking ini" }, { status: 403 });
      }

      if (!counselorTransitions[booking.status].includes(nextStatus)) {
        return NextResponse.json({ error: "Perubahan status tidak diizinkan" }, { status: 400 });
      }
    } else if (session.user.role === "PATIENT") {
      if (booking.patientId !== session.user.id) {
        return NextResponse.json({ error: "Anda tidak berhak mengubah booking ini" }, { status: 403 });
      }

      const patientCanCancel =
        nextStatus === BookingStatus.CANCELLED &&
        (booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED);

      if (!patientCanCancel) {
        return NextResponse.json({ error: "Pasien hanya dapat membatalkan booking yang masih aktif" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Role Anda tidak diizinkan untuk aksi ini" }, { status: 403 });
    }

    const updatedBooking = await db.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: nextStatus,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json({
      message: "Status booking berhasil diperbarui",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat memperbarui booking" }, { status: 500 });
  }
}
