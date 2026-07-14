import Link from "next/link";


const faqItems = [
  {
    question: "Apakah Serena merupakan alat diagnostik klinis?",
    answer:
      "Tidak. Serena membantu Anda memantau kondisi emosional melalui mood tracker, asesmen mandiri, dan konten edukasi. Hasil yang tampil bukan diagnosis medis final dan tetap sebaiknya dibahas dengan psikolog atau konselor profesional.",
  },
  {
    question: "Apakah catatan harian saya bersifat pribadi?",
    answer:
      "Ya. Data akun, hasil asesmen, mood tracker, dan riwayat booking Anda disimpan secara privat di akun Anda. Konselor hanya dapat melihat informasi yang memang Anda bagikan melalui proses booking atau sesi konsultasi.",
  },
  {
    question: "Bagaimana cara kerja fitur rekomendasi AI?",
    answer:
      "Serena menyesuaikan rekomendasi artikel berdasarkan pola umum dari assessment PHQ-9 terbaru, mood tracker, dan topik artikel yang relevan. Tujuannya untuk membantu Anda menemukan bacaan yang paling dekat dengan kebutuhan saat ini, bukan menggantikan penilaian profesional.",
  },
  {
    question: "Bagaimana cara saya memesan sesi konsultasi?",
    answer:
      "Setelah membuat akun pasien, Anda bisa membuka daftar konselor, melihat detail profil, memilih slot jadwal yang tersedia, lalu mengirim booking. Setelah itu, permintaan Anda akan masuk ke dashboard konselor untuk dikonfirmasi.",
  },
  {
    question: "Apakah saya harus login untuk mencoba Serena?",
    answer:
      "Anda bisa melihat informasi umum, daftar artikel, dan profil konselor tanpa login. Namun untuk mengisi assessment, mencatat mood, menyimpan progres, atau membuat booking, Anda perlu masuk ke akun terlebih dahulu.",
  },
] as const;

export default function LandingFaqSection() {
  return (
    <section
      id="faq"
      className="scroll-mt-28 border-t border-serena-sage-100/60 bg-gradient-to-b from-serena-sage-50/80 via-serena-cream-50 to-white px-6 py-20 lg:px-16"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-serena-sage-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-serena-sage-700 shadow-sm">
            FAQ Serena
          </div>
          <h2 className="font-rounded text-2xl font-bold text-indigo-950 sm:text-3xl">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-indigo-950/60 sm:text-base">
            Beberapa hal yang sering ditanyakan sebelum memulai perjalanan bersama Serena.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <details
              key={item.question}
              className="faq-item overflow-hidden rounded-[1.75rem] border border-serena-sage-100 bg-white shadow-sm transition-all duration-300"
              open={index === 0}
            >
              <summary className="faq-summary flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-serena-sage-50/40 sm:px-7 sm:py-6">
                <span className="font-rounded text-sm font-bold leading-snug text-indigo-950 sm:text-lg">
                  {item.question}
                </span>
                <span className="faq-chevron flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-serena-sage-50 text-serena-sage-700">

                </span>
              </summary>

              <div className="border-t border-serena-sage-100/70 px-6 pb-6 pt-4 sm:px-7">
                <p className="max-w-3xl text-sm leading-7 text-indigo-950/68 sm:text-[15px]">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 rounded-[1.75rem] border border-serena-sage-100 bg-white/80 p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">

              <div>
                <h3 className="font-rounded text-lg font-bold text-indigo-950">
                  Masih punya pertanyaan?
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-indigo-950/60">
                  Mulai dari eksplorasi artikel atau temukan konselor yang paling sesuai dengan kebutuhan Anda.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/articles"
                className="inline-flex items-center justify-center rounded-full border border-indigo-100 bg-white px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-50"
              >
                Baca artikel dulu
              </Link>
              <Link
                href="/counselors"
                className="inline-flex items-center justify-center rounded-full bg-serena-sage-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-serena-sage-700"
              >
                Cari konselor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
