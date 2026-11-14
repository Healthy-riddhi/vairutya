import { Link } from "@/i18n/navigation";
import { Globe, Share2, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { footerCompanyLinks, footerProductLinks } from "@/lib/nav";
import { NewsletterInlineForm } from "@/components/ui/NewsletterInlineForm";

export async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t border-line bg-stone">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-lg tracking-[0.2em] text-clay">VAIRUTYA</p>
            <p className="mt-4 max-w-[22ch] text-sm leading-relaxed text-ink-muted">{t("tagline")}</p>
            <div className="mt-5 flex items-center gap-2">
              {[Globe, Share2, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-ink hover:text-teal hover:border-teal transition-colors"
                  aria-label={t("social")}
                >
                  <Icon size={14} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-sm text-ink">{t("products")}</p>
            <ul className="mt-3">
              {footerProductLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block py-2 text-sm text-ink-muted hover:text-teal transition-colors">
                    {t(`links.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-sm text-ink">{t("company")}</p>
            <ul className="mt-3">
              {footerCompanyLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block py-2 text-sm text-ink-muted hover:text-teal transition-colors">
                    {t(`links.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className="font-semibold text-sm text-ink">{t("newsletter")}</p>
            <p className="mt-4 text-sm text-ink-muted">{t("newsletterText")}</p>
            <NewsletterInlineForm className="mt-4" />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} VAIRUTYA. {t("rights")}
          </p>
          <div className="flex flex-wrap gap-x-6">
            <Link href="/privacy" className="inline-block py-2 hover:text-teal transition-colors">{t("privacy")}</Link>
            <Link href="/terms" className="inline-block py-2 hover:text-teal transition-colors">{t("terms")}</Link>
            <Link href="/shipping" className="inline-block py-2 hover:text-teal transition-colors">{t("shipping")}</Link>
            <Link href="/refund-policy" className="inline-block py-2 hover:text-teal transition-colors">{t("refunds")}</Link>
            <Link href="/cookies" className="inline-block py-2 hover:text-teal transition-colors">{t("cookies")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
