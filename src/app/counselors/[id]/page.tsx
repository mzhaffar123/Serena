import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Clock3,

  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AppSiteHeader from "@/components/AppSiteHeader";
import PublicSiteHeader from "@/components/PublicSiteHeader";
import {
  getDateTimeKey,
  getUpcomingAvailabilityDays,
  normalizeAvailability,
} from "@/lib/booking";
import CounselorBookingPanel from "./CounselorBookingPanel";

export default async function CounselorDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const counselor = await db.user.findFirst({
    where: {
      id: params.id,
      role: "COUNSELOR",
      counselorProfile: {
        isNot: null,
      },
    },
    include: {
      counselorProfile: true,
      articles: {
        take: 3,
        orderBy: {
          publishedAt: "desc",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          publishedAt: true,
        },
      },
      counselorBookings: {
        where: {
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          scheduledAt: {
            gte: new Date(),
          },
        },
        select: {
          scheduledAt: true,
        },
      },
    },
  });

  if (!counselor || !counselor.counselorProfile) {
    notFound();
  }

  const reservedSlots = new Set(counselor.counselorBookings.map((booking) => getDateTimeKey(booking.scheduledAt)));
  const upcomingAvailability = getUpcomingAvailabilityDays(counselor.counselorProfile.availability, 14, reservedSlots);
  const weeklyAvailability = normalizeAvailability(counselor.counselorProfile.availability);
  const nextAvailableSlot = upcomingAvailability[0]?.slots[0];
  const nextAvailableLabel = nextAvailableSlot
    ? `${upcomingAvailability[0].fullLabel} • ${nextAvailableSlot.time}`
    : null;
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/counselors/${counselor.id}`)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-serena-cream-50 via-serena-lavender-50 to-serena-sky-50 text-indigo-950">
      {session?.user ? (
        <AppSiteHeader
          role={session.user.role as "PATIENT" | "COUNSELOR" | "ADMIN"}
          activeItem="counselors"
          userName={session.user.name}
          photoUrl={session.user.photoUrl}
        />
      ) : (
        <PublicSiteHeader activeItem="counselors" />
      )}

      <main className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/counselors" className="inline-flex items-center gap-2 text-sm font-medium text-serena-lavender-600 transition hover:text-serena-lavender-700">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar konselor
          </Link>
          {session?.user && (
            <Link
              href={session.user.role === "COUNSELOR" ? "/counselor" : "/patient"}
              className="text-sm font-medium text-indigo-950/55 transition hover:text-indigo-950"
            >
              Dashboard
            </Link>
          )}
        </div>
        <div className="mb-10 grid gap-8 xl:grid-cols-[1.35fr_0.9fr]">
          <section className="overflow-hidden rounded-[2rem] border border-indigo-100 bg-white shadow-sm">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="relative shrink-0">
                  {counselor.photoUrl ? (
                    <Image
                      src={counselor.photoUrl}
                      alt={counselor.name}
                      width={144}
                      height={144}
                      className="h-32 w-32 rounded-[2rem] border border-serena-lavender-100 object-cover shadow-sm sm:h-36 sm:w-36"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-serena-lavender-50 text-3xl font-bold text-serena-lavender-600 shadow-sm sm:h-36 sm:w-36">
                      {counselor.name[0]}
                    </div>
                  )}
                  {counselor.counselorProfile.isAvailable && (
                    <span className="absolute -bottom-1 -right-1 rounded-full border-4 border-white bg-serena-sage-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Online
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-serena-sage-100 bg-serena-sage-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-serena-sage-700">
                    <Sparkles className="h-4 w-4" />
                    Konselor Pilihan Serena
                  </div>
                  <h1 className="font-rounded text-3xl font-bold leading-tight text-indigo-950 sm:text-4xl">{counselor.name}</h1>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-indigo-950/65">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{counselor.counselorProfile.rating.toFixed(1)}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-serena-sky-50 px-3 py-1 text-serena-sky-700">
                      <BriefcaseBusiness className="h-4 w-4" />
                      {counselor.counselorProfile.experienceYrs} tahun pengalaman
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-serena-lavender-50 px-3 py-1 text-serena-lavender-700">
                      <Wallet className="h-4 w-4" />
                      Rp {counselor.counselorProfile.hourlyRate.toLocaleString("id-ID")} / jam
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {counselor.counselorProfile.specialization.split(",").map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-serena-lavender-100 bg-serena-lavender-50/60 px-3 py-1 text-xs font-medium text-serena-lavender-700"
                      >
                        {item.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-indigo-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-950/45">Respons aman</p>
                  <p className="mt-2 text-sm leading-relaxed text-indigo-950/70">Pendekatan hangat, profesional, dan berorientasi rasa aman klien.</p>
                </div>
                <div className="rounded-3xl bg-serena-sky-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-950/45">Slot terdekat</p>
                  <p className="mt-2 text-sm leading-relaxed text-indigo-950/70">{nextAvailableLabel ?? "Belum ada slot aktif dalam 14 hari ke depan."}</p>
                </div>
                <div className="rounded-3xl bg-serena-sage-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-950/45">Status layanan</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-serena-sage-700">
                    <ShieldCheck className="h-4 w-4" />
                    {counselor.counselorProfile.isAvailable ? "Sedang menerima booking" : "Belum menerima booking"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <CounselorBookingPanel
            counselorId={counselor.id}
            counselorName={counselor.name}
            hourlyRate={counselor.counselorProfile.hourlyRate}
            isAcceptingBookings={counselor.counselorProfile.isAvailable}
            availabilityDays={upcomingAvailability}
            nextAvailableLabel={nextAvailableLabel}
            isLoggedIn={Boolean(session?.user)}
            viewerRole={session?.user?.role ?? null}
            loginUrl={loginUrl}
          />
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-rounded text-2xl font-bold text-indigo-950">Tentang Konselor</h2>
            <p className="mt-4 text-sm leading-8 text-indigo-950/70 sm:text-base">{counselor.counselorProfile.bio}</p>
          </section>

          <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-serena-sky-600" />
              <h2 className="font-rounded text-2xl font-bold text-indigo-950">Jadwal Mingguan</h2>
            </div>
            <div className="mt-5 space-y-3">
              {Object.keys(weeklyAvailability).length > 0 ? (
                Object.entries(weeklyAvailability).map(([day, slots]) => (
                  <div key={day} className="rounded-2xl border border-indigo-100 bg-indigo-50/40 px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-indigo-950">{day}</p>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <span key={`${day}-${slot}`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-950/70">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-indigo-950/60">Jadwal mingguan belum tersedia.</p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-serena-lavender-600" />
            <h2 className="font-rounded text-2xl font-bold text-indigo-950">Artikel dari {counselor.name}</h2>
          </div>

          {counselor.articles.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {counselor.articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group rounded-3xl border border-indigo-100 bg-indigo-50/30 p-5 transition-all hover:-translate-y-1 hover:border-serena-lavender-100 hover:bg-white hover:shadow-sm"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-serena-sky-700">
                    {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="mt-3 font-rounded text-lg font-bold text-indigo-950 transition group-hover:text-serena-lavender-600">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-indigo-950/60">{article.summary}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-indigo-950/60">
              Konselor ini belum menerbitkan artikel. Anda tetap bisa langsung membuat booking sesi untuk mulai berkonsultasi.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
