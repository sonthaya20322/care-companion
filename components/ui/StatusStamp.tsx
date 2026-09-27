import { cn } from "@/lib/utils/cn";

export type StampTone = "sora" | "matcha" | "fuji" | "yamabuki" | "beni" | "sumi";

const tones: Record<StampTone, string> = {
  sora: "bg-sora-100 text-sora-700 ring-sora-200",
  matcha: "bg-matcha-bg text-matcha ring-matcha/25",
  fuji: "bg-fuji-bg text-fuji ring-fuji/25",
  yamabuki: "bg-yamabuki-bg text-yamabuki ring-yamabuki/25",
  beni: "bg-beni-bg text-beni ring-beni/25",
  sumi: "bg-washi text-sumi-soft ring-washi-line",
};

const icons: Record<StampTone, string> = {
  sora: "M12 7v5l3 2",
  matcha: "M7.5 12.5l3 3 6-6.5",
  fuji: "M9 8.5v7l6-3.5z",
  yamabuki: "M12 8v4.5M12 15.5v.5",
  beni: "M9 9l6 6M15 9l-6 6",
  sumi: "M8 12h8",
};

type StatusStampProps = {
  tone: StampTone;
  label: string;
  /** Plays the hanko "press" animation; use only when the status has just changed. */
  stamp?: boolean;
  className?: string;
};

/** Status badge that always pairs color with an icon and text. */
export function StatusStamp({ tone, label, stamp = false, className }: StatusStampProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-2 pr-3 text-sm font-medium ring-1 ring-inset",
        tones[tone],
        stamp && "animate-stamp",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
        <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d={icons[tone]}
          fill={tone === "fuji" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </span>
  );
}
