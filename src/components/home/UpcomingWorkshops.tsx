import { getLocale, getTranslations } from "next-intl/server";
import { WorkshopCard } from "@/components/ui/WorkshopCard";
import { getWorkshops } from "@/lib/content";

export async function UpcomingWorkshops() {
  const t = await getTranslations("Home");
  const workshops = await getWorkshops(await getLocale());

  return (
    <section className="flex flex-col gap-14 bg-cream py-20">
      <div className="px-5 text-center">
        <h2 className="eyebrow mb-3">{t("workshopsTitle")}</h2>
        <p className="text-base text-ink-muted">{t("workshopsText")}</p>
      </div>
      <div className="hide-scrollbar flex justify-center gap-10 overflow-x-auto px-5">
        {workshops.map((w) => (
          <WorkshopCard
            key={w.id}
            workshop={{
              id: w.id,
              slug: w.slug,
              category: w.category,
              title: w.title,
              description: w.description,
              image: w.heroImage,
              schedule: w.schedule,
              ctaLabel: w.ctaLabel,
            }}
          />
        ))}
      </div>
    </section>
  );
}
