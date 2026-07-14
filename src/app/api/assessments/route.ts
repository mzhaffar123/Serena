import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PHQ9_RESULTS = [
  { min: 0, max: 4, label: "Minimal atau tidak ada gejala depresi" },
  { min: 5, max: 9, label: "Gejala depresi ringan" },
  { min: 10, max: 14, label: "Gejala depresi sedang" },
  { min: 15, max: 19, label: "Gejala depresi cukup berat" },
  { min: 20, max: 27, label: "Gejala depresi berat" },
] as const;

function getPhq9Result(score: number) {
  return PHQ9_RESULTS.find((item) => score >= item.min && score <= item.max)?.label ?? "Hasil tidak diketahui";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Hanya pasien yang dapat mengisi asesmen" }, { status: 403 });
    }

    const body = await req.json();
    const answers = body?.answers;

    if (!Array.isArray(answers) || answers.length !== 9) {
      return NextResponse.json({ error: "Jawaban PHQ-9 harus berjumlah 9" }, { status: 400 });
    }

    const normalizedAnswers = answers.map((answer) => Number(answer));
    const isInvalidAnswer = normalizedAnswers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3);

    if (isInvalidAnswer) {
      return NextResponse.json({ error: "Setiap jawaban harus bernilai 0 sampai 3" }, { status: 400 });
    }

    const score = normalizedAnswers.reduce((sum, answer) => sum + answer, 0);
    const result = getPhq9Result(score);

    const assessment = await db.assessment.create({
      data: {
        userId: session.user.id,
        type: "PHQ-9",
        score,
        result,
        answers: normalizedAnswers,
      },
      select: {
        id: true,
        score: true,
        result: true,
        createdAt: true,
        type: true,
      },
    });

    return NextResponse.json({
      message: "Hasil asesmen berhasil disimpan",
      assessment,
    });
  } catch (error) {
    console.error("Assessment submission error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat menyimpan asesmen" }, { status: 500 });
  }
}
