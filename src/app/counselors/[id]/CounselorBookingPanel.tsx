"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Loader2,
  LogIn,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import type { UpcomingAvailabilityDay } from "@/lib/booking";

type CounselorBookingPanelProps = {
  counselorId: string;
  counselorName: string;
  hourlyRate: number;
  isAcceptingBookings: boolean;
  availabilityDays: UpcomingAvailabilityDay[];
  nextAvailableLabel: string | null;
  isLoggedIn: boolean;
  viewerRole: string | null;
  loginUrl: string;
};

export default function CounselorBookingPanel({
  counselorId,
  counselorName,
  hourlyRate,
  isAcceptingBookings,
  availabilityDays,
  nextAvailableLabel,
  isLoggedIn,
  viewerRole,
  loginUrl,
}: CounselorBookingPanelProps) {
  const router = useRouter();
  const [selectedDateKey, setSelectedDateKey] = useState(availabilityDays[0]?.dateKey ?? "");
  const [selectedTime, setSelectedTime] = useState(availabilityDays[0]?.slots[0]?.time ?? "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedDay = useMemo(
    () => availabilityDays.find((day) => day.dateKey === selectedDateKey) ?? availabilityDays[0] ?? null,
    [availabilityDays, selectedDateKey]
  );

  useEffect(() => {
    if (!selectedDay) {
      setSelectedTime("");
      return;
    }

    const slotExists = selectedDay.slots.some((slot) => slot.time === selectedTime);
    if (!slotExists) {
      setSelectedTime(selectedDay.slots[0]?.time ?? "");
    }
  }, [selectedDay, selectedTime]);

  const canBook = isLoggedIn && viewerRole === "PATIENT" && isAcceptingBookings && availabilityDays.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDay || !selectedTime) {
      setError("Pilih tanggal dan jam konseling terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          counselorId,
          date: selectedDay.dateKey,
          time: selectedTime,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat booking.");
      }

      setSuccess(`Booking dengan ${counselorName} berhasil dibuat. Anda akan diarahkan ke dashboard pasien...`);
      setTimeout(() => {
        router.push("/patient?booking=success");
        router.refresh();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-24 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-6 rounded-2xl bg-serena-lavender-50/70 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-serena-lavender-600 shadow-sm">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-950">Booking Sesi Konseling</p>
            <p className="text-xs text-indigo-950/55">Mulai dari Rp {hourlyRate.toLocaleString("id-ID")} / jam</p>
          </div>
        </div>
      </div>

      {nextAvailableLabel && (
        <div className="mb-5 rounded-2xl border border-serena-sky-100 bg-serena-sky-50/70 px-4 py-3 text-sm text-serena-sky-800">
          <p className="font-semibold">Slot terdekat</p>
          <p className="mt-1 leading-relaxed">{nextAvailableLabel}</p>
        </div>
      )}

      {!isAcceptingBookings || availabilityDays.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-5 text-sm text-indigo-950/65">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-serena-sage-600" />
            <p>
              Konselor ini belum memiliki slot aktif dalam waktu dekat. Anda tetap bisa kembali ke daftar konselor untuk mencari pilihan lain.
            </p>
          </div>
          <Link
            href="/counselors"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-serena-lavender-600"
          >
            Cari konselor lain
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : !isLoggedIn ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-5 text-sm text-indigo-950/65">
          <div className="flex items-start gap-3">
            <LogIn className="mt-0.5 h-5 w-5 shrink-0 text-serena-lavender-600" />
            <p>Silakan login sebagai pasien untuk memilih slot dan membuat booking dengan konselor ini.</p>
          </div>
          <Link
            href={loginUrl}
            className="inline-flex items-center gap-2 rounded-xl bg-serena-lavender-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-serena-lavender-700"
          >
            Login untuk booking
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : viewerRole !== "PATIENT" ? (
        <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-5 text-sm leading-relaxed text-indigo-950/65">
          Booking sesi saat ini hanya tersedia untuk akun pasien. Anda masih dapat melihat profil, jadwal, dan artikel konselor ini.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-indigo-950">Pilih tanggal sesi</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {availabilityDays.map((day) => {
                const isSelected = day.dateKey === selectedDay?.dateKey;

                return (
                  <button
                    key={day.dateKey}
                    type="button"
                    onClick={() => {
                      setSelectedDateKey(day.dateKey);
                      setError("");
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                      isSelected
                        ? "border-serena-lavender-300 bg-serena-lavender-50 ring-2 ring-serena-lavender-100"
                        : "border-indigo-100 bg-white hover:border-serena-lavender-200 hover:bg-serena-lavender-50/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-indigo-950">{day.label}</p>
                    <p className="mt-1 text-xs text-indigo-950/50">{day.slots.length} slot tersedia</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-950">
              <Clock3 className="h-4 w-4 text-serena-sky-600" />
              Pilih jam konseling
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {selectedDay?.slots.map((slot) => {
                const isSelected = selectedTime === slot.time;

                return (
                  <button
                    key={slot.dateTimeKey}
                    type="button"
                    onClick={() => {
                      setSelectedTime(slot.time);
                      setError("");
                    }}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${
                      isSelected
                        ? "border-serena-sky-300 bg-serena-sky-50 text-serena-sky-700 ring-2 ring-serena-sky-100"
                        : "border-indigo-100 bg-white text-indigo-950/70 hover:border-serena-sky-200 hover:bg-serena-sky-50/40"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
            {selectedDay && <p className="mt-2 text-xs text-indigo-950/45">{selectedDay.fullLabel}</p>}
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-950">
              <MessageSquareText className="h-4 w-4 text-serena-sage-600" />
              Catatan awal untuk konselor
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Contoh: Saya ingin berkonsultasi tentang kecemasan menjelang ujian dan sulit tidur belakangan ini."
              className="w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-indigo-950 outline-none transition focus:border-serena-lavender-300 focus:ring-2 focus:ring-serena-lavender-100"
            />
            <p className="mt-2 text-right text-xs text-indigo-950/40">{notes.length}/1000</p>
          </div>

          {error && <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
          {success && <p className="rounded-2xl border border-serena-sage-100 bg-serena-sage-50 px-4 py-3 text-sm text-serena-sage-700">{success}</p>}

          <button
            type="submit"
            disabled={!canBook || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-serena-lavender-600 disabled:pointer-events-none disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Buat booking sekarang
          </button>
        </form>
      )}
    </div>
  );
}
