import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const control =
  "w-full min-h-12 rounded-control bg-washi-surface px-4 text-base text-sumi " +
  "ring-1 ring-inset ring-washi-line transition-shadow duration-200 " +
  "placeholder:text-sumi-soft/70 hover:ring-sakura-200 " +
  "focus:outline-none focus:ring-2 focus:ring-sora-600 " +
  "aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-beni disabled:bg-washi disabled:opacity-70";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

/** Label always sits above the control; hint and error are linked via aria-describedby. */
export function Field({ id, label, hint, error, required, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-medium text-sumi">
        {label}
        {required && (
          <span className="ml-1 text-beni" aria-hidden>
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-sumi-soft">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-beni">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, { hint, error }: { hint?: string; error?: string }) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(control, "cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}
