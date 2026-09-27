import { cn } from "@/lib/utils/cn";

export function RatingText({ avg, count, className }: { avg: number; count: number; className?: string }) {
  if (count === 0) {
    return <p className={cn("text-sm text-sumi-soft", className)}>ยังไม่มีรีวิว</p>;
  }
  return (
    <p className={cn("flex items-center gap-1 text-sm text-sumi", className)}>
      <svg viewBox="0 0 24 24" className="size-4 text-yamabuki" aria-hidden>
        <path
          fill="currentColor"
          d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"
        />
      </svg>
      <span className="font-medium">{avg.toFixed(1)}</span>
      <span className="text-sumi-soft">({count} รีวิว)</span>
      <span className="sr-only">คะแนนเฉลี่ย {avg.toFixed(1)} จาก 5</span>
    </p>
  );
}
