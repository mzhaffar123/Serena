import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Hanya pasien yang dapat mengisi mood tracker" }, { status: 403 });
    }

    const { moodScore, note } = await req.json();
    const normalizedScore = Number(moodScore);
    const normalizedNote = typeof note === "string" ? note.trim() : "";

    if (!Number.isInteger(normalizedScore) || normalizedScore < 1 || normalizedScore > 5) {
      return NextResponse.json({ error: "Skor mood harus bernilai 1 sampai 5" }, { status: 400 });
    }

    if (normalizedNote.length > 500) {
      return NextResponse.json({ error: "Catatan mood maksimal 500 karakter" }, { status: 400 });
    }

    const moodEntry = await db.moodEntry.create({
      data: {
        userId: session.user.id,
        moodScore: normalizedScore,
        note: normalizedNote || null,
      },
      select: {
        id: true,
        moodScore: true,
        note: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Mood berhasil disimpan",
      moodEntry,
    });
  } catch (error) {
    console.error("Mood tracker error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat menyimpan mood" }, { status: 500 });
  }
}
