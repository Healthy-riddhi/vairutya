import { NextResponse } from "next/server";
import { subscribeWithDoi } from "@/lib/brevo";
import {
  bad,
  clean,
  clientIp,
  emailFailure,
  isEmail,
  rateLimited,
  readJson,
  tooMany,
} from "@/lib/api-utils";

/**
 * Newsletter signup. Uses Brevo's double opt-in: the visitor gets a confirmation
 * email and is only added to the list after clicking it.
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body || !isEmail(body.email)) return bad("A valid email is required.");

  if (rateLimited(`newsletter:${clientIp(req)}`, 5, 10 * 60_000)) return tooMany();

  try {
    await subscribeWithDoi({
      email: body.email,
      firstName: clean(body.firstName, 60) || undefined,
      source: clean(body.source, 60) || undefined,
    });
  } catch (err) {
    return emailFailure(err);
  }

  return NextResponse.json({ ok: true, pendingConfirmation: true });
}
