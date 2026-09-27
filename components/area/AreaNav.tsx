"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export type AreaNavItem = { href: string; label: string };

/** Section navigation for a role area; the root item is active only on exact match. */
export function AreaNav({ items, label }: { items: AreaNavItem[]; label: string }) {
  const pathname = usePathname();
  const root = items[0]?.href;

  return (
    <nav aria-label={label} className="-mx-5 overflow-x-auto px-5 md:mx-0 md:overflow-visible md:px-0">
      <ul className="flex gap-1 md:flex-col">
        {items.map((item) => {
          const active =
            item.href === root ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center whitespace-nowrap rounded-control px-4 transition-colors",
                  active ? "bg-sakura-100 font-medium text-sakura-700" : "text-sumi-soft hover:bg-sakura-50 hover:text-sumi",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
