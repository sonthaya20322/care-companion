import { useId, type ReactNode } from "react";

export function BookingSection({ title, empty, children }: { title: string; empty: string; children: ReactNode[] }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-4 font-display text-xl text-sumi">
        {title} <span className="text-base text-sumi-soft">({children.length})</span>
      </h2>
      {children.length === 0 ? (
        <p className="text-sumi-soft">{empty}</p>
      ) : (
        <ul className="stagger flex flex-col gap-3">{children}</ul>
      )}
    </section>
  );
}
