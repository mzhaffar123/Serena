import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { articleSeedData } from "./articleSeedData";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting db seeding...");

  // Clear existing database entries
  await prisma.article.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.counselorProfile.deleteMany({});
  await prisma.moodEntry.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Patient User
  const patient = await prisma.user.create({
    data: {
      name: "Budi Setiawan",
      email: "patient@serena.com",
      password: hashedPassword,
      role: Role.PATIENT,
      isVerified: true,
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    },
  });
  console.log("Seeded Patient User:", patient.email);

  // 2. Create Counselor Users and Profiles
  const c1 = await prisma.user.create({
    data: {
      name: "Dr. Sarah Wijaya, M.Psi.",
      email: "counselor1@serena.com",
      password: hashedPassword,
      role: Role.COUNSELOR,
      isVerified: true,
      photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&h=150&q=80",
      counselorProfile: {
        create: {
          specialization: "Depresi, Anxiety (Kecemasan)",
          bio: "Berpengalaman lebih dari 8 tahun dalam menangani gangguan kecemasan umum dan depresi ringan hingga berat pada dewasa muda.",
          experienceYrs: 8,
          hourlyRate: 150000,
          isAvailable: true,
          rating: 4.8,
          availability: {
            "Senin": ["09:00", "10:00", "13:00", "14:00"],
            "Selasa": ["09:00", "10:00", "13:00", "14:00"],
            "Rabu": ["09:00", "10:00", "13:00", "14:00"],
            "Kamis": ["09:00", "10:00", "13:00", "14:00"],
            "Jumat": ["09:00", "10:00", "13:00", "14:00"]
          },
        },
      },
    },
  });
  console.log("Seeded Counselor User 1:", c1.email);

  const c2 = await prisma.user.create({
    data: {
      name: "Rian Pratama, S.Psi., M.Psi.",
      email: "counselor2@serena.com",
      password: hashedPassword,
      role: Role.COUNSELOR,
      isVerified: true,
      photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80",
      counselorProfile: {
        create: {
          specialization: "Hubungan Asmara, Karir & Stress Kerja",
          bio: "Fokus pada konseling pernikahan, hubungan asmara, dan pengembangan karir. Menggunakan pendekatan humanistik yang ramah.",
          experienceYrs: 5,
          hourlyRate: 120000,
          isAvailable: true,
          rating: 4.9,
          availability: {
            "Senin": ["10:00", "11:00", "14:00", "15:00"],
            "Selasa": ["10:00", "11:00", "14:00", "15:00"],
            "Rabu": ["10:00", "11:00", "14:00", "15:00"],
            "Kamis": ["10:00", "11:00", "14:00", "15:00"],
            "Jumat": ["10:00", "11:00", "14:00", "15:00"]
          },
        },
      },
    },
  });
  console.log("Seeded Counselor User 2:", c2.email);

  const c3 = await prisma.user.create({
    data: {
      name: "Anisa Fitri, M.Psi., Psikolog",
      email: "counselor3@serena.com",
      password: hashedPassword,
      role: Role.COUNSELOR,
      isVerified: true,
      photoUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&h=150&q=80",
      counselorProfile: {
        create: {
          specialization: "Trauma, Grief, Stres Pasca-Trauma (PTSD)",
          bio: "Spesialis dalam pemulihan trauma masa kecil, duka mendalam (grief counseling), dan manajemen stres berat. Mengutamakan rasa aman klien.",
          experienceYrs: 10,
          hourlyRate: 200000,
          isAvailable: true,
          rating: 5.0,
          availability: {
            "Senin": ["09:00", "11:00", "13:00", "15:00"],
            "Rabu": ["09:00", "11:00", "13:00", "15:00"],
            "Jumat": ["09:00", "11:00", "13:00", "15:00"]
          },
        },
      },
    },
  });
  console.log("Seeded Counselor User 3:", c3.email);

  // 3. Seed Articles
  const authorIdByEmail: Record<string, string> = {
    [c1.email]: c1.id,
    [c2.email]: c2.id,
    [c3.email]: c3.id,
  };

  for (const article of articleSeedData) {
    await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        photoUrl: article.photoUrl,
        authorId: authorIdByEmail[article.authorEmail] ?? c1.id,
      },
    });
  }

  console.log(`Seeded ${articleSeedData.length} database articles successfully.`);
  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error while seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
