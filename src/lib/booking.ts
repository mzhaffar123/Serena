import { BookingStatus } from "@prisma/client";

export type AvailabilityMap = Record<string, string[]>;

export type UpcomingAvailabilityDay = {
  dateKey: string;
  label: string;
  fullLabel: string;
  slots: {
    time: string;
    dateTimeKey: string;
  }[];
};

const INDONESIAN_WEEKDAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export function normalizeAvailability(input: unknown): AvailabilityMap {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  return Object.entries(input as Record<string, unknown>).reduce<AvailabilityMap>((acc, [day, slots]) => {
    if (!Array.isArray(slots)) {
      return acc;
    }

    const normalizedSlots = slots
      .filter((slot): slot is string => typeof slot === "string" && /^\d{2}:\d{2}$/.test(slot))
      .sort((a, b) => a.localeCompare(b));

    if (normalizedSlots.length > 0) {
      acc[day] = normalizedSlots;
    }

    return acc;
  }, {});
}

export function getIndonesianDayName(date: Date) {
  return INDONESIAN_WEEKDAYS[date.getDay()];
}

export function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toLocalTimeKey(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function getDateTimeKey(date: Date) {
  return `${toLocalDateKey(date)}T${toLocalTimeKey(date)}`;
}

export function parseScheduledAt(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }

  const scheduledAt = new Date(`${date}T${time}:00`);

  if (Number.isNaN(scheduledAt.getTime())) {
    return null;
  }

  return scheduledAt;
}

export function getAvailableTimesForDate(availabilityInput: unknown, date: Date) {
  const availability = normalizeAvailability(availabilityInput);
  return availability[getIndonesianDayName(date)] ?? [];
}

export function getUpcomingAvailabilityDays(
  availabilityInput: unknown,
  daysAhead = 14,
  reservedDateTimeKeys = new Set<string>()
): UpcomingAvailabilityDay[] {
  const availability = normalizeAvailability(availabilityInput);
  const now = new Date();
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const result: UpcomingAvailabilityDay[] = [];

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + offset);

    const dateKey = toLocalDateKey(date);
    const dayName = getIndonesianDayName(date);
    const slots = (availability[dayName] ?? [])
      .map((time) => {
        const scheduledAt = parseScheduledAt(dateKey, time);
        const dateTimeKey = `${dateKey}T${time}`;

        if (!scheduledAt || scheduledAt <= now || reservedDateTimeKeys.has(dateTimeKey)) {
          return null;
        }

        return {
          time,
          dateTimeKey,
        };
      })
      .filter((slot): slot is { time: string; dateTimeKey: string } => slot !== null);

    if (slots.length > 0) {
      result.push({
        dateKey,
        label: `${dayName}, ${date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        })}`,
        fullLabel: date.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        slots,
      });
    }
  }

  return result;
}

export function getBookingStatusMeta(status: BookingStatus | string) {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return {
        label: "Dikonfirmasi",
        className: "border-serena-sage-100 bg-serena-sage-50 text-serena-sage-700",
      };
    case BookingStatus.COMPLETED:
      return {
        label: "Selesai",
        className: "border-serena-sky-100 bg-serena-sky-50 text-serena-sky-700",
      };
    case BookingStatus.CANCELLED:
      return {
        label: "Dibatalkan",
        className: "border-rose-100 bg-rose-50 text-rose-700",
      };
    case BookingStatus.PENDING:
    default:
      return {
        label: "Menunggu konfirmasi",
        className: "border-amber-100 bg-amber-50 text-amber-700",
      };
  }
}
