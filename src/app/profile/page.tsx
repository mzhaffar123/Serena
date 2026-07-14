import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, CalendarDays, NotebookPen, UserSquare2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AppSiteHeader from "@/components/AppSiteHeader";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      counselorProfile: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const stats =
    user.role === "COUNSELOR"
      ? await Promise.all([
          db.booking.count({ where: { counselorId: user.id, status: "PENDING" } }),
          db.booking.count({ where: { counselorId: user.id, status: "CONFIRMED" } }),
          db.booking.count({ where: { counselorId: user.id, status: "COMPLETED" } }),
          db.article.count({ where: { authorId: user.id } }),
        ])
      : await Promise.all([
          db.booking.count({ where: { patientId: user.id, status: { in: ["PENDING", "CONFIRMED"] } } }),
          db.booking.count({ where: { patientId: user.id, status: "COMPLETED" } }),
          db.assessment.count({ where: { userId: user.id } }),
          db.moodEntry.count({ where: { userId: user.id } }),
        ]);

  const statCards =
    user.role === "COUNSELOR"
      ? [
          {
            label: "Booking Masuk",
            value: stats[0],
            icon: CalendarDays,
          },
          {
            label: "Sesi Terkonfirmasi",
            value: stats[1],
            icon: UserSquare2,
          },
          {
            label: "Sesi Selesai",
            value: stats[2],
            icon: BarChart3,
          },
          {
            label: "Artikel Ditulis",
            value: stats[3],
            icon: BookOpen,
          },
        ]
      : [
          {
            label: "Booking Aktif",
            value: stats[0],
            icon: CalendarDays,
          },
          {
            label: "Sesi Selesai",
            value: stats[1],
            icon: UserSquare2,
          },
          {
            label: "Assessment",
            value: stats[2],
            icon: BarChart3,
          },
          {
            label: "Catatan Mood",
            value: stats[3],
            icon: NotebookPen,
          },
        ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-serena-cream-50 via-serena-lavender-50 to-serena-sky-50 text-indigo-950">
      <AppSiteHeader
        role={user.role}
        activeItem="profile"
        userName={user.name}
        photoUrl={user.photoUrl}
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-serena-lavender-100 bg-serena-lavender-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-serena-lavender-700">
            <UserSquare2 className="h-4 w-4" />
            Profil Akun
          </div>
          <h1 className="font-rounded text-3xl font-bold text-indigo-950 sm:text-4xl">Kelola identitas dan informasi akun Anda</h1>
          <p className="mt-3 text-sm leading-relaxed text-indigo-950/60 sm:text-base">
            Pastikan informasi profil Anda selalu terbaru agar pengalaman di Serena tetap personal dan profesional.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-serena-lavender-600">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-indigo-950/55">{card.label}</p>
                <p className="mt-1 font-rounded text-3xl font-bold text-indigo-950">{card.value}</p>
              </div>
            );
          })}
        </div>

        <ProfileForm
          initialUser={{
            name: user.name,
            email: user.email,
            role: user.role,
            photoUrl: user.photoUrl,
            joinedAt: user.createdAt.toISOString(),
          }}
          initialCounselorProfile={
            user.counselorProfile
              ? {
                  specialization: user.counselorProfile.specialization,
                  bio: user.counselorProfile.bio,
                  experienceYrs: user.counselorProfile.experienceYrs,
                  hourlyRate: user.counselorProfile.hourlyRate,
                  isAvailable: user.counselorProfile.isAvailable,
                }
              : null
          }
        />
      </main>
    </div>
  );
}
