"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
] as const;

/** Switches language on the same page. The choice is remembered. */
export function useSwitchLocale() {
  const router = useRouter();
  const pathname = usePathname();
  return (code: "en" | "fr") => router.replace(pathname, { locale: code });
}

export function LanguageMenu({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const switchTo = useSwitchLocale();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 w-36 border border-line bg-white py-1 shadow-lg"
      role="menu"
    >
      {languages.map((lang) => (
        <button
          key={lang.code}
          role="menuitem"
          onClick={() => {
            onClose();
            switchTo(lang.code);
          }}
          className="flex w-full items-center justify-between px-4 py-2 text-sm text-ink hover:bg-cream-deep transition-colors"
        >
          <span className={lang.code === locale ? "text-teal font-medium" : ""}>{lang.label}</span>
          <span className="text-xs uppercase text-ink-muted">{lang.code}</span>
        </button>
      ))}
    </div>
  );
}
