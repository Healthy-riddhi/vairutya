/** Regions the shop sells to, and how money is shown. Amounts are stored in "minor" units (paise / cents). */
export type Region = "IN" | "FR";
export type Currency = "INR" | "EUR";
export type Prices = Partial<Record<Currency, number>>;

export const REGIONS: Record<Region, { name: string; currency: Currency; symbol: string }> = {
  IN: { name: "India", currency: "INR", symbol: "₹" },
  FR: { name: "France", currency: "EUR", symbol: "€" },
};

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const formatMinor = (minor: number, currency: Currency) => formatMoney(minor / 100, currency);

/** The price in a region's currency, or null if the product isn't sold there. */
export function priceFor(prices: Prices | undefined, region: Region): number | null {
  const v = prices?.[REGIONS[region].currency];
  return typeof v === "number" && v > 0 ? v : null;
}
