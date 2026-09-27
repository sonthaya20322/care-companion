import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type AppNameProps = {
  className?: string;
};

/** Brand lockup: a hanko-style seal with two figures walking together, plus the wordmark. */
export function AppName({ className }: AppNameProps) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5 rounded-control", className)}
      aria-label="Care Companion หน้าแรก"
    >
      <svg
        viewBox="0 0 40 40"
        className="size-9 -rotate-6 transition-transform duration-300 ease-out-quart group-hover:rotate-0 sm:size-10"
        aria-hidden
      >
        <circle cx="20" cy="20" r="18" className="fill-sakura-100 stroke-sakura-600" strokeWidth="2" />
        <circle cx="15" cy="14" r="3.2" className="fill-sakura-600" />
        <circle cx="25.5" cy="15.5" r="3.2" className="fill-sora-600" />
        <path
          d="M11 29c0-5 2-9 4-9s4 4 4 9M21.5 29c0-4.5 1.8-8 4-8s4 3.5 4 8"
          fill="none"
          className="stroke-sumi"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M17.5 23.5h6" className="stroke-sumi" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="whitespace-nowrap font-brand text-lg font-bold tracking-tight text-sumi sm:text-xl">
        Care<span className="text-sakura-600"> Companion</span>
      </span>
    </Link>
  );
}
