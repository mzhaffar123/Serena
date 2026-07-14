import { unlink } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isLocalProfilePhotoPath(value: string) {
  return value.startsWith("/uploads/profile-photos/");
}

function isValidProfilePhotoUrl(value: string) {
  return isValidHttpUrl(value) || isLocalProfilePhotoPath(value);
}

async function deleteLocalProfilePhoto(photoUrl: string | null) {
  if (!photoUrl || !isLocalProfilePhotoPath(photoUrl)) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", photoUrl.replace(/^\//, ""));
  await unlink(filePath).catch(() => undefined);
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const existingUser = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        photoUrl: true,
      },
    });

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const photoUrlInput = typeof body?.photoUrl === "string" ? body.photoUrl.trim() : "";
    const photoUrl = photoUrlInput ? photoUrlInput : null;

    if (!name) {
      return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 });
    }

    if (name.length > 120) {
      return NextResponse.json({ error: "Nama maksimal 120 karakter" }, { status: 400 });
    }

    if (photoUrl && !isValidProfilePhotoUrl(photoUrl)) {
      return NextResponse.json(
        { error: "Foto profil harus berupa URL http/https yang valid atau hasil upload dari aplikasi" },
        { status: 400 }
      );
    }

    let counselorProfilePayload:
      | {
          specialization: string;
          bio: string;
          experienceYrs: number;
          hourlyRate: number;
          isAvailable: boolean;
        }
      | null = null;

    if (session.user.role === "COUNSELOR") {
      const specialization = typeof body?.specialization === "string" ? body.specialization.trim() : "";
      const bio = typeof body?.bio === "string" ? body.bio.trim() : "";
      const isAvailable = Boolean(body?.isAvailable);
      const experienceYrs = Number(body?.experienceYrs);
      const hourlyRate = Number(body?.hourlyRate);

      if (!specialization) {
        return NextResponse.json({ error: "Spesialisasi wajib diisi untuk akun konselor" }, { status: 400 });
      }

      if (!bio) {
        return NextResponse.json({ error: "Bio konselor wajib diisi" }, { status: 400 });
      }

      if (!Number.isInteger(experienceYrs) || experienceYrs < 0 || experienceYrs > 60) {
        return NextResponse.json({ error: "Pengalaman kerja harus berupa angka 0 sampai 60" }, { status: 400 });
      }

      if (!Number.isInteger(hourlyRate) || hourlyRate < 0) {
        return NextResponse.json({ error: "Tarif per jam harus berupa angka yang valid" }, { status: 400 });
      }

      counselorProfilePayload = {
        specialization,
        bio,
        experienceYrs,
        hourlyRate,
        isAvailable,
      };
    }

    const updatedUser = await db.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name,
          photoUrl,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          photoUrl: true,
        },
      });

      if (counselorProfilePayload) {
        await tx.counselorProfile.upsert({
          where: {
            userId: session.user.id,
          },
          update: counselorProfilePayload,
          create: {
            userId: session.user.id,
            ...counselorProfilePayload,
            rating: 5,
            availability: {},
          },
        });
      }

      return user;
    });

    if (existingUser?.photoUrl && existingUser.photoUrl !== updatedUser.photoUrl) {
      await deleteLocalProfilePhoto(existingUser.photoUrl);
    }

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      user: updatedUser,
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan saat memperbarui profil" }, { status: 500 });
  }
}
