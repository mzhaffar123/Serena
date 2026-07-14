import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, ClipboardList, Mail, PenTool } from "lucide-react";
import AppSiteHeader from "@/components/AppSiteHeader";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import BookingActions from "@/components/BookingActions";
import { db } from "@/lib/db";

export default async function CounselorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role !== "COUNSELOR") {
    redirect("/dashboard");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pendingRequests, confirmedSessions, pendingCount, confirmedCount, articleCount] = await Promise.all([
    db.booking.findMany({
      where: {
        counselorId: session.user.id,
        status: "PENDING",
        scheduledAt: {
          gte: today,
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      take: 5,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
          },
        },
      },
    }),
    db.booking.findMany({
      where: {
        counselorId: session.user.id,
        status: "CONFIRMED",
        scheduledAt: {
          gte: today,
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      take: 5,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
          },
        },
      },
    }),
    db.booking.count({
      where: {
        counselorId: session.user.id,
        status: "PENDING",
        scheduledAt: {
          gte: today,
        },
      },
    }),
    db.booking.count({
      where: {
        counselorId: session.user.id,
        status: "CONFIRMED",
        scheduledAt: {
          gte: today,
        },
      },
    }),
    db.article.count({
      where: {
        authorId: session.user.id,
      },
    }),
  ]);

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
          <h1 className="font-rounded text-3xl font-bold text-indigo-950">Halo, {session.user.name}! 🌟</h1>
          <p className="mt-1 font-light text-indigo-950/60">Panel pengelolaan konseling Anda. Siap mendengarkan dan membimbing hari ini?</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex h-48 flex-col justify-between rounded-3xl border border-indigo-50 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-serena-lavender-50 text-serena-lavender-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="mb-1 font-rounded text-lg font-bold text-indigo-950">Jadwal Terkonfirmasi</h3>
              <p className="text-xs font-light text-indigo-950/50">Ada {confirmedCount} sesi yang telah dikonfirmasi untuk Anda tangani.</p>
            </div>
          </div>

          <div className="flex h-48 flex-col justify-between rounded-3xl border border-indigo-50 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-serena-sky-50 text-serena-sky-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="mb-1 font-rounded text-lg font-bold text-indigo-950">Permintaan Booking</h3>
              <p className="text-xs font-light text-indigo-950/50">Ada {pendingCount} permintaan baru yang menunggu konfirmasi Anda.</p>
            </div>
          </div>

          <Link href="/articles" className="group flex h-48 flex-col justify-between rounded-3xl border border-indigo-50 bg-white p-8 shadow-sm transition-all duration-300 hover:border-serena-sage-100 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-serena-sage-50 text-serena-sage-600 transition-transform group-hover:scale-110">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <h3 className="mb-1 font-rounded text-lg font-bold text-indigo-950">Artikel Anda</h3>
              <p className="text-xs font-light text-indigo-950/50">Saat ini Anda memiliki {articleCount} artikel edukasi yang tampil di Serena.</p>
            </div>
          </Link>
        </div>

        <section className="mt-10 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-serena-sky-600" />
              <h2 className="font-rounded text-2xl font-bold text-indigo-950">Permintaan Booking Masuk</h2>
            </div>

            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((booking) => (
                  <div key={booking.id} className="rounded-3xl border border-indigo-100 bg-indigo-50/40 p-5">
                    <div className="flex items-start gap-4">
                      {booking.patient.photoUrl ? (
                        <Image
                          src={booking.patient.photoUrl}
                          alt={booking.patient.name}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-2xl border border-serena-lavender-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-serena-lavender-50 font-bold text-serena-lavender-600">
                          {booking.patient.name[0]}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-rounded text-lg font-bold text-indigo-950">{booking.patient.name}</h3>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <div className="mt-2 inline-flex items-center gap-2 text-sm text-indigo-950/55">
                          <Mail className="h-4 w-4" />
                          {booking.patient.email}
                        </div>
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
                        {booking.notes && <p className="mt-3 text-sm leading-relaxed text-indigo-950/60">{booking.notes}</p>}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-indigo-100/70 pt-4">
                      <BookingActions
                        bookingId={booking.id}
                        actions={[
                          { status: "CONFIRMED", label: "Terima booking", tone: "success" },
                          { status: "CANCELLED", label: "Tolak", tone: "danger" },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/40 p-10 text-center text-sm text-indigo-950/60">
                Belum ada permintaan booking baru untuk saat ini.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-serena-sage-600" />
              <h2 className="font-rounded text-2xl font-bold text-indigo-950">Sesi Terkonfirmasi</h2>
            </div>

            {confirmedSessions.length > 0 ? (
              <div className="space-y-4">
                {confirmedSessions.map((booking) => (
                  <div key={booking.id} className="rounded-3xl border border-indigo-100 bg-white p-5">
                    <div className="flex items-start gap-4">
                      {booking.patient.photoUrl ? (
                        <Image
                          src={booking.patient.photoUrl}
                          alt={booking.patient.name}
                          width={52}
                          height={52}
                          className="h-14 w-14 rounded-2xl border border-serena-lavender-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-serena-lavender-50 font-bold text-serena-lavender-600">
                          {booking.patient.name[0]}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-rounded text-lg font-bold text-indigo-950">{booking.patient.name}</h3>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <p className="mt-2 text-sm font-medium text-indigo-950">
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

                    <div className="mt-5 border-t border-indigo-100/70 pt-4">
                      <BookingActions
                        bookingId={booking.id}
                        actions={[
                          { status: "COMPLETED", label: "Tandai selesai", tone: "primary" },
                          { status: "CANCELLED", label: "Batalkan", tone: "danger" },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/40 p-10 text-center text-sm text-indigo-950/60">
                Belum ada sesi terkonfirmasi. Permintaan yang Anda terima akan muncul di sini setelah disetujui.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
