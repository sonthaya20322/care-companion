import Link from "next/link";
import { AppName } from "@/components/AppName";

const links = [
  { href: "/how-it-works", label: "วิธีใช้บริการ" },
  { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
  { href: "/terms", label: "เงื่อนไขการใช้บริการ" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-washi-line bg-sakura-50/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-3">
          <AppName />
          <p className="max-w-md text-sumi-soft">
            แพลตฟอร์มหาผู้ช่วยร่วมเดินทาง พาไปหาหมอ ธนาคาร หรือทำธุระนอกบ้าน
            เมื่อครอบครัวไปด้วยไม่ได้
          </p>
          <p className="max-w-md rounded-control bg-yamabuki-bg px-4 py-3 text-sm text-yamabuki">
            ผู้ช่วยร่วมเดินทาง (Companion) ช่วยเรื่องการเดินทางและการทำธุระเท่านั้น
            ไม่ใช่บุคลากรทางการแพทย์ และไม่ให้บริการรักษาหรือดูแลผู้ป่วย
          </p>
        </div>

        <nav aria-label="ลิงก์ท้ายเว็บ" className="md:justify-self-end">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-sora-700 underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="border-t border-washi-line py-4 text-center text-sm text-sumi-soft">
        © {new Date().getFullYear()} Care Companion
      </p>
    </footer>
  );
}
