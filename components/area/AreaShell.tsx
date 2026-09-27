import type { ReactNode } from "react";
import { AreaNav, type AreaNavItem } from "./AreaNav";

type AreaShellProps = {
  title: string;
  subtitle: string;
  nav: AreaNavItem[];
  children: ReactNode;
};

export function AreaShell({ title, subtitle, nav, children }: AreaShellProps) {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-6 px-5 py-8 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10 md:py-12">
      <aside className="min-w-0 md:sticky md:top-28 md:self-start">
        <p className="text-sm text-sumi-soft">{subtitle}</p>
        <p className="font-display text-xl text-sumi">{title}</p>
        <div className="mt-4">
          <AreaNav items={nav} label={`เมนู${title}`} />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function PageHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div className="animate-rise">
        <h1 className="text-3xl text-sumi">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sumi-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
