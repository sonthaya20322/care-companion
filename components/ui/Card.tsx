import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = ComponentProps<"div"> & {
  interactive?: boolean;
  /** Set false when the card has full-bleed sections (e.g. a colored header strip). */
  padded?: boolean;
};

export function Card({ interactive = false, padded = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card bg-washi-surface shadow-soft ring-1 ring-washi-line",
        padded && "p-6",
        interactive &&
          "transition-[transform,box-shadow] duration-200 ease-out-quart hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}
