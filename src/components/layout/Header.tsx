"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, User, Globe, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SideMenu } from "./SideMenu";
import { LanguageMenu } from "./LanguageMenu";
import { AccountLink } from "./AccountLink";
import { useCart } from "@/lib/cart/CartContext";

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
      {count}
    </span>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { totalQty } = useCart();
  const t = useTranslations("Header");
  const locale = useLocale();

  return (
    <>
      <header className="fixed top-0 left-0 z-40 h-16 w-full border-b border-line/30 bg-cream">
        <div className="mx-auto hidden h-full max-w-[1440px] grid-cols-3 items-center px-20 md:grid">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-full p-2 text-ink hover:bg-teal/5"
              aria-label={t("openMenu")}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <Menu size={24} strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <Logo />
          </div>

          <div className="flex items-center justify-end gap-6">
            <AccountLink className="text-ink">
              <User size={24} strokeWidth={1.75} />
            </AccountLink>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1 text-ink"
                aria-label={t("changeLanguage")}
                aria-haspopup="true"
                aria-expanded={langOpen}
              >
                <Globe size={24} strokeWidth={1.75} />
                <span className="text-xs font-semibold uppercase tracking-wide">{locale}</span>
              </button>
              {langOpen && <LanguageMenu onClose={() => setLangOpen(false)} />}
            </div>
            <Link href="/cart" className="relative flex items-center text-ink" aria-label={t("cart")}>
              <ShoppingCart size={24} strokeWidth={1.75} />
              <CartBadge count={totalQty} />
            </Link>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex h-full items-center justify-between px-5 md:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1 text-ink"
              aria-label={t("openMenu")}
            >
              <Menu size={22} strokeWidth={1.75} />
            </button>
            <Logo className="text-lg" />
          </div>
          <div className="flex items-center gap-2">
            <AccountLink className="p-1 text-teal">
              <User size={22} strokeWidth={1.75} />
            </AccountLink>
            <Link href="/cart" className="relative flex items-center p-1 text-teal" aria-label={t("cart")}>
              <ShoppingCart size={22} strokeWidth={1.75} />
              <CartBadge count={totalQty} />
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer so fixed header doesn't cover content */}
      <div className="h-16" />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
