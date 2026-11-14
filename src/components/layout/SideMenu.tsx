"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  X,
  ChevronDown,
  CalendarDays,
  Package,
  CalendarClock,
  Newspaper,
} from "lucide-react";
import { ChefHatIcon } from "@/components/ui/icons/ChefHatIcon";
import { QuizIcon } from "@/components/ui/icons/QuizIcon";
import { useSwitchLocale } from "./LanguageMenu";

type NavRowItem = {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
};

const shopItems: NavRowItem[] = [
  { labelKey: "consultation", href: "/consultation", icon: CalendarDays },
  { labelKey: "product", href: "/shop", icon: Package },
];

const flatItems: NavRowItem[] = [
  { labelKey: "quiz", href: "/quiz", icon: QuizIcon },
  { labelKey: "workshops", href: "/workshops", icon: CalendarClock },
  { labelKey: "recipes", href: "/recipes", icon: ChefHatIcon },
  { labelKey: "blog", href: "/blog", icon: Newspaper },
];

function NavRow({
  item,
  onClose,
}: {
  item: NavRowItem;
  onClose: () => void;
}) {
  const Icon = item.icon;
  const t = useTranslations("Menu");
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className="flex items-center gap-3.5 px-6 py-2.5 text-ink transition-colors hover:bg-teal/[0.04] hover:text-teal"
    >
      <Icon size={20} strokeWidth={1.75} className="shrink-0" />
      <span className="text-[15px] tracking-wide">{t(item.labelKey)}</span>
    </Link>
  );
}

function ShopGroup({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Menu");

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted"
      >
        {t("shop")}
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div>
          {shopItems.map((item) => (
            <NavRow key={item.href} item={item} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SideMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Menu");
  const locale = useLocale();
  const switchTo = useSwitchLocale();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      {open && (
        <button
          aria-label={t("close")}
          onClick={onClose}
          className="fixed inset-0 z-[410] bg-black/25"
        />
      )}

      <div
        className={`fixed left-0 top-0 z-[450] flex h-full w-[280px] flex-col overflow-y-auto bg-cream shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line/20 px-5">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink"
            aria-label={t("close")}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
          <Link
            href="/"
            onClick={onClose}
            aria-label={t("home")}
            className="block transition-opacity hover:opacity-80"
          >
            <Image
              src="/images/logo/vairutya-logo.png"
              alt="Vairutya"
              width={44}
              height={44}
              priority
              className="h-11 w-11"
            />
          </Link>
        </div>

        <nav className="flex-1 py-6">
          <ShopGroup onClose={onClose} />
          <div className="mx-6 my-3 border-t border-line/25" aria-hidden />
          {flatItems.map((item) => (
            <NavRow key={item.href} item={item} onClose={onClose} />
          ))}
        </nav>

        <div className="border-t border-line/20 px-6 py-5">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {t("language")}
          </p>
          <div className="flex gap-2">
            {(["en", "fr"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  onClose();
                  switchTo(code);
                }}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  locale === code ? "border-teal bg-teal text-white" : "border-line text-ink"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
