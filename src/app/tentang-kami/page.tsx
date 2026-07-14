import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Shield, Users } from "lucide-react";
import PublicSiteHeader from "@/components/PublicSiteHeader";

export const metadata: Metadata = {
  title: "Tentang Kami | Serena",
  description:
    "Kenali misi Serena dalam menghadirkan ruang dukungan kesehatan mental yang aman, hangat, dan mudah diakses.",
};

const impactStats = [
  {
    value: "75%",
    headline: "Masalah kesehatan mental mulai muncul pada usia 24 tahun.",
    description: "Dukungan sejak dini dapat membuat perbedaan seumur hidup.",
  },
  {
    value: "44%",
    headline: "Sebagian besar siswa melaporkan mengalami kecemasan atau depresi.",
    description: "Anda tidak sendirian dalam menempuh perjalanan ini.",
  },
  {
    value: "1 dari 3",
    headline: "Para profesional muda menghadapi kelelahan yang parah.",
    description: "Perawatan pencegahan membantu mempertahankan pertumbuhan jangka panjang.",
  },
] as const;

const featureCards = [
  {
    icon: Users,
    title: "Konselor yang dapat dipercaya",
    description:
      "Serena menghubungkan pengguna dengan konselor terverifikasi agar proses mencari bantuan terasa lebih tenang dan terarah.",
  },
  {
    icon: Compass,
    title: "Langkah kecil yang konsisten",
    description:
      "Dari assessment mandiri hingga mood tracker, kami membantu pengguna memahami pola emosi sebelum masalah terasa semakin berat.",
  },
  {
    icon: Shield,
    title: "Privasi sebagai fondasi",
    description:
      "Kami merancang pengalaman yang menjaga kerahasiaan pengguna, karena rasa aman adalah bagian penting dari proses pemulihan.",
  },
] as const;

const principles = [
  {
    title: "Empati lebih dulu",
    description:
      "Kami percaya setiap orang butuh ruang yang tidak menghakimi untuk mulai jujur pada dirinya sendiri.",
  },
  {
    title: "Akses yang lebih mudah",
    description:
      "Dukungan kesehatan mental seharusnya terasa dekat, sederhana, dan tidak membingungkan untuk diakses.",
  },
  {
    title: "Pendampingan berkelanjutan",
    description:
      "Serena bukan hanya untuk satu sesi, tetapi untuk membantu pengguna membangun kebiasaan yang lebih sehat dari waktu ke waktu.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicSiteHeader activeItem="about" />

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pb-20 pt-20 md:pb-28 md:pt-28 lg:px-16">
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-serena-sage-100 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-serena-sage-700 shadow-sm">
              Tentang Serena
            </div>

            <h1 className="mt-6 font-rounded text-4xl font-bold leading-tight text-indigo-950 sm:text-5xl md:text-6xl">
              Dukungan kesehatan mental yang <br />
              <span className="bg-gradient-to-r from-serena-lavender-600 via-serena-sky-600 to-serena-sage-600 bg-clip-text text-transparent">
                terasa lebih dekat dan manusiawi
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-indigo-950/60 sm:text-lg">
              Serena hadir untuk membantu lebih banyak orang menemukan ruang aman untuk memahami
              perasaan, mencari bantuan profesional, dan membangun kebiasaan merawat diri secara
              bertahap. Kami percaya dukungan yang baik harus terasa hangat, jelas, dan mudah
              dijangkau.
            </p>
          </div>

          <div className="absolute left-12 top-1/2 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-serena-lavender-200/20 blur-3xl" />
          <div className="absolute right-10 top-1/3 -z-10 h-80 w-80 rounded-full bg-serena-sky-200/20 blur-3xl" />
        </section>

        <section className="border-y border-serena-sage-100/70 bg-serena-sage-50/45 px-0 py-6">
          <div className="bg-white px-6 py-14 lg:px-16 lg:py-16">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-12 md:grid-cols-3 md:gap-10">
                {impactStats.map((stat) => (
                  <div key={stat.value} className="text-center">
                    <p className="font-rounded text-4xl font-bold tracking-tight text-indigo-950 sm:text-5xl">
                      {stat.value}
                    </p>
                    <p className="font-rounded mx-auto mt-4 max-w-[17rem] text-2xl font-semibold leading-[1.25] tracking-tight text-indigo-950 sm:max-w-[18rem] sm:text-[2.2rem] md:text-[2rem]">
                      {stat.headline}
                    </p>
                    <p className="mx-auto mt-4 max-w-[18rem] text-sm leading-7 text-indigo-950/55 sm:text-base">
                      {stat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h2 className="font-rounded text-3xl font-bold text-indigo-950 sm:text-4xl">
                Mengapa Serena dibangun
              </h2>
              <p className="mt-5 text-base leading-8 text-indigo-950/65">
                Banyak orang tahu bahwa mereka sedang lelah, cemas, atau kehilangan arah, tetapi
                tidak tahu harus mulai dari mana. Serena dibangun untuk menjembatani celah itu:
                menghadirkan tempat yang lebih ramah untuk memulai, memahami kondisi diri, dan
                mengambil langkah berikutnya dengan lebih percaya diri.
              </p>
              <p className="mt-4 text-base leading-8 text-indigo-950/65">
                Kami memadukan akses ke konselor, assessment mandiri, mood tracker, dan konten
                edukasi dalam satu pengalaman yang terasa tenang dan mudah dipakai. Tujuannya
                sederhana: membuat proses mencari bantuan tidak terasa berat sejak langkah pertama.
              </p>
            </div>

            <div className="grid gap-4">
              {featureCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-[1.75rem] border border-indigo-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-serena-sage-50 text-serena-sage-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-rounded text-xl font-bold text-indigo-950">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-indigo-950/60 sm:text-base">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-indigo-50/70 bg-white/45 px-6 py-20 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-rounded text-3xl font-bold text-indigo-950 sm:text-4xl">
                Prinsip yang kami pegang
              </h2>
              <p className="mt-4 text-base leading-8 text-indigo-950/60">
                Kami ingin Serena terasa bukan hanya modern, tetapi juga benar-benar membantu secara
                manusiawi.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {principles.map((principle, index) => (
                <div
                  key={principle.title}
                  className="rounded-[1.75rem] border border-serena-lavender-100 bg-white p-7 shadow-sm"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-serena-lavender-50 text-sm font-bold text-serena-lavender-600">
                    0{index + 1}
                  </div>
                  <h3 className="mt-5 font-rounded text-xl font-bold text-indigo-950">
                    {principle.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-indigo-950/60 sm:text-base">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-16">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-serena-sage-100 bg-gradient-to-r from-white via-serena-cream-50 to-serena-sage-50/70 p-8 text-center shadow-sm sm:p-10">
            <h2 className="font-rounded text-3xl font-bold text-indigo-950 sm:text-4xl">
              Siap memulai perjalanan yang lebih tenang?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-indigo-950/60">
              Jelajahi konselor, isi assessment mandiri, atau mulai membangun kebiasaan refleksi
              harian bersama Serena.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-serena-sage-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-serena-sage-500/10 transition hover:bg-serena-sage-700 active:scale-[0.98]"
              >
                Mulai Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/counselors"
                className="inline-flex items-center justify-center rounded-full border border-indigo-100 bg-white px-7 py-3.5 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-50"
              >
                Lihat Konselor
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-indigo-50 bg-white/20 py-8 text-center text-sm text-indigo-950/40">
        &copy; {new Date().getFullYear()} Serena. Dibuat dengan penuh perhatian untuk kesehatan mental Anda.
      </footer>
    </div>
  );
}
