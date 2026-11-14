export type Product = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  currency: "EUR" | "INR";
  image: string;
  /** Optional extra gallery images (the main `image` is always shown first). */
  gallery?: string[];
  badge?: "New Arrival" | "Best Seller";
  tags?: string[];
};

export type Workshop = {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  image: string;
  schedule: string; // e.g. "Oct 24, 6:00 PM" or "Self-paced Access"
  ctaLabel: string; // "Register Now" | "Watch Workshop"
  durationHours?: number;
  price?: number;
};

export type BlogPost = {
  id: string;
  slug: string;
  category: string; // combined label, e.g. "Hair Health · 8 min read"
  title: string;
  excerpt: string;
  image: string;
};

export type TimeSlot = string;

export type ProductDetailTab = {
  id: string;
  label: string;
  /** Free-text paragraphs, optionally under small headings. */
  sections?: { heading?: string; body: string }[];
  /** Label/value rows, e.g. dimensions and weight. */
  specs?: { label: string; value: string }[];
  /** Highlighted note shown under the tab content. */
  note?: { heading: string; body: string };
};

export type ProductDetail = {
  tags: string[];
  /** Classic supplement layout (Benefits / Ingredients / How to Use). */
  benefits?: string[];
  ingredients?: string;
  howToUse?: string;
  /** Custom tabs. When present, these replace the classic three tabs. */
  tabs?: ProductDetailTab[];
};

export type Recipe = {
  slug: string;
  title: string;
  tag: string;
  description: string;
  time: string;
  image: string;
  stats: { label: string; bold?: boolean }[];
  /** Downloadable PDF, if one is uploaded in Strapi. */
  pdfUrl?: string;
};

export type ArticleImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type ArticleSection = {
  heading?: string;
  /** Blocks separated by a blank line in Strapi. A block can be a paragraph, a bullet list or a numbered list. */
  paragraphs: string[];
  image?: ArticleImage;
  caption?: string;
};

export type Article = {
  slug: string;
  category: string;
  title: string;
  heroImage: string;
  sections: ArticleSection[];
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  /** Where the call-to-action button goes, e.g. "/shop/silver-tongue-scraper". No button if empty. */
  ctaHref?: string;
};

export type WorkshopDetail = {
  slug: string;
  category: string;
  title: string;
  heroImage: string;
  durationLabel: string;
  priceLabel: string;
  about: string[];
  menu?: string[];
  notes?: string[];
  dates: { label: string; value: string }[];
};

export type WorkshopFull = WorkshopDetail & {
  id: string;
  /** Short blurb for cards. */
  description: string;
  /** e.g. "Oct 24, 6:00 PM" or "Self-paced Access". */
  schedule: string;
  ctaLabel: string;
  /** Small label on the workshops list cards. */
  listTag: string;
};

export type ConsultationContent = {
  headline: string;
  intro: string;
  primaryCta: string;
  helpTitle: string;
  helpParagraphs: string[];
  journeyTitle: string;
  journeySteps: { title: string; description: string }[];
  includedTitle: string;
  includedIntro: string;
  includedItems: { title: string; description: string }[];
  closingTitle: string;
  closingBody: string;
  secondaryCta: string;
};
