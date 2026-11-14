export type NavItem = {
  label: string;
  href: string;
};

export const primaryNav: NavItem[] = [
  { label: "Consultation", href: "/consultation" },
  { label: "Product", href: "/shop" },
  { label: "Quiz", href: "/quiz" },
  { label: "Workshops", href: "/workshops" },
  { label: "Recipes", href: "/recipes" },
  { label: "Blog", href: "/blog" },
];

/** `key` points at the translated label in messages/*.json (Footer.links). */
export const footerProductLinks = [
  { key: "metabolic", href: "/shop?category=metabolic-health" },
  { key: "gut", href: "/shop?category=gut-health" },
  { key: "mental", href: "/shop?category=mental-wellness" },
  { key: "sleep", href: "/shop?category=sleep-optimization" },
];

export const footerCompanyLinks = [
  { key: "science", href: "/our-science" },
  { key: "about", href: "/about" },
  { key: "careers", href: "/careers" },
  { key: "contact", href: "/contact" },
];
