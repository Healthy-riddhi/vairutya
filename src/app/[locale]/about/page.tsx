import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("About");
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16 pb-24">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">VAIRUTYA</p>
      <h1 className="mb-6 font-serif text-4xl font-medium text-ink">{t("title")}</h1>
      <p className="mb-2 font-serif text-2xl leading-snug text-teal">{t("lead")}</p>
      <p className="mb-12 text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">{t("tagline")}</p>

      <h2 className="mb-5 font-serif text-2xl font-medium text-teal">{t("philosophyTitle")}</h2>
      <div className="mb-14 flex flex-col gap-5 text-[15px] leading-[1.85] text-ink">
        <p>{t("philosophy1")}</p>
        <p>{t("philosophy2")}</p>
        <p>{t("philosophy3")}</p>
      </div>

      <h2 className="mb-5 font-serif text-2xl font-medium text-teal">{t("ethosTitle")}</h2>
      <p className="mb-6 text-[15px] leading-[1.85] text-ink">{t("ethosIntro")}</p>
      <ul className="flex flex-col gap-4">
        {[1, 2, 3].map((n) => (
          <li key={n} className="rounded-2xl border border-line/20 bg-white p-6">
            <h3 className="mb-1.5 font-display text-[15px] font-bold text-teal">{t(`principle${n}Title`)}</h3>
            <p className="text-sm leading-relaxed text-ink-muted">{t(`principle${n}Text`)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
