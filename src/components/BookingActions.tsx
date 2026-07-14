"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type BookingActionStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

type BookingAction = {
  status: BookingActionStatus;
  label: string;
  tone?: "primary" | "success" | "danger" | "neutral";
};

type BookingActionsProps = {
  bookingId: string;
  actions: BookingAction[];
};

const toneClasses: Record<NonNullable<BookingAction["tone"]>, string> = {
  primary: "border-transparent bg-indigo-950 text-white hover:bg-serena-lavender-600",
  success: "border-transparent bg-serena-sage-600 text-white hover:bg-serena-sage-700",
  danger: "border-transparent bg-rose-600 text-white hover:bg-rose-700",
  neutral: "border-indigo-100 bg-white text-indigo-950 hover:bg-indigo-50",
};

export default function BookingActions({ bookingId, actions }: BookingActionsProps) {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState<BookingActionStatus | null>(null);
  const [error, setError] = useState("");

  const handleAction = async (status: BookingActionStatus) => {
    setLoadingStatus(status);
    setError("");

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui status booking.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const tone = action.tone ?? "neutral";
          const isLoading = loadingStatus === action.status;

          return (
            <button
              key={action.status}
              type="button"
              onClick={() => handleAction(action.status)}
              disabled={loadingStatus !== null}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${toneClasses[tone]} disabled:pointer-events-none disabled:opacity-60`}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {action.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
