import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarClock, ClipboardList, Compass } from "lucide-react";
import AppSiteHeader from "@/components/AppSiteHeader";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import BookingActions from "@/components/BookingActions";
import { db } from "@/lib/db";
import RecommendedArticlesSection from "@/components/RecommendedArticlesSection";
import { getPersonalizedArticleRecommendations } from "@/lib/article-recommendations";

type PatientDashboardProps = {
  searchParams?: {
    booking?: string | string[];
  };
};

export default async function PatientDashboard({ searchParams }: PatientDashboardProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const bookingSuccess = Array.isArray(searchParams?.booking)
    ? searchParams?.booking.includes("success")
    : searchParams?.booking === "success";

  const [upcomingBookings, latestAssessment, recentMoodEntries, articles] = await Promise.all([
    db.booking.findMany({
      where: {
        patientId: session.user.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        scheduledAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      take: 4,
      include: {
        counselor: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            counselorProfile: {
              select: {
                specialization: true,
              },
            },
          },
        },
      },
    }),
    db.assessment.findFirst({
      where: {
        userId: session.user.id,
        type: "PHQ-9",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        score: true,
        result: true,
      },
    }),
    db.moodEntry.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 7,
      select: {
        moodScore: true,
        createdAt: true,
      },
    }),
    db.article.findMany({
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const personalizedArticles = getPersonalizedArticleRecommendations({
    articles,
    latestAssessment,
    recentMoodEntries,
    limit: 3,
  });

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-serena-cream-50 via-serena-lavender-50 to-serena-sky-50 text-indigo-950">
      <AppSiteHeader
        role={session.user.role}
        activeItem="dashboard"
        userName={session.user.name}
        photoUrl={session.user.photoUrl}
      />

      <main className="mx-auto flex-1 w-full max-w-6xl px-6 py-12">
        <div className="mb-10">
          <h1 className="font-rounded text-3xl font-bold text-indigo-950">Halo, {session.user.name}! 👋</h1>
          <p className="mt-1 font-light text-indigo-950/60">Bagaimana perasaan Anda hari ini? Mari luangkan waktu untuk diri sendiri.</p>
        </div>

        {bookingSuccess && (
          <div className="mb-8 rounded-3xl border border-serena-sage-100 bg-serena-sage-50 p-5 text-sm text-serena-sage-700 shadow-sm">
            Booking Anda berhasil dibuat dan sedang menunggu konfirmasi konselor. Detail sesi terbaru langsung muncul di dashboard ini.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/counselors" className="group flex h-48 flex-col justify-between rounded-3xl border border-indigo-50 bg-white p-8 shadow-sm transition-all duration-300 hover:border-serena-lavender-100 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-serena-lavender-50 text-serena-lavender-600 transition-transform group-hover:scale-110">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="mb-1 font-rounded text-lg font-bold text-indigo-950">Cari Konselor</h3>
              <p className="text-xs font-light text-indigo-950/50">Temukan psikolog profesional untuk berkonsultasi secara aman.</p>
            </div>
          </Link>

          <Link href="/assessment" className="group flex h-48 flex-col justify-between rounded-3xl border border-indigo-50 bg-white p-8 shadow-sm transition-all duration-300 hover:border-serena-sky-100 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-serena-sky-50 text-serena-sky-600 transition-transform group-hover:scale-110">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="mb-1 font-rounded text-lg font-bold text-indigo-950">Self-Assessment</h3>
              <p className="text-xs font-light text-indigo-950/50">Ukur tingkat kecemasan & depresi Anda dengan tes mandiri PHQ-9.</p>
            </div>
          </Link>

          <Link href="/articles" className="group flex h-48 flex-col justify-between rounded-3xl border border-indigo-50 bg-white p-8 shadow-sm transition-all duration-300 hover:border-serena-sage-100 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-serena-sage-50 text-serena-sage-600 transition-transform group-hover:scale-110">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="mb-1 font-rounded text-lg font-bold text-indigo-950">Artikel Edukasi</h3>
              <p className="text-xs font-light text-indigo-950/50">Baca tips-tips praktis untuk menjaga kesehatan mental Anda.</p>
            </div>
          </Link>
        </div>

        <div className="mt-10">
          <RecommendedArticlesSection
            title="Bacaan yang cocok dengan kondisi Anda saat ini"
            description={personalizedArticles.insight}
            recommendations={personalizedArticles.recommendations}
            ctaHref="/articles"
            ctaLabel="Lihat semua artikel"
          />
        </div>

        <section className="mt-10 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-serena-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-serena-sky-700">
                <CalendarClock className="h-4 w-4" />
                Konsultasi Mendatang
              </div>
              <h2 className="font-rounded text-2xl font-bold text-indigo-950">Pantau sesi yang sudah Anda jadwalkan</h2>
            </div>
            <Link href="/counselors" className="text-sm font-semibold text-serena-lavender-600 transition hover:text-serena-lavender-700">
              Booking sesi baru
            </Link>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="rounded-3xl border border-indigo-100 bg-indigo-50/40 p-5">
                  <div className="flex items-start gap-4">
                    {booking.counselor.photoUrl ? (
                      <Image
                        src={booking.counselor.photoUrl}
                        alt={booking.counselor.name}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-2xl border border-serena-lavender-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-serena-lavender-50 font-bold text-serena-lavender-600">
                        {booking.counselor.name[0]}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-rounded text-lg font-bold text-indigo-950">{booking.counselor.name}</h3>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                      <p className="mt-1 text-sm text-indigo-950/55">
                        {booking.counselor.counselorProfile?.specialization ?? "Konselor Serena"}
                      </p>
                      <p className="mt-3 text-sm font-medium text-indigo-950">
                        {new Date(booking.scheduledAt).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="mt-1 text-sm text-indigo-950/60">
                        Pukul {new Date(booking.scheduledAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-indigo-100/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={`/counselors/${booking.counselor.id}`} className="text-sm font-semibold text-serena-lavender-600 transition hover:text-serena-lavender-700">
                      Lihat profil konselor
                    </Link>
                    <BookingActions
                      bookingId={booking.id}
                      actions={[
                        {
                          status: "CANCELLED",
                          label: booking.status === "PENDING" ? "Batalkan permintaan" : "Batalkan sesi",
                          tone: "danger",
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/40 p-10 text-center">
              <p className="text-sm leading-relaxed text-indigo-950/60">
                Anda belum memiliki sesi konsultasi aktif. Mulai dari memilih konselor yang paling sesuai dengan kebutuhan Anda.
              </p>
              <Link
                href="/counselors"
                className="mt-5 inline-flex items-center justify-center rounded-2xl bg-indigo-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-serena-lavender-600"
              >
                Cari konselor sekarang
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
