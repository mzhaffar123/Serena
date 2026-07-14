"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  Link2,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

type ProfileFormProps = {
  initialUser: {
    name: string;
    email: string;
    role: string;
    photoUrl: string | null;
    joinedAt: string;
  };
  initialCounselorProfile: {
    specialization: string;
    bio: string;
    experienceYrs: number;
    hourlyRate: number;
    isAvailable: boolean;
  } | null;
};

export default function ProfileForm({ initialUser, initialCounselorProfile }: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initialUser.name);
  const [photoUrl, setPhotoUrl] = useState(initialUser.photoUrl ?? "");
  const [specialization, setSpecialization] = useState(initialCounselorProfile?.specialization ?? "");
  const [bio, setBio] = useState(initialCounselorProfile?.bio ?? "");
  const [experienceYrs, setExperienceYrs] = useState(String(initialCounselorProfile?.experienceYrs ?? 0));
  const [hourlyRate, setHourlyRate] = useState(String(initialCounselorProfile?.hourlyRate ?? 100000));
  const [isAvailable, setIsAvailable] = useState(initialCounselorProfile?.isAvailable ?? true);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isCounselor = initialUser.role === "COUNSELOR";
  const normalizedInitialPhoto = initialUser.photoUrl?.trim() ?? "";
  const previewPhoto = useMemo(() => photoUrl.trim() || null, [photoUrl]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("serena:profile-photo-preview", {
        detail: {
          photoUrl: previewPhoto,
        },
      })
    );
  }, [previewPhoto]);
  const hasPendingPhotoChange = (previewPhoto ?? "") !== normalizedInitialPhoto;
  const isUploadedFromDevice = previewPhoto?.startsWith("/uploads/profile-photos/") ?? false;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeBytes = 3 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Format foto harus JPG, PNG, atau WebP.");
      e.target.value = "";
      return;
    }

    if (file.size > maxSizeBytes) {
      setError("Ukuran foto maksimal 3 MB.");
      e.target.value = "";
      return;
    }

    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah foto profil.");
      }

      setPhotoUrl(data.photoUrl);
      setSuccess("Foto berhasil diunggah. Klik simpan perubahan untuk menyimpan profil.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah foto.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl("");
    setError("");
    setSuccess("Foto profil akan dihapus setelah Anda menekan simpan perubahan.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name,
        photoUrl,
        ...(isCounselor
          ? {
              specialization,
              bio,
              experienceYrs: Number(experienceYrs),
              hourlyRate: Number(hourlyRate),
              isAvailable,
            }
          : {}),
      };

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan profil.");
      }

      await update({
        name: data.user.name,
        photoUrl: data.user.photoUrl,
      });

      setSuccess("Profil berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.3fr]">
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              {previewPhoto ? (
                <Image
                  src={previewPhoto}
                  alt={name}
                  width={120}
                  height={120}
                  className="h-28 w-28 rounded-[2rem] border border-serena-lavender-100 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-serena-lavender-50 text-serena-lavender-600 shadow-sm">
                  <UserRound className="h-10 w-10" />
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white bg-white text-serena-lavender-600 shadow-sm">
                {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </span>
            </div>

            <h2 className="font-rounded text-2xl font-bold text-indigo-950">{name}</h2>
            <p className="mt-1 text-sm text-indigo-950/55">{initialUser.email}</p>
            <div className="mt-4 inline-flex rounded-full bg-serena-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-serena-sky-700">
              {initialUser.role === "COUNSELOR" ? "Konselor" : "Pasien"}
            </div>
          </div>

          <div className="mt-8 space-y-4 rounded-3xl bg-indigo-50/60 p-5 text-sm text-indigo-950/65">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-serena-sage-600" />
              <div className="text-left">
                <p className="font-semibold text-indigo-950">Akun aktif di Serena</p>
                <p className="mt-1 leading-relaxed">
                  Bergabung sejak{" "}
                  {new Date(initialUser.joinedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-serena-lavender-600 transition hover:text-serena-lavender-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke dashboard
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <h2 className="font-rounded text-3xl font-bold text-indigo-950">Profil Anda</h2>
          <p className="mt-2 text-sm leading-relaxed text-indigo-950/60">
            Perbarui informasi akun agar pengalaman Anda di Serena tetap personal, aman, dan nyaman.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-indigo-950">Nama lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-indigo-950 outline-none transition focus:border-serena-lavender-300 focus:ring-2 focus:ring-serena-lavender-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-indigo-950">Email</label>
            <input
              type="email"
              value={initialUser.email}
              disabled
              className="w-full rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-950/60 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-indigo-950">Role akun</label>
            <input
              type="text"
              value={initialUser.role === "COUNSELOR" ? "Konselor" : "Pasien"}
              disabled
              className="w-full rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-950/60 outline-none"
            />
          </div>

          <div className="sm:col-span-2 rounded-[1.75rem] border border-serena-lavender-100 bg-gradient-to-br from-serena-lavender-50/60 via-white to-serena-sky-50/50 p-5 sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex flex-col items-center gap-3 text-center lg:min-w-[10rem]">
                <div className="relative">
                  {previewPhoto ? (
                    <Image
                      src={previewPhoto}
                      alt={name}
                      width={132}
                      height={132}
                      className="h-32 w-32 rounded-[2rem] border-4 border-white object-cover shadow-lg shadow-indigo-950/5"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] border-4 border-white bg-serena-lavender-50 text-serena-lavender-500 shadow-lg shadow-indigo-950/5">
                      <UserRound className="h-11 w-11" />
                    </div>
                  )}

                  <span className="absolute -bottom-2 -right-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white bg-white text-serena-lavender-600 shadow-sm">
                    {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-indigo-950">
                    {previewPhoto ? "Foto siap digunakan" : "Belum ada foto profil"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-indigo-950/55">
                    {previewPhoto
                      ? hasPendingPhotoChange
                        ? "Perubahan foto belum disimpan."
                        : "Foto aktif pada akun Anda."
                      : "Tambahkan foto agar profil terasa lebih personal."}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-950/55">
                    JPG · PNG · WebP
                  </span>
                  <span className="rounded-full border border-white bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-950/55">
                    Maks. 3 MB
                  </span>
                  {previewPhoto && (
                    <span className="rounded-full border border-serena-sage-100 bg-serena-sage-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-serena-sage-700">
                      {isUploadedFromDevice ? "Dari perangkat" : "URL manual"}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-rounded text-2xl font-bold text-indigo-950">
                  Atur foto profil Anda
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-indigo-950/60">
                  Gunakan foto yang jelas dan nyaman dilihat agar akun Anda terasa lebih terpercaya,
                  terutama saat berinteraksi dengan konselor atau klien di Serena.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-serena-lavender-600">
                    {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    {uploadingPhoto ? "Mengunggah foto..." : "Unggah dari perangkat"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto || loading}
                      className="sr-only"
                    />
                  </label>

                  {previewPhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus foto
                    </button>
                  )}
                </div>

                {previewPhoto && (
                  <div className="mt-4 rounded-2xl border border-white/90 bg-white/85 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-serena-sage-600" />
                      <div>
                        <p className="text-sm font-semibold text-indigo-950">Sumber foto saat ini</p>
                        <p className="mt-1 break-all text-xs leading-relaxed text-indigo-950/55">
                          {previewPhoto}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <details className="mt-4 rounded-2xl border border-indigo-100 bg-white/80 p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-indigo-950">
                    <span className="inline-flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-serena-lavender-600" />
                      Gunakan URL manual
                    </span>
                    <ChevronDown className="h-4 w-4 text-indigo-950/45" />
                  </summary>

                  <div className="mt-4">
                    <input
                      type="text"
                      inputMode="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-indigo-950 outline-none transition focus:border-serena-lavender-300 focus:ring-2 focus:ring-serena-lavender-100"
                      spellCheck={false}
                    />
                    <p className="mt-2 text-xs leading-relaxed text-indigo-950/45">
                      Opsional. Pakai ini jika Anda ingin memakai tautan gambar dari luar. Kosongkan
                      field ini bila ingin menghapus foto profil.
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>

          {isCounselor && (
            <>
              <div className="sm:col-span-2 mt-4 border-t border-indigo-100 pt-6">
                <h3 className="font-rounded text-2xl font-bold text-indigo-950">Profil Profesional</h3>
                <p className="mt-2 text-sm text-indigo-950/60">
                  Kelola informasi yang ditampilkan pada halaman profil konselor dan detail booking.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-indigo-950">Spesialisasi</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Contoh: Anxiety, Burnout, Hubungan"
                  className="w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-indigo-950 outline-none transition focus:border-serena-sky-300 focus:ring-2 focus:ring-serena-sky-100"
                  required={isCounselor}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-indigo-950">Bio singkat</label>
                <textarea
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritakan pendekatan konseling dan fokus utama Anda."
                  className="w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-indigo-950 outline-none transition focus:border-serena-sky-300 focus:ring-2 focus:ring-serena-sky-100"
                  required={isCounselor}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-indigo-950">Pengalaman (tahun)</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={experienceYrs}
                  onChange={(e) => setExperienceYrs(e.target.value)}
                  className="w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-indigo-950 outline-none transition focus:border-serena-sky-300 focus:ring-2 focus:ring-serena-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-indigo-950">Tarif per jam (Rp)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-indigo-950 outline-none transition focus:border-serena-sky-300 focus:ring-2 focus:ring-serena-sky-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="inline-flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm font-medium text-indigo-950">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 rounded border-indigo-300 text-serena-sage-600 focus:ring-serena-sage-300"
                  />
                  Sedang menerima booking baru
                </label>
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-6 rounded-2xl border border-serena-sage-100 bg-serena-sage-50 px-4 py-3 text-sm text-serena-sage-700">
            {success}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-white px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          <button
            type="submit"
            disabled={loading || uploadingPhoto}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-serena-lavender-600 disabled:pointer-events-none disabled:opacity-60"
          >
            {loading || uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
