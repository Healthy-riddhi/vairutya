import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function CareersPage() {
  const t = await getTranslations("Careers");
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16 pb-24 text-center">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">VAIRUTYA</p>
      <h1 className="mb-6 font-serif text-4xl font-medium text-ink">{t("title")}</h1>
      <p className="mx-auto max-w-[480px] text-[15px] leading-relaxed text-ink-muted">
        {t.rich("text", { link: (c) => <Link href="/contact" className="font-semibold text-teal">{c}</Link> })}
      </p>
    </div>
  );
}
