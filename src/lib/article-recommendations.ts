type ArticleForRecommendation = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  photoUrl: string | null;
  publishedAt: Date;
  author: {
    name: string;
  };
};

type AssessmentSignal = {
  score: number;
  result: string;
} | null;

type MoodSignal = {
  moodScore: number;
  createdAt: Date;
}[];

export type PersonalizedArticleRecommendation = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  photoUrl: string | null;
  publishedAt: Date;
  authorName: string;
  label: string;
  reasons: string[];
  score: number;
};

export type PersonalizedRecommendationResult = {
  recommendations: PersonalizedArticleRecommendation[];
  insight: string;
  isPersonalized: boolean;
};

type ThemeDescriptor = {
  key: "anxiety" | "stress" | "stability";
  label: string;
  weight: number;
  reason: string;
};

const THEME_KEYWORDS: Record<ThemeDescriptor["key"], string[]> = {
  anxiety: [
    "anxiety",
    "kecemasan",
    "cemas",
    "depresi",
    "napas",
    "pernapasan",
    "grounding",
    "menenangkan",
    "overthinking",
    "tidur",
    "pikiran",
    "malam",
  ],
  stress: [
    "stress",
    "stres",
    "burnout",
    "work-life",
    "work life",
    "keseimbangan",
    "karir",
    "pekerjaan",
    "istirahat",
    "imposter",
    "quarter-life",
    "quarter life",
    "doomscrolling",
    "media sosial",
    "distraksi",
    "fokus",
    "batasan",
  ],
  stability: [
    "tidur",
    "hobi",
    "journaling",
    "jurnal",
    "keluarga",
    "keseimbangan",
    "tenang",
    "rutinitas",
    "self-care",
    "self care",
    "koneksi",
    "kesepian",
    "relasi",
    "pemulihan",
  ],
};

function getMoodAverage(entries: MoodSignal) {
  if (entries.length === 0) {
    return null;
  }

  return entries.reduce((sum, entry) => sum + entry.moodScore, 0) / entries.length;
}

function getMoodTrend(entries: MoodSignal) {
  if (entries.length < 4) {
    return "stable" as const;
  }

  const recentWindow = entries.slice(0, 3);
  const previousWindow = entries.slice(3, 6);

  if (previousWindow.length === 0) {
    return "stable" as const;
  }

  const recentAvg = recentWindow.reduce((sum, entry) => sum + entry.moodScore, 0) / recentWindow.length;
  const previousAvg = previousWindow.reduce((sum, entry) => sum + entry.moodScore, 0) / previousWindow.length;
  const delta = recentAvg - previousAvg;

  if (delta >= 0.5) {
    return "up" as const;
  }

  if (delta <= -0.5) {
    return "down" as const;
  }

  return "stable" as const;
}

function buildThemes(latestAssessment: AssessmentSignal, recentMoodEntries: MoodSignal): ThemeDescriptor[] {
  const themes: ThemeDescriptor[] = [];
  const moodAverage = getMoodAverage(recentMoodEntries);
  const moodTrend = getMoodTrend(recentMoodEntries);

  if (latestAssessment) {
    if (latestAssessment.score >= 10) {
      themes.push({
        key: "anxiety",
        label: "Untuk kecemasan & emosi berat",
        weight: 6,
        reason: "Skor PHQ-9 terbaru menunjukkan Anda mungkin sedang memerlukan bacaan yang menenangkan dan praktis.",
      });
    } else if (latestAssessment.score >= 5) {
      themes.push({
        key: "stress",
        label: "Untuk mengelola stres harian",
        weight: 4,
        reason: "Skor PHQ-9 Anda menunjukkan ada tekanan emosional ringan hingga sedang yang perlu dikelola dengan lembut.",
      });
    } else {
      themes.push({
        key: "stability",
        label: "Untuk menjaga kestabilan diri",
        weight: 3,
        reason: "Kondisi Anda relatif stabil, jadi kami memilih bacaan yang membantu menjaga ritme sehat ini.",
      });
    }
  }

  if (moodAverage !== null) {
    if (moodAverage <= 2.5) {
      themes.push({
        key: "anxiety",
        label: "Untuk kecemasan & emosi berat",
        weight: 5,
        reason: "Mood beberapa hari terakhir cenderung rendah, sehingga artikel dengan langkah praktis bisa lebih relevan saat ini.",
      });
    } else if (moodAverage <= 3.5) {
      themes.push({
        key: "stress",
        label: "Untuk mengelola stres harian",
        weight: 3,
        reason: "Mood Anda belakangan cukup fluktuatif, jadi bacaan tentang stres dan keseimbangan bisa membantu.",
      });
    } else {
      themes.push({
        key: "stability",
        label: "Untuk menjaga kestabilan diri",
        weight: 2,
        reason: "Mood Anda cukup baik belakangan ini. Artikel yang mendukung kebiasaan sehat akan lebih berguna.",
      });
    }
  }

  if (moodTrend === "down") {
    themes.push({
      key: "stress",
      label: "Untuk mengelola stres harian",
      weight: 4,
      reason: "Tren mood Anda menurun dalam beberapa catatan terakhir, jadi kami memprioritaskan bacaan yang bisa membantu memulihkan ritme.",
    });
  } else if (moodTrend === "up") {
    themes.push({
      key: "stability",
      label: "Untuk menjaga kestabilan diri",
      weight: 2,
      reason: "Tren mood Anda membaik, sehingga bacaan yang menjaga kebiasaan sehat tetap cocok untuk saat ini.",
    });
  }

  return themes;
}

function getFallbackInsight(hasAssessment: boolean, hasMoodData: boolean) {
  if (!hasAssessment && !hasMoodData) {
    return "Isi mood tracker atau self-assessment agar Serena bisa memberi rekomendasi artikel yang lebih personal. Sementara ini, berikut bacaan awal yang kami sarankan.";
  }

  if (hasAssessment && !hasMoodData) {
    return "Rekomendasi ini terutama menyesuaikan skor PHQ-9 terbaru Anda. Tambahkan mood tracker harian untuk hasil yang lebih akurat.";
  }

  if (!hasAssessment && hasMoodData) {
    return "Rekomendasi ini menyesuaikan catatan mood harian Anda. Lengkapi juga self-assessment agar saran bacaan makin relevan.";
  }

  return "Rekomendasi ini dipilih dari kombinasi self-assessment dan mood tracker terbaru Anda.";
}

export function getPersonalizedArticleRecommendations({
  articles,
  latestAssessment,
  recentMoodEntries,
  limit = 3,
}: {
  articles: ArticleForRecommendation[];
  latestAssessment: AssessmentSignal;
  recentMoodEntries: MoodSignal;
  limit?: number;
}): PersonalizedRecommendationResult {
  const sortedArticles = [...articles].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  const themes = buildThemes(latestAssessment, recentMoodEntries);
  const hasSignals = Boolean(latestAssessment) || recentMoodEntries.length > 0;

  const recommendations = sortedArticles
    .map((article, index) => {
      const haystack = `${article.title} ${article.summary} ${article.content}`.toLowerCase();
      let score = Math.max(0.25, sortedArticles.length - index) * 0.4;
      const reasons: string[] = [];
      const labels: string[] = [];

      themes.forEach((theme) => {
        const matchCount = THEME_KEYWORDS[theme.key].filter((keyword) => haystack.includes(keyword)).length;

        if (matchCount > 0) {
          score += theme.weight + matchCount * 0.6;
          reasons.push(theme.reason);
          labels.push(theme.label);
        }
      });

      if (reasons.length === 0) {
        reasons.push(
          hasSignals
            ? "Artikel ini tetap kami tampilkan sebagai bacaan pendamping agar Anda punya referensi tambahan yang bisa dicoba."
            : "Artikel ini cocok sebagai bacaan awal sambil Anda mulai membangun rutinitas mood tracker dan self-assessment."
        );
      }

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        photoUrl: article.photoUrl,
        publishedAt: article.publishedAt,
        authorName: article.author.name,
        label: labels[0] ?? (hasSignals ? "Pilihan pendamping" : "Mulai dari sini"),
        reasons: Array.from(new Set(reasons)).slice(0, 2),
        score,
      } satisfies PersonalizedArticleRecommendation;
    })
    .sort((a, b) => b.score - a.score || b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);

  return {
    recommendations,
    insight: getFallbackInsight(Boolean(latestAssessment), recentMoodEntries.length > 0),
    isPersonalized: hasSignals,
  };
}
