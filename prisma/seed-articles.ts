import { PrismaClient, Role } from "@prisma/client";
import { articleSeedData } from "./articleSeedData";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting article upsert...");

  const counselors = await prisma.user.findMany({
    where: {
      role: Role.COUNSELOR,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (counselors.length === 0) {
    throw new Error("Tidak ada akun konselor di database. Buat atau seed akun konselor terlebih dahulu sebelum menambahkan artikel.");
  }

  const fallbackCounselor = counselors[0];
  const counselorIdByEmail = new Map(counselors.map((counselor) => [counselor.email, counselor.id]));

  for (const article of articleSeedData) {
    const authorId = counselorIdByEmail.get(article.authorEmail) ?? fallbackCounselor.id;

    await prisma.article.upsert({
      where: {
        slug: article.slug,
      },
      update: {
        title: article.title,
        summary: article.summary,
        content: article.content,
        photoUrl: article.photoUrl,
        authorId,
      },
      create: {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        photoUrl: article.photoUrl,
        authorId,
      },
    });

    console.log(`Upserted article: ${article.slug}`);
  }

  console.log(`Finished upserting ${articleSeedData.length} articles.`);
}

main()
  .catch((error) => {
    console.error("Error while upserting articles:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
