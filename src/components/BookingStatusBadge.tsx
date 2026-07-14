import { BookingStatus } from "@prisma/client";
import { getBookingStatusMeta } from "@/lib/booking";

type BookingStatusBadgeProps = {
  status: BookingStatus | string;
  className?: string;
};

export default function BookingStatusBadge({ status, className = "" }: BookingStatusBadgeProps) {
  const meta = getBookingStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.className} ${className}`.trim()}
    >
      {meta.label}
    </span>
  );
}
