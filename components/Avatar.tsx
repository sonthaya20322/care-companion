import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const sizes = { sm: "size-11 text-lg", md: "size-16 text-2xl", lg: "size-24 text-4xl" } as const;
const pixels = { sm: 44, md: 64, lg: 96 } as const;

type AvatarProps = {
  name: string;
  src: string | null;
  size?: keyof typeof sizes;
  className?: string;
};

/** Profile photo, or the first letter of the name on a sakura disc. Decorative: the name is always shown next to it. */
export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initial = name.trim().charAt(0) || "?";
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sakura-100 font-display text-sakura-700 ring-2 ring-washi-surface",
        sizes[size],
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" width={pixels[size]} height={pixels[size]} className="size-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
