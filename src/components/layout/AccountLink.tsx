"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

/** The header's person icon: goes to /account when signed in, /login otherwise. */
export function AccountLink({ className, children }: { className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("Header");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setSignedIn(Boolean(d.user));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]); // re-check after every page change (e.g. right after signing in or out)

  return (
    <Link href={signedIn ? "/account" : "/login"} className={className} aria-label={signedIn ? t("account") : t("signIn")}>
      {children}
    </Link>
  );
}
