
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AppSiteHeader from "@/components/AppSiteHeader";
import AssessmentForm from "./AssessmentForm";

export default async function AssessmentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/assessment");
  }

  if (session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const [assessments, moodEntries] = await Promise.all([
    db.assessment.findMany({
      where: {
        userId: session.user.id,
        type: "PHQ-9",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        score: true,
        result: true,
        createdAt: true,
        type: true,
      },
    }),
    db.moodEntry.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      select: {
        id: true,
        moodScore: true,
        note: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-serena-cream-50 via-serena-lavender-50 to-serena-sky-50 text-indigo-950">
      <AppSiteHeader
        role={session.user.role}
        activeItem="assessment"
        userName={session.user.name}
        photoUrl={session.user.photoUrl}
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-serena-sky-100 bg-serena-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-serena-sky-700">
              <ClipboardList className="h-4 w-4" />
              Self-Assessment
            </div>
            <h1 className="font-rounded text-3xl font-bold text-indigo-950 sm:text-4xl">Pantau kondisi emosional Anda</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-indigo-950/60 sm:text-base">
              PHQ-9 membantu Anda menilai intensitas gejala depresi secara mandiri. Gunakan hasilnya sebagai bahan refleksi dan pertimbangkan berkonsultasi dengan profesional bila diperlukan.
            </p>
          </div>
        </div>

        <AssessmentForm
          initialAssessments={assessments.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          }))}
          initialMoodEntries={moodEntries.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
