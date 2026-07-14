import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight, BookOpen } from "lucide-react";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import AppSiteHeader from "@/components/AppSiteHeader";
import PublicSiteHeader from "@/components/PublicSiteHeader";
import RecommendedArticlesSection from "@/components/RecommendedArticlesSection";
import { getPersonalizedArticleRecommendations } from "@/lib/article-recommendations";

export default async function ArticlesPage() {
  const session = await getServerSession(authOptions);

  const [articles, latestAssessment, recentMoodEntries] = await Promise.all([
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
    session?.user?.role === "PATIENT"
      ? db.assessment.findFirst({
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
        })
      : Promise.resolve(null),
    session?.user?.role === "PATIENT"
      ? db.moodEntry.findMany({
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
        })
      : Promise.resolve([]),
  ]);

  const personalizedArticles =
    session?.user?.role === "PATIENT"
      ? getPersonalizedArticleRecommendations({
          articles,
          latestAssessment,
          recentMoodEntries,
          limit: 3,
        })
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-serena-cream-50 via-serena-lavender-50 to-serena-sky-50 text-indigo-950">
      {session?.user ? (
        <AppSiteHeader
          role={session.user.role as "PATIENT" | "COUNSELOR" | "ADMIN"}
          activeItem="articles"
          userName={session.user.name}
          photoUrl={session.user.photoUrl}
        />
      ) : (
        <PublicSiteHeader activeItem="articles" />
      )}

      <main className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-serena-sage-100 bg-serena-sage-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-serena-sage-700">
            <BookOpen className="h-4 w-4" />
            Artikel Edukasi
          </div>
          <h1 className="font-rounded text-3xl font-bold text-indigo-950 sm:text-4xl">Bacaan untuk menemani proses bertumbuh</h1>
          <p className="mt-3 text-sm leading-relaxed text-indigo-950/60 sm:text-base">
            Jelajahi artikel kesehatan mental pilihan dari konselor Serena untuk membantu Anda memahami emosi, stres, kecemasan, dan keseimbangan hidup dengan lebih baik.
          </p>
        </div>

        {personalizedArticles && personalizedArticles.recommendations.length > 0 && (
          <div className="mb-10">
            <RecommendedArticlesSection
              title="Rekomendasi personal untuk Anda"
              description={personalizedArticles.insight}
              recommendations={personalizedArticles.recommendations}
            />
          </div>
        )}

        {articles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-indigo-200 bg-white/60 p-10 text-center text-indigo-950/55">
            Belum ada artikel yang dipublikasikan.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-56 w-full bg-serena-lavender-50">
                  {article.photoUrl ? (
                    <Image
                      src={article.photoUrl}
                      alt={article.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-serena-lavender-500">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-serena-sky-700">
                    {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="font-rounded text-xl font-bold text-indigo-950 transition group-hover:text-serena-lavender-600">
                    {article.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-indigo-950/60">{article.summary}</p>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="text-xs text-indigo-950/45">Oleh {article.author.name}</span>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-serena-lavender-600">
                      Baca artikel
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
