import { cn } from "@/lib/utils/cn";

/** Result line under a form: success in matcha, failure in beni; announced politely. */
export function FormStatus({ ok, message, className }: { ok?: boolean; message?: string; className?: string }) {
  return (
    <p
      aria-live="polite"
      className={cn(
        message && "rounded-control px-4 py-3 font-medium",
        message && (ok ? "bg-matcha-bg text-matcha" : "bg-beni-bg text-beni"),
        className,
      )}
    >
      {message}
    </p>
  );
}
