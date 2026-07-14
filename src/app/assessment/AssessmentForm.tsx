"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  HeartPulse,
  Loader2,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AssessmentHistoryItem = {
  id: string;
  score: number;
  result: string;
  createdAt: string;
  type: string;
};

type MoodHistoryItem = {
  id: string;
  moodScore: number;
  note: string | null;
  createdAt: string;
};

type AssessmentFormProps = {
  initialAssessments: AssessmentHistoryItem[];
  initialMoodEntries: MoodHistoryItem[];
};

type MoodRange = "7" | "30" | "all";

const questions = [
  "Kurang tertarik atau kurang merasa senang dalam melakukan berbagai hal.",
  "Merasa murung, sedih, atau putus asa.",
  "Sulit tidur, sering terbangun, atau tidur berlebihan.",
  "Merasa lelah atau kurang bertenaga.",
  "Nafsu makan menurun atau justru berlebihan.",
  "Merasa tidak baik tentang diri sendiri — merasa gagal atau mengecewakan diri sendiri maupun keluarga.",
  "Sulit berkonsentrasi, misalnya saat membaca atau menonton.",
  "Bergerak atau berbicara sangat lambat, atau sebaliknya merasa gelisah dan sulit diam.",
  "Muncul pikiran bahwa Anda lebih baik mati atau ingin menyakiti diri sendiri dengan cara apa pun.",
] as const;

const options = [
  { value: 0, label: "Tidak pernah" },
  { value: 1, label: "Beberapa hari" },
  { value: 2, label: "Lebih dari separuh waktu" },
  { value: 3, label: "Hampir setiap hari" },
] as const;

const moodOptions = [
  { score: 1, emoji: "😞", label: "Berat" },
  { score: 2, emoji: "😕", label: "Kurang baik" },
  { score: 3, emoji: "😐", label: "Netral" },
  { score: 4, emoji: "🙂", label: "Lumayan" },
  { score: 5, emoji: "😄", label: "Baik" },
] as const;

const moodRangeOptions: { value: MoodRange; label: string }[] = [
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "all", label: "Semua" },
];

function getMoodLabel(score: number) {
  return moodOptions.find((item) => item.score === score)?.label ?? "-";
}

function getAssessmentTone(score: number) {
  if (score <= 4) return "Kondisi relatif stabil. Tetap jaga rutinitas sehat dan istirahat cukup.";
  if (score <= 9) return "Ada gejala ringan. Perhatikan pola tidur, energi, dan aktivitas yang membantu Anda merasa lebih baik.";
  if (score <= 14) return "Gejala mulai terasa cukup bermakna. Pertimbangkan berbicara dengan konselor untuk dukungan lebih lanjut.";
  if (score <= 19) return "Gejala cukup berat. Mencari bantuan profesional akan sangat membantu Anda saat ini.";
  return "Gejala berada pada tingkat berat. Mohon segera pertimbangkan dukungan profesional dan orang terdekat yang tepercaya.";
}

function getAssessmentRisk(score: number) {
  if (score <= 4) {
    return {
      label: "Risiko rendah",
      description: "Gejala minimal",
      badgeClass: "border-serena-sage-100 bg-serena-sage-50 text-serena-sage-700",
      barClass: "bg-serena-sage-500",
      chartColor: "#22c55e",
    };
  }

  if (score <= 9) {
    return {
      label: "Perlu perhatian ringan",
      description: "Gejala ringan",
      badgeClass: "border-sky-100 bg-sky-50 text-sky-700",
      barClass: "bg-sky-500",
      chartColor: "#38bdf8",
    };
  }

  if (score <= 14) {
    return {
      label: "Risiko sedang",
      description: "Gejala sedang",
      badgeClass: "border-amber-100 bg-amber-50 text-amber-700",
      barClass: "bg-amber-500",
      chartColor: "#f59e0b",
    };
  }

  if (score <= 19) {
    return {
      label: "Risiko cukup tinggi",
      description: "Gejala cukup berat",
      badgeClass: "border-orange-100 bg-orange-50 text-orange-700",
      barClass: "bg-orange-500",
      chartColor: "#f97316",
    };
  }

  return {
    label: "Risiko tinggi",
    description: "Gejala berat",
    badgeClass: "border-rose-100 bg-rose-50 text-rose-700",
    barClass: "bg-rose-500",
    chartColor: "#f43f5e",
  };
}

export default function AssessmentForm({ initialAssessments, initialMoodEntries }: AssessmentFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [latestResult, setLatestResult] = useState<AssessmentHistoryItem | null>(initialAssessments[0] ?? null);

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState("");
  const [moodEntries, setMoodEntries] = useState<MoodHistoryItem[]>(initialMoodEntries);
  const [moodRange, setMoodRange] = useState<MoodRange>("7");

  const answeredCount = useMemo(() => answers.filter((answer) => answer !== null).length, [answers]);
  const isComplete = answeredCount === questions.length;

  const filteredMoodEntries = useMemo(() => {
    if (moodRange === "all") {
      return moodEntries;
    }

    return moodEntries.slice(0, Number(moodRange));
  }, [moodEntries, moodRange]);

  const moodAverage = useMemo(() => {
    if (filteredMoodEntries.length === 0) {
      return null;
    }

    return (filteredMoodEntries.reduce((sum, item) => sum + item.moodScore, 0) / filteredMoodEntries.length).toFixed(1);
  }, [filteredMoodEntries]);

  const chartData = useMemo(
    () =>
      [...filteredMoodEntries]
        .reverse()
        .map((item) => ({
          date: new Date(item.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          mood: item.moodScore,
        })),
    [filteredMoodEntries]
  );

  const assessmentChartData = useMemo(
    () =>
      [...initialAssessments]
        .reverse()
        .map((item) => ({
          date: new Date(item.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          score: item.score,
        })),
    [initialAssessments]
  );

  const moodInsight = useMemo(() => {
    if (moodEntries.length < 2) {
      return "Catat mood secara rutin agar Serena dapat membantu Anda melihat pola emosional dengan lebih jelas.";
    }

    const recentWindow = moodEntries.slice(0, Math.min(3, moodEntries.length));
    const previousWindow = moodEntries.slice(3, 6);

    const recentAvg = recentWindow.reduce((sum, item) => sum + item.moodScore, 0) / recentWindow.length;

    if (previousWindow.length === 0) {
      if (recentAvg >= 4) {
        return "Beberapa catatan terakhir menunjukkan suasana hati yang cukup baik. Pertahankan rutinitas yang membantu Anda merasa stabil.";
      }

      if (recentAvg <= 2.5) {
        return "Mood beberapa hari terakhir cenderung rendah. Coba beri ruang untuk istirahat, journaling, atau berbicara dengan orang yang Anda percaya.";
      }

      return "Mood Anda terlihat cukup netral belakangan ini. Teruskan pencatatan harian untuk menangkap perubahan kecil lebih cepat.";
    }

    const previousAvg = previousWindow.reduce((sum, item) => sum + item.moodScore, 0) / previousWindow.length;
    const delta = recentAvg - previousAvg;

    if (delta >= 0.5) {
      return "Mood Anda menunjukkan tren membaik dibanding catatan sebelumnya. Pertahankan aktivitas yang akhir-akhir ini terasa membantu.";
    }

    if (delta <= -0.5) {
      return "Mood Anda cenderung menurun dibanding beberapa catatan sebelumnya. Jika berlanjut, pertimbangkan menjadwalkan sesi dengan konselor.";
    }

    return "Mood Anda relatif stabil dalam beberapa catatan terakhir. Menjaga ritme tidur, aktivitas, dan dukungan sosial dapat membantu kestabilan ini.";
  }, [moodEntries]);

  const recentMoodAverage = useMemo(() => {
    if (moodEntries.length === 0) {
      return null;
    }

    const recentWindow = moodEntries.slice(0, Math.min(3, moodEntries.length));
    return recentWindow.reduce((sum, item) => sum + item.moodScore, 0) / recentWindow.length;
  }, [moodEntries]);

  const moodTrendDirection = useMemo(() => {
    if (moodEntries.length < 4) {
      return "stable" as const;
    }

    const recentWindow = moodEntries.slice(0, 3);
    const previousWindow = moodEntries.slice(3, 6);

    if (previousWindow.length === 0) {
      return "stable" as const;
    }

    const recentAvg = recentWindow.reduce((sum, item) => sum + item.moodScore, 0) / recentWindow.length;
    const previousAvg = previousWindow.reduce((sum, item) => sum + item.moodScore, 0) / previousWindow.length;
    const delta = recentAvg - previousAvg;

    if (delta >= 0.5) {
      return "up" as const;
    }

    if (delta <= -0.5) {
      return "down" as const;
    }

    return "stable" as const;
  }, [moodEntries]);

  const latestAssessmentRisk = useMemo(() => {
    if (!latestResult) {
      return null;
    }

    return getAssessmentRisk(latestResult.score);
  }, [latestResult]);

  const combinedRecommendation = useMemo(() => {
    if (!latestResult) {
      return {
        title: "Lengkapi asesmen untuk rekomendasi lebih akurat",
        description:
          moodEntries.length > 0
            ? "Mood tracker sudah memberi gambaran awal kondisi harian Anda. Tambahkan PHQ-9 agar Serena bisa memberi arahan yang lebih lengkap."
            : "Mulai dari mencatat mood harian dan isi PHQ-9 agar Serena dapat memberi arahan yang lebih personal.",
        points: [
          "Isi PHQ-9 setidaknya sekali untuk membuat baseline awal.",
          "Lanjutkan mood tracker selama beberapa hari berturut-turut.",
          "Catat situasi yang paling memengaruhi perasaan Anda hari ini.",
        ],
        panelClass: "border-serena-sky-100 bg-serena-sky-50/70",
        iconClass: "text-serena-sky-600",
        tone: "neutral" as const,
      };
    }

    if (latestResult.score >= 20 || (latestResult.score >= 15 && (recentMoodAverage ?? 3) <= 2.5)) {
      return {
        title: "Prioritaskan dukungan profesional sesegera mungkin",
        description:
          "Skor PHQ-9 dan kondisi mood terbaru menunjukkan Anda sedang membutuhkan dukungan yang lebih intens dan konsisten.",
        points: [
          "Pertimbangkan menjadwalkan sesi dengan konselor atau psikolog secepatnya.",
          "Jangan memendam kondisi ini sendirian — beri tahu orang tepercaya tentang apa yang Anda rasakan.",
          "Jika muncul dorongan menyakiti diri, segera cari bantuan darurat atau hubungi orang terdekat saat itu juga.",
        ],
        panelClass: "border-rose-100 bg-rose-50/80",
        iconClass: "text-rose-600",
        tone: "high" as const,
      };
    }

    if (latestResult.score >= 10 || moodTrendDirection === "down" || (recentMoodAverage !== null && recentMoodAverage <= 2.5)) {
      return {
        title: "Tingkatkan dukungan Anda minggu ini",
        description:
          "Ada tanda bahwa kondisi emosional Anda sedang perlu perhatian lebih. Intervensi kecil yang konsisten bisa sangat membantu.",
        points: [
          "Tetapkan satu rutinitas pemulihan harian: tidur cukup, jalan ringan, atau journaling 10 menit.",
          "Pantau mood setiap hari untuk melihat apakah penurunan ini berlanjut.",
          "Pertimbangkan membuat rencana konsultasi bila gejala bertahan atau memburuk.",
        ],
        panelClass: "border-amber-100 bg-amber-50/80",
        iconClass: "text-amber-600",
        tone: "medium" as const,
      };
    }

    if (latestResult.score <= 4 && (recentMoodAverage ?? 0) >= 4) {
      return {
        title: "Pertahankan kebiasaan yang sedang membantu",
        description:
          "Gabungan PHQ-9 dan mood terbaru terlihat cukup positif. Ini saat yang baik untuk menjaga ritme yang sudah berjalan baik.",
        points: [
          "Lanjutkan kebiasaan yang belakangan membuat Anda merasa lebih stabil.",
          "Tetap isi mood tracker agar Anda cepat sadar jika ada perubahan kecil.",
          "Gunakan energi yang lebih baik ini untuk kembali ke aktivitas bermakna secara bertahap.",
        ],
        panelClass: "border-serena-sage-100 bg-serena-sage-50/80",
        iconClass: "text-serena-sage-600",
        tone: "low" as const,
      };
    }

    return {
      title: "Jaga ritme dan pantau perubahan secara berkala",
      description:
        "Kondisi Anda belum menunjukkan tanda bahaya yang menonjol, tetapi tetap penting untuk menjaga pola hidup dan pemantauan rutin.",
      points: [
        "Pertahankan pola tidur, makan, dan aktivitas yang konsisten.",
        "Isi mood tracker untuk membantu membedakan hari yang baik dan hari yang lebih berat.",
        "Ulangi PHQ-9 secara berkala untuk membandingkan perubahan kondisi.",
      ],
      panelClass: "border-indigo-100 bg-indigo-50/70",
      iconClass: "text-indigo-600",
      tone: "neutral" as const,
    };
  }, [latestResult, moodEntries.length, recentMoodAverage, moodTrendDirection]);

  const handleSelect = (questionIndex: number, value: number) => {
    setAnswers((prev) => prev.map((item, idx) => (idx === questionIndex ? value : item)));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isComplete) {
      setError("Mohon jawab semua pertanyaan sebelum mengirim asesmen.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan hasil asesmen.");
      }

      setLatestResult(data.assessment);
      setAnswers(Array(questions.length).fill(null));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMood === null) {
      setMoodError("Pilih mood Anda hari ini terlebih dahulu.");
      return;
    }

    setMoodLoading(true);
    setMoodError("");

    try {
      const res = await fetch("/api/mood-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moodScore: selectedMood,
          note: moodNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan mood.");
      }

      setMoodEntries((prev) => [
        {
          ...data.moodEntry,
          createdAt: new Date(data.moodEntry.createdAt).toISOString(),
        },
        ...prev,
      ].slice(0, 30));
      setSelectedMood(null);
      setMoodNote("");
      router.refresh();
    } catch (err) {
      setMoodError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setMoodLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.95fr]">
        <div className="rounded-3xl border border-serena-sky-100/80 bg-white/70 p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start gap-4 rounded-2xl bg-serena-sky-50/80 p-4 text-sm text-indigo-950/75">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-serena-sky-600 shadow-sm">
              <SmilePlus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-indigo-950">Mood Tracker Harian</p>
              <p className="mt-1 leading-relaxed">
                Catat suasana hati Anda setiap hari untuk melihat pola emosi, mengenali pemicu, dan membangun kebiasaan refleksi yang lebih sehat.
              </p>
            </div>
          </div>

          <form onSubmit={handleMoodSubmit} className="space-y-5">
            <div>
              <p className="mb-3 text-sm font-medium text-indigo-950">Bagaimana perasaan Anda hari ini?</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {moodOptions.map((option) => {
                  const isSelected = selectedMood === option.score;

                  return (
                    <button
                      key={option.score}
                      type="button"
                      onClick={() => {
                        setSelectedMood(option.score);
                        setMoodError("");
                      }}
                      className={`rounded-2xl border px-3 py-4 text-center transition-all ${
                        isSelected
                          ? "border-serena-sky-300 bg-serena-sky-50 ring-2 ring-serena-sky-100"
                          : "border-indigo-100 bg-white hover:border-serena-sky-200 hover:bg-serena-sky-50/40"
                      }`}
                    >
                      <div className="text-2xl">{option.emoji}</div>
                      <div className="mt-2 text-sm font-medium text-indigo-950">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-indigo-950">Catatan singkat</label>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Contoh: Hari ini agak cemas karena banyak tugas, tapi lebih tenang setelah istirahat."
                className="w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-indigo-950 outline-none transition focus:border-serena-sky-300 focus:ring-2 focus:ring-serena-sky-100"
              />
              <p className="mt-2 text-right text-xs text-indigo-950/40">{moodNote.length}/500</p>
            </div>

            {moodError && <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{moodError}</p>}

            <button
              type="submit"
              disabled={moodLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-serena-sky-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-serena-sky-500/15 transition hover:bg-serena-sky-700 disabled:pointer-events-none disabled:opacity-60"
            >
              {moodLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartPulse className="h-4 w-4" />}
              Simpan mood hari ini
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-serena-sage-100 bg-white/70 p-6 shadow-sm">
            <h2 className="font-rounded text-2xl font-bold text-indigo-950">Ringkasan Mood</h2>
            {moodEntries.length > 0 ? (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-indigo-950/50">Rata-rata periode terpilih</p>
                  <p className="font-rounded text-4xl font-bold text-indigo-950">{moodAverage}</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-950/50">Mood terbaru</p>
                  <p className="mt-1 text-sm font-medium text-indigo-950">
                    {getMoodLabel(moodEntries[0].moodScore)} · skor {moodEntries[0].moodScore}/5
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-indigo-950/45">
                  Update terakhir {new Date(moodEntries[0].createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-indigo-950/60">
                Belum ada mood yang tersimpan. Mulai catat suasana hati harian Anda untuk melihat tren emosional.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-indigo-100/70 bg-white/70 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              {moodInsight.includes("membaik") ? (
                <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-serena-sage-600" />
              ) : moodInsight.includes("menurun") ? (
                <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              ) : (
                <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-serena-sky-600" />
              )}
              <div>
                <h3 className="font-rounded text-xl font-bold text-indigo-950">Insight Otomatis</h3>
                <p className="mt-2 text-sm leading-relaxed text-indigo-950/65">{moodInsight}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-100/70 bg-white/70 p-6 shadow-sm">
            <h3 className="font-rounded text-xl font-bold text-indigo-950">Riwayat Mood Terbaru</h3>
            {moodEntries.length > 0 ? (
              <div className="mt-4 space-y-3">
                {moodEntries.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-indigo-100 bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-indigo-950">
                          {getMoodLabel(item.moodScore)} · {item.moodScore}/5
                        </p>
                        <p className="mt-1 text-xs text-indigo-950/55">{item.note || "Tanpa catatan tambahan."}</p>
                      </div>
                      <span className="text-xs text-indigo-950/40">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-indigo-950/60">Riwayat mood Anda akan muncul di sini.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-3xl border border-indigo-100/70 bg-white/70 p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-rounded text-2xl font-bold text-indigo-950">Grafik Tren Mood</h2>
              <p className="mt-2 text-sm leading-relaxed text-indigo-950/60">
                Lihat perubahan skor mood Anda dari waktu ke waktu untuk membantu memahami pola emosi harian.
              </p>
            </div>
            <div className="inline-flex rounded-2xl border border-indigo-100 bg-white p-1">
              {moodRangeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMoodRange(option.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                    moodRange === option.value
                      ? "bg-serena-sky-600 text-white shadow-sm"
                      : "text-indigo-950/65 hover:bg-indigo-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6366f1" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: "#6366f1" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-indigo-200 bg-white px-5 py-10 text-center text-sm text-indigo-950/55">
              Grafik akan muncul setelah Anda menyimpan beberapa catatan mood.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-indigo-100/70 bg-white/70 p-6 shadow-sm sm:p-8">
          <div className="mb-5">
            <h2 className="font-rounded text-2xl font-bold text-indigo-950">Grafik Skor PHQ-9</h2>
            <p className="mt-2 text-sm leading-relaxed text-indigo-950/60">
              Pantau apakah skor asesmen Anda cenderung stabil, meningkat, atau menurun dari waktu ke waktu.
            </p>
          </div>

          {assessmentChartData.length > 0 ? (
            <>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assessmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ede9fe" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#7c3aed" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 27]} ticks={[0, 5, 10, 15, 20, 27]} tick={{ fontSize: 12, fill: "#7c3aed" }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={latestAssessmentRisk?.chartColor ?? "#8b5cf6"}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {latestResult && (
                <div className="mt-4 rounded-2xl bg-serena-lavender-50/70 px-4 py-3 text-sm leading-relaxed text-indigo-950/70">
                  <span className="font-semibold text-indigo-950">Insight PHQ-9:</span> {getAssessmentTone(latestResult.score)}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-indigo-200 bg-white px-5 py-10 text-center text-sm text-indigo-950/55">
              Grafik PHQ-9 akan muncul setelah Anda menyimpan hasil asesmen.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-indigo-100/70 bg-white/70 p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-start gap-4 rounded-2xl bg-serena-lavender-50/70 p-4 text-sm text-indigo-950/75">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-serena-lavender-600 shadow-sm">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-indigo-950">Asesmen PHQ-9</p>
              <p className="mt-1 leading-relaxed">
                Isi berdasarkan pengalaman Anda selama 2 minggu terakhir. Hasil ini membantu Anda memantau kondisi,
                tetapi tidak menggantikan diagnosis profesional.
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between text-sm">
            <span className="font-medium text-indigo-950">Progres jawaban</span>
            <span className="rounded-full bg-serena-sky-50 px-3 py-1 text-serena-sky-700">{answeredCount}/{questions.length} selesai</span>
          </div>

          <div className="space-y-5">
            {questions.map((question, index) => (
              <motion.div
                key={question}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-3xl border border-indigo-100 bg-white p-5"
              >
                <p className="mb-4 text-sm font-semibold leading-relaxed text-indigo-950 sm:text-base">
                  {index + 1}. {question}
                </p>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {options.map((option) => {
                    const isSelected = answers[index] === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(index, option.value)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                          isSelected
                            ? "border-serena-lavender-400 bg-serena-lavender-50 text-serena-lavender-700 ring-2 ring-serena-lavender-100"
                            : "border-indigo-100 bg-white text-indigo-950/70 hover:border-serena-lavender-200 hover:bg-serena-lavender-50/40"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {error && <p className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-white px-5 py-3 text-sm font-medium text-indigo-950 transition hover:bg-indigo-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-serena-lavender-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-serena-lavender-500/15 transition hover:bg-serena-lavender-700 disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Simpan hasil asesmen
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl border border-serena-sage-100 bg-white/70 p-6 shadow-sm">
            <h2 className="font-rounded text-2xl font-bold text-indigo-950">Hasil Terbaru</h2>
            {latestResult ? (
              <div className="mt-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-serena-sage-50 px-3 py-1 text-sm font-medium text-serena-sage-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {latestResult.type}
                  </div>
                  {latestAssessmentRisk && (
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${latestAssessmentRisk.badgeClass}`}>
                      {latestResult.score >= 15 ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      {latestAssessmentRisk.label}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-indigo-950/50">Skor</p>
                  <p className="font-rounded text-4xl font-bold text-indigo-950">{latestResult.score}</p>
                </div>
                {latestAssessmentRisk && (
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-indigo-950/50">
                      <span>Indikator risiko PHQ-9</span>
                      <span>{latestAssessmentRisk.description}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-indigo-100/70">
                      <div
                        className={`h-full rounded-full ${latestAssessmentRisk.barClass}`}
                        style={{ width: `${Math.max((latestResult.score / 27) * 100, 8)}%` }}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-indigo-950/50">Interpretasi</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-indigo-950">{latestResult.result}</p>
                </div>
                <p className="text-xs text-indigo-950/45">
                  Disimpan pada {new Date(latestResult.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-indigo-950/60">
                Belum ada hasil asesmen yang tersimpan. Isi PHQ-9 pertama Anda untuk mulai memantau kondisi emosional.
              </p>
            )}
          </div>

          <div className={`rounded-3xl border p-6 shadow-sm ${combinedRecommendation.panelClass}`}>
            <div className="flex items-start gap-3">
              {combinedRecommendation.tone === "high" ? (
                <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${combinedRecommendation.iconClass}`} />
              ) : combinedRecommendation.tone === "low" ? (
                <ShieldCheck className={`mt-0.5 h-5 w-5 shrink-0 ${combinedRecommendation.iconClass}`} />
              ) : (
                <Sparkles className={`mt-0.5 h-5 w-5 shrink-0 ${combinedRecommendation.iconClass}`} />
              )}
              <div>
                <h3 className="font-rounded text-xl font-bold text-indigo-950">Rekomendasi Hari Ini</h3>
                <p className="mt-2 text-sm font-medium text-indigo-950">{combinedRecommendation.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-indigo-950/65">{combinedRecommendation.description}</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-indigo-950/70">
              {combinedRecommendation.points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-indigo-100/70 bg-white/70 p-6 shadow-sm">
            <h3 className="font-rounded text-xl font-bold text-indigo-950">Riwayat Singkat Asesmen</h3>
            {initialAssessments.length > 0 ? (
              <div className="mt-4 space-y-3">
                {initialAssessments.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-indigo-100 bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-indigo-950">Skor {item.score}</p>
                        <p className="mt-1 text-xs text-indigo-950/55">{item.result}</p>
                      </div>
                      <span className="text-xs text-indigo-950/40">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-indigo-950/60">Riwayat asesmen Anda akan muncul di sini.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
