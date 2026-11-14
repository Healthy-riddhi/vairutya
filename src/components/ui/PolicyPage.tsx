import type { ReactNode } from "react";

export function PolicyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-12 pb-24">
      <h1 className="mb-8 font-serif text-3xl font-medium text-ink sm:text-4xl">{title}</h1>
      <div className="flex flex-col gap-5 text-[15px] leading-loose text-ink [&_h2]:mt-4 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-teal [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
