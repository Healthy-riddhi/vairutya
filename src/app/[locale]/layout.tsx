import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Manrope, Inter, Cormorant } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart/CartContext";
import { routing } from "@/i18n/routing";

const manrope = Manrope({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"] });
const inter = Inter({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600"] });
const cormorant = Cormorant({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "500", "600"] });

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
