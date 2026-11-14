import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";
import { PopularProducts } from "@/components/home/PopularProducts";
import { ExpertGuidance } from "@/components/home/ExpertGuidance";
import { UpcomingWorkshops } from "@/components/home/UpcomingWorkshops";
import { ExpertInsights } from "@/components/home/ExpertInsights";
import { NewsletterLargeForm } from "@/components/ui/NewsletterLargeForm";
import { strapiGet, mediaUrl, type StrapiMedia } from "@/lib/strapi";

type CmsSlide = {
  image?: StrapiMedia | null;
  mobileImage?: StrapiMedia | null;
  alt?: string | null;
  headline?: string | null;
  subtext?: string | null;
  buttonLabel?: string | null;
  buttonLink?: string | null;
  visible?: boolean | null;
};

/** Slides from Strapi, in the order set in the admin. Empty list = the carousel uses its built-in defaults. */
async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const res = await strapiGet<{ data?: { slides?: CmsSlide[] } | null }>(
      "home-hero",
      "populate[slides][populate][image]=true&populate[slides][populate][mobileImage]=true"
    );
    const out: HeroSlide[] = [];
    for (const s of res.data?.slides ?? []) {
      const image = mediaUrl(s.image);
      if (!image || s.visible === false) continue;
      out.push({
        image,
        mobileImage: mediaUrl(s.mobileImage) || undefined,
        alt: s.alt || s.image?.alternativeText || "Vairutya",
        headline: s.headline || undefined,
        subtext: s.subtext || undefined,
        buttonLabel: s.buttonLabel || undefined,
        buttonLink: s.buttonLink || undefined,
      });
    }
    return out;
  } catch (err) {
    console.error("[home] hero slides unavailable, using defaults:", err);
    return [];
  }
}

export default async function HomePage() {
  const slides = await getHeroSlides();
  return (
    <>
      <HeroCarousel slides={slides} />
      <PopularProducts />
      <ExpertGuidance />
      <UpcomingWorkshops />
      <ExpertInsights />
      <NewsletterLargeForm />
    </>
  );
}
