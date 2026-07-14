import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const formData = await req.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "File foto profil tidak ditemukan" }, { status: 400 });
    }

    if (fileEntry.size === 0) {
      return NextResponse.json({ error: "File yang dipilih kosong" }, { status: 400 });
    }

    if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Ukuran foto maksimal 3 MB" }, { status: 400 });
    }

    const extension = ALLOWED_MIME_TYPES[fileEntry.type];

    if (!extension) {
      return NextResponse.json(
        { error: "Format foto harus JPG, PNG, atau WebP" },
        { status: 400 }
      );
    }

    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "profile-photos");
    await mkdir(uploadDirectory, { recursive: true });

    const fileName = `${session.user.id}-${Date.now()}.${extension}`;
    const filePath = path.join(uploadDirectory, fileName);
    const buffer = Buffer.from(await fileEntry.arrayBuffer());

    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: "Foto profil berhasil diunggah",
      photoUrl: `/uploads/profile-photos/${fileName}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengunggah foto profil" },
      { status: 500 }
    );
  }
}
