import { Product, ProductDetail } from "@/types/content";
import { mediaUrl, strapiGet, StrapiMedia } from "@/lib/strapi";

type Line = { text: string };

type StrapiProduct = {
  documentId: string;
  name: string;
  slug: string;
  brand?: string;
  description?: string;
  price?: number | string | null;
  priceInr?: number | string | null;
  priceEur?: number | string | null;
  badge?: "new_arrival" | "best_seller" | null;
  image?: StrapiMedia | null;
  gallery?: StrapiMedia[] | null;
  tags?: Line[];
  benefits?: Line[];
  ingredients?: string | null;
  howToUse?: string | null;
  tabs?: {
    tabId: string;
    label: string;
    sections?: { heading?: string | null; body: string }[];
    specs?: { label: string; value: string }[];
    noteHeading?: string | null;
    noteBody?: string | null;
  }[];
};

export type ProductWithDetail = { product: Product; details?: ProductDetail };

const BADGES = { new_arrival: "New Arrival", best_seller: "Best Seller" } as const;
const PLACEHOLDER = "https://picsum.photos/seed/vairutya/600/600";
const lines = (items?: Line[]) => (items ?? []).map((l) => l.text);

function mapProduct(p: StrapiProduct, locale: string): ProductWithDetail {
  const gallery = (p.gallery ?? []).map((m) => mediaUrl(m)).filter((u): u is string => Boolean(u));

  const fr = locale === "fr";
  const product: Product = {
    id: p.documentId,
    slug: p.slug,
    brand: p.brand ?? "VAIRUTYA",
    name: p.name,
    description: p.description ?? "",
    price: Number(fr ? p.priceEur : p.priceInr),
    currency: fr ? "EUR" : "INR",
    image: mediaUrl(p.image) ?? gallery[0] ?? PLACEHOLDER,
    gallery: gallery.length ? gallery : undefined,
    badge: p.badge ? BADGES[p.badge] : undefined,
  };

  const tabs = (p.tabs ?? []).map((t) => ({
    id: t.tabId,
    label: t.label,
    sections: t.sections?.length
      ? t.sections.map((s) => ({ heading: s.heading ?? undefined, body: s.body }))
      : undefined,
    specs: t.specs?.length ? t.specs.map(({ label, value }) => ({ label, value })) : undefined,
    note: t.noteHeading && t.noteBody ? { heading: t.noteHeading, body: t.noteBody } : undefined,
  }));

  const details: ProductDetail = {
    tags: lines(p.tags),
    benefits: p.benefits?.length ? lines(p.benefits) : undefined,
    ingredients: p.ingredients ?? undefined,
    howToUse: p.howToUse ?? undefined,
    tabs: tabs.length ? tabs : undefined,
  };

  return { product, details };
}

async function fetchRaw(locale: string): Promise<StrapiProduct[]> {
  const query = [
    `locale=${locale}`,
    "sort[0]=createdAt:asc",
    "pagination[pageSize]=100",
    "populate[image]=true",
    "populate[gallery]=true",
    "populate[tags]=true",
    "populate[benefits]=true",
    "populate[tabs][populate]=*",
  ].join("&");
  const { data } = await strapiGet<{ data: StrapiProduct[] }>("products", query);
  return data;
}

/**
 * Every published product with an INR price. English is the base; for another language,
 * a translated entry replaces the English one field by field, and anything missing
 * falls back to English. The URL and price always come from the English entry.
 */
export async function getAllProducts(locale = "en"): Promise<ProductWithDetail[]> {
  const base = await fetchRaw("en");
  let merged = base;

  if (locale !== "en") {
    const translated = await fetchRaw(locale).catch(() => [] as StrapiProduct[]);
    const byDoc = new Map(translated.map((p) => [p.documentId, p]));
    merged = base.map((b) => {
      const t = byDoc.get(b.documentId);
      if (!t) return b;
      return {
        ...b,
        name: t.name || b.name,
        brand: t.brand || b.brand,
        description: t.description || b.description,
        tags: t.tags?.length ? t.tags : b.tags,
        benefits: t.benefits?.length ? t.benefits : b.benefits,
        ingredients: t.ingredients || b.ingredients,
        howToUse: t.howToUse || b.howToUse,
        tabs: t.tabs?.length ? t.tabs : b.tabs,
      };
    });
  }

  const priceOf = (p: StrapiProduct) => Number(locale === "fr" ? p.priceEur : p.priceInr);
  return merged.filter((p) => priceOf(p) > 0).map((p) => mapProduct(p, locale));
}

export async function getProductBySlug(slug: string, locale = "en"): Promise<ProductWithDetail | undefined> {
  return (await getAllProducts(locale)).find((x) => x.product.slug === slug);
}
