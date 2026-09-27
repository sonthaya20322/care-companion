import type { ReactNode } from "react";

type LegalDocumentProps = {
  title: string;
  effectiveDate: string;
  children: ReactNode;
};

export function LegalDocument({ title, effectiveDate, children }: LegalDocumentProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-14">
      <header className="animate-rise border-b border-washi-line pb-6">
        <h1 className="text-3xl text-sumi md:text-4xl">{title}</h1>
        <p className="mt-2 text-sumi-soft">มีผลตั้งแต่วันที่ {effectiveDate}</p>
      </header>
      <div className="mt-8 flex flex-col gap-8 [&_h2]:text-xl [&_h2]:text-sumi [&_li]:mt-1.5 [&_p]:mt-2 [&_p]:text-sumi-soft [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-sumi-soft">
        {children}
      </div>
    </article>
  );
}
