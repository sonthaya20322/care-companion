import Link from "next/link";
import { AppName } from "@/components/AppName";
import { ButtonLink } from "@/components/ui/Button";

const navItems = [
  { href: "/how-it-works", label: "วิธีใช้บริการ" },
  { href: "/companions", label: "ค้นหาผู้ช่วย" },
  { href: "/become-companion", label: "สมัครเป็นผู้ช่วย" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-washi-line bg-washi/90 backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-5">
        <AppName />

        <nav aria-label="เมนูหลัก" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-control px-4 py-2.5 text-sumi-soft transition-colors hover:bg-sakura-50 hover:text-sumi"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/login" variant="primary">
            เข้าสู่ระบบ
          </ButtonLink>

          <details className="group relative md:hidden">
            <summary
              className="flex size-12 cursor-pointer list-none items-center justify-center rounded-control text-sumi hover:bg-sakura-50 [&::-webkit-details-marker]:hidden"
              aria-label="เปิดเมนู"
            >
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-opacity group-open:opacity-0"
                />
              </svg>
            </summary>
            <nav
              aria-label="เมนูหลัก (มือถือ)"
              className="absolute right-0 top-14 w-60 animate-rise rounded-card bg-washi-surface p-2 shadow-lift ring-1 ring-washi-line"
            >
              <ul className="flex flex-col">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex min-h-12 items-center rounded-control px-4 text-sumi hover:bg-sakura-50"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
