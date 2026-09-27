import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-card border border-dashed border-sakura-200 bg-sakura-50/60 p-8",
        className,
      )}
    >
      <h3 className="text-xl text-sumi">{title}</h3>
      <p className="max-w-prose text-sumi-soft">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
