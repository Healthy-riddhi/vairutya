import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { CalendarDays } from "lucide-react";

export async function ExpertGuidance() {
  const t = await getTranslations("Home");
  return (
    <section className="border-y border-line/30 bg-stone px-5 py-20">
      <div className="mx-auto flex max-w-[600px] flex-col items-center gap-8 text-center">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-teal shadow-[0_8px_24px_rgba(0,59,67,0.25)]">
          <CalendarDays size={32} strokeWidth={1.5} className="text-white" />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="eyebrow">{t("guidanceTitle")}</h2>
          <p className="text-lg leading-relaxed text-ink-muted">{t("guidanceText")}</p>
        </div>
        <Link href="/consultation" className="btn-primary">{t("guidanceButton")}</Link>
      </div>
    </section>
  );
}
