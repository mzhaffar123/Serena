import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import AppSiteHeader from "@/components/AppSiteHeader";
import CounselorsList from "./CounselorsList";
import PublicSiteHeader from "@/components/PublicSiteHeader";

export const revalidate = 0; // Disable caching for real-time availability

export default async function CounselorsPage() {
  const session = await getServerSession(authOptions);

  const counselors = await db.user.findMany({
    where: {
      role: "COUNSELOR",
      counselorProfile: {
        isNot: null,
      },
    },
    include: {
      counselorProfile: true,
    },
  });

  // Format counselors list for client side
  const formattedCounselors = counselors.map((c) => ({
    id: c.id,
    name: c.name,
    photoUrl: c.photoUrl,
    specialization: c.counselorProfile!.specialization,
    bio: c.counselorProfile!.bio,
    experienceYrs: c.counselorProfile!.experienceYrs,
    hourlyRate: c.counselorProfile!.hourlyRate,
    isAvailable: c.counselorProfile!.isAvailable,
    rating: c.counselorProfile!.rating,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-serena-cream-50 via-serena-lavender-50 to-serena-sky-50 text-indigo-950">
      {session?.user ? (
        <AppSiteHeader
          role={session.user.role as "PATIENT" | "COUNSELOR" | "ADMIN"}
          activeItem="counselors"
          userName={session.user.name}
          photoUrl={session.user.photoUrl}
        />
      ) : (
        <PublicSiteHeader activeItem="counselors" />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-rounded text-3xl sm:text-4xl font-bold text-indigo-950">Temukan Pendengar Terbaik Anda</h1>
          <p className="text-indigo-950/60 mt-2 font-light max-w-2xl">
            Pilihlah psikolog atau konselor profesional Serena yang paling sesuai untuk membantu membimbing kesehatan emosional Anda.
          </p>
        </div>

        <CounselorsList initialCounselors={formattedCounselors} />
      </main>
    </div>
  );
}
