import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = ComponentProps<"div"> & {
  interactive?: boolean;
};

export function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card bg-washi-surface p-6 shadow-soft ring-1 ring-washi-line",
        interactive &&
          "transition-[transform,box-shadow] duration-200 ease-out-quart hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}
