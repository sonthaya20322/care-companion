import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { AppName } from "@/components/AppName";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { homePathFor, roleLabels } from "@/lib/domain/roles";
import { getCurrentProfile } from "@/lib/services/session";

const publicNav = [
  { href: "/how-it-works", label: "วิธีใช้บริการ" },
  { href: "/companions", label: "ค้นหาผู้ช่วย" },
  { href: "/become-companion", label: "สมัครเป็นผู้ช่วย" },
];

export async function SiteHeader() {
  // The header must never take the whole page down; pages that need the profile load it themselves.
  const profile = await getCurrentProfile().catch((error: unknown) => {
    unstable_rethrow(error);
    console.error("SiteHeader: profile unavailable", { error: String(error) });
    return null;
  });
  const home = profile ? homePathFor(profile.role) : null;
  const navItems = profile?.role === "companion" || profile?.role === "admin"
    ? publicNav.filter((item) => item.href !== "/become-companion")
    : publicNav;

  return (
    <header className="sticky top-0 z-30 border-b border-washi-line bg-washi/90 backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-5">
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

        <div className="flex items-center gap-1 sm:gap-2">
          {profile && home ? (
            <>
              <ButtonLink href={home} variant="primary" className="max-sm:px-3.5">
                {profile.role ? "บัญชีของฉัน" : "ตั้งค่าบัญชี"}
              </ButtonLink>
              <form action={signOut} className="hidden md:block">
                <button type="submit" className={buttonClasses("ghost")}>
                  ออกจากระบบ
                </button>
              </form>
            </>
          ) : (
            <ButtonLink href="/login" variant="primary" className="max-sm:px-3.5">
              เข้าสู่ระบบ
            </ButtonLink>
          )}

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
              className="absolute right-0 top-14 w-64 animate-rise rounded-card bg-washi-surface p-2 shadow-lift ring-1 ring-washi-line"
            >
              {profile && (
                <p className="border-b border-washi-line px-4 pb-3 pt-2 text-sm text-sumi-soft">
                  {profile.full_name || profile.email}
                  {profile.role && <span className="block">{roleLabels[profile.role]}</span>}
                </p>
              )}
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
                {profile && (
                  <li>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="flex min-h-12 w-full items-center rounded-control px-4 text-left text-beni hover:bg-beni-bg"
                      >
                        ออกจากระบบ
                      </button>
                    </form>
                  </li>
                )}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
