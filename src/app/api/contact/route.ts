import { NextResponse } from "next/server";
import { notifyAddress, sendEmail } from "@/lib/brevo";
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
import { contactNotification } from "@/lib/email-templates";

/** Contact form → an email to the team. Does NOT subscribe anyone to the newsletter. */
export async function POST(req: Request) {
  const body = await readJson(req);
  const name = clean(body?.name, 80);
  const message = clean(body?.message, 5000);
  if (!body || !name || !message || !isEmail(body.email)) {
    return bad("Please fill in your name, a valid email and a message.");
  }

  if (rateLimited(`contact:${clientIp(req)}`, 3, 10 * 60_000)) return tooMany();

  try {
    await sendEmail(
      contactNotification({ to: notifyAddress(), name, email: body.email, message })
    );
  } catch (err) {
    return emailFailure(err);
  }

  return NextResponse.json({ ok: true });
}
