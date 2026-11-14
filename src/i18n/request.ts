import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getSiteTextOverrides } from "@/lib/site-text";

type Messages = { [key: string]: string | Messages };

/** `over` on top of `base`, so a missing key shows the text underneath, never nothing. */
function merge(base: Messages, over: Messages): Messages {
  const out: Messages = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const b = out[k];
    out[k] =
      typeof v === "object" && v !== null && typeof b === "object" && b !== null
        ? merge(b as Messages, v as Messages)
        : v;
  }
  return out;
}

/** Applies "Footer.links.about"-style overrides coming from Strapi. */
function applyOverrides(base: Messages, overrides: Record<string, string>): Messages {
  const out = structuredClone(base);
  for (const [key, value] of Object.entries(overrides)) {
    const parts = key.split(".");
    let node: Messages = out;
    for (const p of parts.slice(0, -1)) {
      if (typeof node[p] !== "object" || node[p] === null) node[p] = {};
      node = node[p] as Messages;
    }
    node[parts[parts.length - 1]] = value;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Order of priority: Strapi French > built-in French > Strapi English > built-in English
  const en = (await import("../../messages/en.json")).default as Messages;
  let messages = applyOverrides(en, await getSiteTextOverrides("en"));
  if (locale !== "en") {
    const other = (await import(`../../messages/${locale}.json`)).default as Messages;
    messages = applyOverrides(merge(messages, other), await getSiteTextOverrides(locale));
  }
  return { locale, messages };
});
