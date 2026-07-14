import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAvailableTimesForDate, parseScheduledAt } from "@/lib/booking";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Hanya pasien yang dapat membuat booking" }, { status: 403 });
    }

    const { counselorId, date, time, notes } = await req.json();
    const normalizedNotes = typeof notes === "string" ? notes.trim() : "";

    if (!counselorId || typeof counselorId !== "string" || !date || !time) {
      return NextResponse.json({ error: "Data booking belum lengkap" }, { status: 400 });
    }

    if (normalizedNotes.length > 1000) {
      return NextResponse.json({ error: "Catatan booking maksimal 1000 karakter" }, { status: 400 });
    }

    const scheduledAt = parseScheduledAt(date, time);

    if (!scheduledAt) {
      return NextResponse.json({ error: "Tanggal atau jam booking tidak valid" }, { status: 400 });
    }

    if (scheduledAt <= new Date()) {
      return NextResponse.json({ error: "Pilih jadwal yang masih akan datang" }, { status: 400 });
    }

    const counselor = await db.user.findFirst({
      where: {
        id: counselorId,
        role: "COUNSELOR",
      },
      include: {
        counselorProfile: true,
      },
    });

    if (!counselor || !counselor.counselorProfile) {
      return NextResponse.json({ error: "Konselor tidak ditemukan" }, { status: 404 });
    }

    if (!counselor.counselorProfile.isAvailable) {
      return NextResponse.json({ error: "Konselor sedang tidak menerima booking" }, { status: 400 });
    }

    const availableTimes = getAvailableTimesForDate(counselor.counselorProfile.availability, scheduledAt);

    if (!availableTimes.includes(time)) {
      return NextResponse.json({ error: "Slot yang dipilih tidak tersedia pada hari tersebut" }, { status: 400 });
    }

    const conflictingCounselorBooking = await db.booking.findFirst({
      where: {
        counselorId,
        scheduledAt,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    if (conflictingCounselorBooking) {
      return NextResponse.json({ error: "Slot ini sudah dipesan. Silakan pilih waktu lain." }, { status: 409 });
    }

    const conflictingPatientBooking = await db.booking.findFirst({
      where: {
        patientId: session.user.id,
        scheduledAt,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    if (conflictingPatientBooking) {
      return NextResponse.json({ error: "Anda sudah memiliki booking pada waktu yang sama." }, { status: 409 });
    }

    const booking = await db.booking.create({
      data: {
        patientId: session.user.id,
        counselorId,
        scheduledAt,
        notes: normalizedNotes || null,
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        counselor: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Booking berhasil dibuat dan menunggu konfirmasi konselor",
      booking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat membuat booking" }, { status: 500 });
  }
}
