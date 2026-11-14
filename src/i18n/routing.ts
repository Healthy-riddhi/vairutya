import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  // English keeps its current URLs (/shop); French lives under /fr (/fr/shop).
  localePrefix: "as-needed",
});
