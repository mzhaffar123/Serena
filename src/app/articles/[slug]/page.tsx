import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import AppSiteHeader from "@/components/AppSiteHeader";
import PublicSiteHeader from "@/components/PublicSiteHeader";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type ArticleDetailPageProps = {
  params: {
    slug: string;
  };
};

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const session = await getServerSession(authOptions);

  const article = await db.article.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!article) {
    notFound();
  }

  const contentBlocks = article.content.split(/\n\s*\n/).filter(Boolean);

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

      <main className="mx-auto w-full max-w-5xl px-6 py-12 lg:px-8">
        <div className="mb-6">
          <Link href="/articles" className="inline-flex items-center gap-2 text-sm font-medium text-serena-lavender-600 transition hover:text-serena-lavender-700">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke artikel
          </Link>
        </div>
        <article className="overflow-hidden rounded-[2rem] border border-indigo-100 bg-white shadow-sm">
          <div className="relative h-72 w-full bg-serena-lavender-50 sm:h-96">
            {article.photoUrl ? (
              <Image src={article.photoUrl} alt={article.title} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-serena-lavender-500">
                <BookOpen className="h-14 w-14" />
              </div>
            )}
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-serena-sky-700">
              <span className="rounded-full bg-serena-sky-50 px-3 py-1">Artikel Edukasi</span>
              <span>{new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>

            <h1 className="font-rounded text-3xl font-bold leading-tight text-indigo-950 sm:text-4xl">{article.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-indigo-950/60">{article.summary}</p>

            <div className="mt-6 rounded-2xl bg-indigo-50/60 px-4 py-3 text-sm text-indigo-950/65">
              Ditulis oleh <span className="font-semibold text-indigo-950">{article.author.name}</span>
            </div>

            <div className="mt-10 space-y-6 text-sm leading-8 text-indigo-950/80 sm:text-base">
              {contentBlocks.map((block, index) => (
                <p key={`${article.id}-${index}`} className="whitespace-pre-line">
                  {block.replace(/\*\*/g, "")}
                </p>
              ))}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
