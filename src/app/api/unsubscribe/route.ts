import { NextResponse } from "next/server";
import { clean, clientIp, rateLimited } from "@/lib/api-utils";
import { unsubscribeByToken } from "@/lib/quiz-drip-api";

/**
 * Stops the skin-quiz emails.
 *  POST: the button on the unsubscribe page, and the one-click "unsubscribe" in Gmail / Apple Mail
 *        (the List-Unsubscribe header). The token comes in the address (?t=) or the JSON body.
 *  GET : only sends people on to the page. It never unsubscribes by itself, because mail scanners
 *        open every link in an email and would unsubscribe everyone.
 */
const token = (url: URL, body: unknown) =>
  clean(url.searchParams.get("t") ?? (body as { token?: unknown } | null)?.token, 64);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const t = clean(url.searchParams.get("t"), 64);
  return NextResponse.redirect(new URL(`/unsubscribe${t ? `?t=${encodeURIComponent(t)}` : ""}`, url.origin), 303);
}

export async function POST(req: Request) {
  if (rateLimited(`unsub:${clientIp(req)}`, 20, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const t = token(new URL(req.url), body);
  if (t.length < 16) return NextResponse.json({ error: "This link is not valid." }, { status: 400 });
  try {
    const ok = await unsubscribeByToken(t);
    if (!ok) return NextResponse.json({ error: "This link is not valid." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[unsubscribe]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }
}
