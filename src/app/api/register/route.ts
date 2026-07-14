import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Mohon isi semua data yang diperlukan" },
        { status: 400 }
      );
    }

    if (role !== "PATIENT" && role !== "COUNSELOR") {
      return NextResponse.json(
        { error: "Role tidak valid" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and profile in transaction
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          isVerified: false, // Default false, verify later or mock
        },
      });

      if (role === "COUNSELOR") {
        await tx.counselorProfile.create({
          data: {
            userId: user.id,
            specialization: "Umum",
            bio: "Halo, saya adalah konselor baru di Serena. Siap membantu perjalanan kesehatan mental Anda.",
            experienceYrs: 0,
            hourlyRate: 100000, // Default 100k IDR
            isAvailable: true,
            rating: 5.0,
            availability: {
              "Senin": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
              "Selasa": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
              "Rabu": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
              "Kamis": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
              "Jumat": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"]
            },
          },
        });
      }

      return user;
    });

    return NextResponse.json(
      { message: "Registrasi berhasil", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat registrasi" },
      { status: 500 }
    );
  }
}
