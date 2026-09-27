import type { CSSProperties } from "react";

const petals = [
  { left: "12%", x: "-28px", delay: "0ms" },
  { left: "30%", x: "18px", delay: "120ms" },
  { left: "52%", x: "-12px", delay: "60ms" },
  { left: "70%", x: "30px", delay: "200ms" },
  { left: "88%", x: "-20px", delay: "140ms" },
];

/** One-off sakura burst for a moment worth celebrating (e.g. a booking just sent). */
export function Petals() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-full overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.left}
          className="absolute bottom-2 size-3 animate-petal rounded-[60%_0_60%_0] bg-sakura-300 opacity-0"
          style={{ left: p.left, animationDelay: p.delay, "--petal-x": p.x } as CSSProperties}
        />
      ))}
    </div>
  );
}
