/** Display helpers for the booking page, the status page and the emails. Slots are "HH:MM" in Indian time. */

export function slotLabel(slot: string, locale: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(slot);
  if (!m) return slot;
  const h = Number(m[1]);
  if (locale === "fr") return `${h}h${m[2]}`;
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

export function longDate(iso: string, locale: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** The same moment in Paris time, e.g. "10h30" (handles summer/winter time). */
export function parisLabel(iso: string, slot: string): string | null {
  const d = new Date(`${iso}T${slot}:00+05:30`);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("fr-FR", {
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Paris",
  }).formatToParts(d);
  const h = parts.find((p) => p.type === "hour")?.value;
  const m = parts.find((p) => p.type === "minute")?.value;
  return h && m ? `${Number(h)}h${m}` : null;
}
