import { strapiGet } from "@/lib/strapi";

type Row = { key?: string | null; en?: string | null; fr?: string | null };

/** Texts edited in Strapi (Pages), as { "Footer.rights": "…" }. Empty fields are ignored. */
export async function getSiteTextOverrides(locale: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (locale !== "en" && locale !== "fr") return out;
  try {
    for (let page = 1; page <= 20; page++) {
      const res = await strapiGet<{ data: { texts?: Row[] }[]; meta: { pagination: { pageCount: number } } }>(
        "pages",
        `populate[texts]=true&pagination[page]=${page}&pagination[pageSize]=100`
      );
      for (const p of res.data) {
        for (const r of p.texts ?? []) {
          const v = r[locale as "en" | "fr"];
          if (r.key && typeof v === "string" && v.trim()) out[r.key] = v;
        }
      }
      if (page >= res.meta.pagination.pageCount) break;
    }
  } catch (err) {
    console.error("[pages] using built-in texts:", (err as Error).message);
  }
  return out;
}
