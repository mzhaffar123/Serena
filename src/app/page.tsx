import Link from "next/link";
import { Compass, Shield, Users, ArrowRight } from "lucide-react";
import LandingContactSection from "@/components/LandingContactSection";
import LandingFaqSection from "@/components/LandingFaqSection";
import PublicSiteHeader from "@/components/PublicSiteHeader";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicSiteHeader />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 lg:px-16 pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">


            <h1 className="font-rounded text-4xl sm:text-5xl md:text-6xl font-bold text-indigo-950 leading-tight">
              Tempat Aman untuk <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-serena-lavender-600 via-serena-sky-600 to-serena-sage-600">
                Bercerita dan Bertumbuh
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-indigo-950/60 font-light leading-relaxed">
              Serena menghubungkan Anda secara pribadi dengan psikolog profesional berlisensi secara real-time. Pantau emosi Anda setiap hari, ikuti tes asesmen mandiri, dan dapatkan ketenangan yang Anda cari.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-serena-sage-600 hover:bg-serena-sage-700 text-white font-medium px-8 py-4 shadow-lg shadow-serena-sage-500/15 hover:shadow-serena-sage-500/25 active:scale-[0.98] transition-all"
              >
                <span>Mulai Konsultasi</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/counselors"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white border border-indigo-100 hover:bg-indigo-50/30 text-indigo-950 font-medium px-8 py-4 transition-all"
              >
                Cari Psikolog
              </Link>
            </div>
          </div>

          {/* Calming Decorative Blobs */}
          <div className="absolute top-1/2 left-10 -translate-y-1/2 w-72 h-72 rounded-full bg-serena-lavender-200/20 blur-3xl -z-10" />
          <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-serena-sky-200/20 blur-3xl -z-10" />
        </section>

        {/* Value Proposition */}
        <section id="features" className="scroll-mt-28 border-t border-indigo-50/50 bg-white/40 px-6 py-20 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-rounded text-3xl font-bold text-center text-indigo-950 mb-16">
              Mengapa Memilih Serena?
            </h2>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <Link
                href="/register"
                className="group rounded-3xl border border-indigo-50 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md hover:border-serena-lavender-100 focus:outline-none focus:ring-2 focus:ring-serena-lavender-200"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-serena-lavender-50 text-serena-lavender-600 transition-transform group-hover:scale-110">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-rounded text-xl font-bold text-indigo-950">100% Rahasia & Aman</h3>
                <p className="text-sm leading-relaxed text-indigo-950/60 font-light">
                  Sesi obrolan dan riwayat konsultasi dienkripsi dengan standar keamanan tinggi. Privasi Anda adalah prioritas mutlak kami.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-serena-lavender-600">
                  Mulai dengan aman
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Feature 2 */}
              <Link
                href="/counselors"
                className="group rounded-3xl border border-indigo-50 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md hover:border-serena-sky-100 focus:outline-none focus:ring-2 focus:ring-serena-sky-200"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-serena-sky-50 text-serena-sky-600 transition-transform group-hover:scale-110">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-rounded text-xl font-bold text-indigo-950">Psikolog Terverifikasi</h3>
                <p className="text-sm leading-relaxed text-indigo-950/60 font-light">
                  Seluruh konselor dan psikolog kami memiliki izin praktik aktif dan terverifikasi untuk memberikan bantuan profesional yang tepat.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-serena-sky-600">
                  Lihat konselor
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Feature 3 */}
              <Link
                href="/assessment"
                className="group rounded-3xl border border-indigo-50 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md hover:border-serena-sage-100 focus:outline-none focus:ring-2 focus:ring-serena-sage-200"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-serena-sage-50 text-serena-sage-600 transition-transform group-hover:scale-110">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-rounded text-xl font-bold text-indigo-950">Mood Tracker & Asesmen</h3>
                <p className="text-sm leading-relaxed text-indigo-950/60 font-light">
                  Pantau perubahan suasana hati Anda sehari-hari secara berkala dan isi kuesioner psikologi mandiri (PHQ-9) kapan saja.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-serena-sage-600">
                  Buka assessment
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        <LandingFaqSection />
        <LandingContactSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-50 bg-white/20 py-8 text-center text-sm text-indigo-950/40">
        &copy; {new Date().getFullYear()} Serena. Dibuat dengan penuh perhatian untuk kesehatan mental Anda.
      </footer>
    </div>
  );
}
