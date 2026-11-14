import type { Metadata } from "next";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart/CartContext";
import { routing } from "@/i18n/routing";

// Fonts are bundled in src/fonts (no network needed at build time).
const manrope = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "../../fonts/manrope-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../fonts/manrope-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../fonts/manrope-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
});
const inter = localFont({
  variable: "--font-body",
  display: "swap",
  src: [
    { path: "../../fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});
const cormorant = localFont({
  variable: "--font-serif",
  display: "swap",
  src: [
    { path: "../../fonts/cormorant-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/cormorant-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/cormorant-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return { title: t("title"), description: t("description") };
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      data-scroll-behavior="smooth"
      lang={locale}
      className={`${manrope.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-body">
        <NextIntlClientProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
