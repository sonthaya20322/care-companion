import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium " +
  "transition-[transform,background-color,box-shadow] duration-200 ease-out-quart " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 " +
  "aria-busy:cursor-progress";

const variants: Record<Variant, string> = {
  primary: "bg-sakura-600 text-white shadow-soft hover:bg-sakura-700",
  secondary:
    "bg-washi-surface text-sakura-700 ring-1 ring-inset ring-sakura-200 hover:bg-sakura-50",
  ghost: "text-sora-700 hover:bg-sora-50",
  danger: "bg-beni-bg text-beni ring-1 ring-inset ring-beni/30 hover:bg-beni/10",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-7 text-lg",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({
  variant,
  size,
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
