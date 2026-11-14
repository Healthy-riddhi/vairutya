import { getTranslations } from "next-intl/server";

export default async function OurSciencePage() {
  const t = await getTranslations("Science");
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16 pb-24">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">VAIRUTYA</p>
      <h1 className="mb-6 font-serif text-4xl font-medium text-ink">{t("title")}</h1>
      <div className="flex flex-col gap-5 text-[15px] leading-[1.85] text-ink">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
      </div>
    </div>
  );
}
