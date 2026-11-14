import { Link } from "@/i18n/navigation";
import { Sparkles, ChefHat, ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getWorkshops } from "@/lib/content";

export default async function WorkshopsListPage() {
  const t = await getTranslations("Workshops");
  const workshops = await getWorkshops(await getLocale());

  return (
    <div className="mx-auto max-w-[860px] px-6 py-12 pb-20">
      <div className="mb-12">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          VAIRUTYA
        </p>
        <h1 className="mb-4 font-serif text-[32px] font-normal leading-tight text-ink sm:text-[48px]">
          {t("title")}
        </h1>
        <div className="mb-5 h-0.5 w-12 bg-teal" />
        <p className="max-w-[540px] text-[15px] leading-relaxed text-ink-muted">
          {t("intro")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {workshops.map((w) => {
          const Icon = /cook|nutrition|food/i.test(w.listTag) ? ChefHat : Sparkles;
          return (
            <Link
              key={w.slug}
              href={`/workshops/${w.slug}`}
              className="flex flex-col gap-3.5 rounded-sm border border-line/30 bg-white p-7 pb-6 transition-shadow hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
            >
              <Icon size={28} strokeWidth={1.75} className="text-teal" />
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  {w.listTag}
                </p>
                <p className="mb-2 font-display text-base font-bold text-ink">
                  {w.title}
                </p>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {w.description}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-teal">
                <span className="text-xs font-semibold uppercase tracking-[0.08em]">
                  {t("learnMore")}
                </span>
                <ArrowRight size={16} strokeWidth={2} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
