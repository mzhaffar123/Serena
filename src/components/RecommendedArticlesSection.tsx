import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import type { PersonalizedArticleRecommendation } from "@/lib/article-recommendations";

type RecommendedArticlesSectionProps = {
  title: string;
  description: string;
  recommendations: PersonalizedArticleRecommendation[];
  ctaHref?: string;
  ctaLabel?: string;
};

export default function RecommendedArticlesSection({
  title,
  description,
  recommendations,
  ctaHref,
  ctaLabel,
}: RecommendedArticlesSectionProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-serena-lavender-100 bg-serena-lavender-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-serena-lavender-700">
            <Sparkles className="h-4 w-4" />
            Rekomendasi Personal
          </div>
          <h2 className="font-rounded text-2xl font-bold text-indigo-950 sm:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-indigo-950/60 sm:text-base">{description}</p>
        </div>

        {ctaHref && ctaLabel && (
          <Link href={ctaHref} className="text-sm font-semibold text-serena-lavender-600 transition hover:text-serena-lavender-700">
            {ctaLabel}
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group overflow-hidden rounded-3xl border border-indigo-100 bg-indigo-50/30 transition-all duration-300 hover:-translate-y-1 hover:border-serena-lavender-100 hover:bg-white hover:shadow-md"
          >
            <div className="relative h-52 w-full bg-serena-lavender-50">
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
              <div className="mb-3 inline-flex rounded-full border border-serena-sky-100 bg-serena-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-serena-sky-700">
                {article.label}
              </div>
              <h3 className="font-rounded text-xl font-bold text-indigo-950 transition group-hover:text-serena-lavender-600">
                {article.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-indigo-950/60">{article.summary}</p>

              <div className="mt-5 space-y-2 rounded-2xl bg-white/80 p-4">
                {article.reasons.map((reason) => (
                  <div key={reason} className="flex items-start gap-2 text-xs leading-relaxed text-indigo-950/65">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-serena-lavender-500" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-xs text-indigo-950/45">Oleh {article.authorName}</span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-serena-lavender-600">
                  Baca sekarang
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
