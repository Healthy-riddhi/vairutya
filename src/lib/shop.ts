import { STRAPI_URL } from "@/lib/strapi";

/**
 * Prices and totals are ALWAYS worked out here, on the server, from the live prices in
 * Strapi. The browser only ever says "I want product X, quantity 2".
 */
export type Country = "IN" | "FR";
export const COUNTRY_CURRENCY = { IN: "INR", FR: "EUR" } as const;
export const COUNTRY_NAME = { IN: "India", FR: "France" } as const;

export class ShopError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

export type ShopSettings = {
  ship: Record<Country, { enabled: boolean; feeMinor: number; freeOverMinor: number }>;
  gstPercent: number;
};

const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback);
const toMinor = (major: number) => Math.round(major * 100);

export async function getShopSettings(): Promise<ShopSettings> {
  let s: Record<string, unknown> = {};
  try {
    const res = await fetch(`${STRAPI_URL}/api/shop-setting`, { cache: "no-store" });
    if (res.ok) s = (await res.json()).data ?? {};
    else if (res.status !== 404) console.error("[shop] settings responded", res.status);
  } catch (err) {
    console.error("[shop] could not load settings:", err);
  }
  return {
    ship: {
      IN: {
        enabled: s.shipToIndia !== false,
        feeMinor: toMinor(num(s.shippingFeeInr, 99)),
        freeOverMinor: toMinor(num(s.freeShippingOverInr, 1499)),
      },
      FR: {
        enabled: s.shipToFrance !== false,
        feeMinor: toMinor(num(s.shippingFeeEur, 9)),
        freeOverMinor: toMinor(num(s.freeShippingOverEur, 120)),
      },
    },
    gstPercent: num(s.gstPercent, 18),
  };
}

export type PricedLine = {
  slug: string;
  name: string;
  image: string | null;
  qty: number;
  unitMinor: number;
  lineMinor: number;
};

export type Quote = {
  country: Country;
  currency: "INR" | "EUR";
  lines: PricedLine[];
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  /** GST already inside the prices (India only). */
  taxIncludedMinor: number | null;
  /** How much more to spend for free shipping, or null. */
  freeShippingAwayMinor: number | null;
};

const MAX_LINES = 20;
const MAX_QTY = 10;

export async function priceCart(rawItems: unknown, rawCountry: unknown): Promise<Quote> {
  if (rawCountry !== "IN" && rawCountry !== "FR") throw new ShopError("Please choose where we should ship.");
  const country: Country = rawCountry;
  const currency = COUNTRY_CURRENCY[country];

  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new ShopError("Your cart is empty.");
  if (rawItems.length > MAX_LINES) throw new ShopError("Too many different items in the cart.");

  // Clean the request: only slug + quantity are used; quantities are clamped.
  const wanted = new Map<string, number>();
  for (const it of rawItems) {
    const slug = typeof it?.slug === "string" ? it.slug.trim().slice(0, 120) : "";
    const qty = Number(it?.qty);
    if (!slug || !Number.isInteger(qty) || qty < 1) throw new ShopError("Something in your cart isn't valid.");
    wanted.set(slug, Math.min(MAX_QTY, (wanted.get(slug) ?? 0) + qty));
  }

  const settings = await getShopSettings();
  if (!settings.ship[country].enabled) {
    throw new ShopError(`We don't ship to ${COUNTRY_NAME[country]} just yet.`);
  }

  const q = new URLSearchParams({
    locale: "en",
    "pagination[pageSize]": "50",
    "fields[0]": "name",
    "fields[1]": "slug",
    "fields[2]": "priceInr",
    "fields[3]": "priceEur",
    "populate[image]": "true",
  });
  [...wanted.keys()].forEach((slug, i) => q.set(`filters[slug][$in][${i}]`, slug));

  const res = await fetch(`${STRAPI_URL}/api/products?${q}`, { cache: "no-store" });
  if (!res.ok) throw new ShopError("We couldn't check prices right now. Please try again.", 502);
  const products: {
    slug: string;
    name: string;
    priceInr?: number | string | null;
    priceEur?: number | string | null;
    image?: { url: string } | null;
  }[] = (await res.json()).data ?? [];

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const lines: PricedLine[] = [];
  for (const [slug, qty] of wanted) {
    const p = bySlug.get(slug);
    if (!p) throw new ShopError("An item in your cart is no longer available. Please remove it and try again.");
    const price = Number(currency === "INR" ? p.priceInr : p.priceEur);
    if (!Number.isFinite(price) || price <= 0) {
      throw new ShopError(`"${p.name}" isn't available for delivery to ${COUNTRY_NAME[country]}.`);
    }
    const unitMinor = toMinor(price);
    lines.push({
      slug,
      name: p.name,
      image: p.image?.url ? (p.image.url.startsWith("http") ? p.image.url : `${STRAPI_URL}${p.image.url}`) : null,
      qty,
      unitMinor,
      lineMinor: unitMinor * qty,
    });
  }

  const ship = settings.ship[country];
  const subtotalMinor = lines.reduce((s, l) => s + l.lineMinor, 0);
  const freeOn = ship.freeOverMinor > 0;
  const shippingMinor = freeOn && subtotalMinor >= ship.freeOverMinor ? 0 : ship.feeMinor;
  const totalMinor = subtotalMinor + shippingMinor;
  const taxIncludedMinor =
    country === "IN" ? Math.round((totalMinor * settings.gstPercent) / (100 + settings.gstPercent)) : null;

  return {
    country,
    currency,
    lines,
    subtotalMinor,
    shippingMinor,
    totalMinor,
    taxIncludedMinor,
    freeShippingAwayMinor: freeOn && shippingMinor > 0 ? ship.freeOverMinor - subtotalMinor : null,
  };
}
