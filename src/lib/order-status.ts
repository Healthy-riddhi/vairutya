export const PAID_STATUSES = ["paid", "processing", "shipped", "delivered", "refunded"];

export const formatOrderDate = (iso: string | null, locale = "en") =>
  iso
    ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso))
    : "";
