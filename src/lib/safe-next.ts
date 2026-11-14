/**
 * Only allow redirects to pages on this site ("/account", "/checkout"…), never to
 * another website or a protocol-relative address like "//evil.com".
 */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}
