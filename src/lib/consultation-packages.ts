import type { Currency } from "@/lib/money";
import { formatMinor } from "@/lib/money";
import type { RawPackage } from "@/lib/consultation-api";

/** A package ready to show: in the visitor's language, priced in their currency. */
export type ConsultationPackage = {
  slug: string;
  kind: "base" | "addon" | "program";
  months: number | null;
  title: string;
  idealFor: string | null;
  includes: string[];
  /** paise / cents */
  priceMinor: number;
};

/** Picks the French text where there is some (else English), and drops anything not sold in this currency. */
export function localizePackages(raw: RawPackage[], locale: string, currency: Currency): ConsultationPackage[] {
  const fr = locale === "fr";
  return raw
    .filter((p) => p.priceMinor[currency] > 0)
    .map((p) => ({
      slug: p.slug,
      kind: p.kind,
      months: p.months,
      title: (fr && p.titleFr) || p.title,
      idealFor: (fr && p.idealForFr) || p.idealFor,
      includes: fr && p.includesFr.length ? p.includesFr : p.includes,
      priceMinor: p.priceMinor[currency],
    }));
}

/**
 * The price spread over the months, rounded down the way the price sheet does it:
 * to the nearest 10 in rupees (₹4,833 → ₹4,830), to the whole euro in euros (€136.67 → €136).
 */
export function perMonthLabel(priceMinor: number, months: number, currency: Currency): string {
  const perMonth = priceMinor / 100 / months;
  const rounded = currency === "INR" ? Math.floor(perMonth / 10) * 10 : Math.floor(perMonth);
  return formatMinor(rounded * 100, currency);
}
