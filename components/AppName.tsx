import Image from "next/image";
import Link from "next/link";
import logo from "@/public/assets/images/care-logo.png";
import { cn } from "@/lib/utils/cn";

type AppNameProps = {
  className?: string;
};

/** Brand lockup: the circular logo mark plus the wordmark. */
export function AppName({ className }: AppNameProps) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2 rounded-control sm:gap-2.5", className)}
      aria-label="Care Companion หน้าแรก"
    >
      <Image
        src={logo}
        alt=""
        sizes="40px"
        loading="eager"
        className="size-9 -rotate-6 transition-transform duration-300 ease-out-quart group-hover:rotate-0 sm:size-10"
      />
      <span className="whitespace-nowrap font-brand text-base font-bold tracking-tight text-sumi min-[400px]:text-lg sm:text-xl">
        Care<span className="text-sakura-600"> Companion</span>
      </span>
    </Link>
  );
}
