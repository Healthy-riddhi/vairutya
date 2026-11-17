import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { BrevoError, newsletterConsent, sendEmail } from "@/lib/brevo";
import { buildDripEmail } from "@/lib/skin-drip";
import { claim, getDue, release, stop } from "@/lib/quiz-drip-api";

/**
 * The daily job that sends the skin-quiz follow-up emails.
 * Call it once a day (see the notes in .env.example). Protected by CRON_SECRET.
 *
 * For everyone whose next email is due it checks they have confirmed the newsletter (double
 * opt-in) and not unsubscribed, reserves the email in Strapi, then sends it. Safe to run twice.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PER_RUN = 120; // well inside Brevo's free 300 a day, which the shop's own emails share
const GIVE_UP_AFTER_DAYS = 30; // never confirmed their address

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

async function run(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set." }, { status: 503 });
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!same(given, secret)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = { due: 0, sent: 0, waitingForConfirmation: 0, stopped: 0, failed: 0, stoppedEarly: false };
  const due = await getDue(PER_RUN);
  result.due = due.length;

  for (const item of due) {
    try {
      const consent = await newsletterConsent(item.email);
      if (consent === "blocked") {
        await stop(item.id, "unsubscribed");
        result.stopped++;
        continue;
      }
      if (consent === "pending") {
        const ageDays = (Date.now() - new Date(item.startedAt).getTime()) / 86_400_000;
        if (ageDays > GIVE_UP_AFTER_DAYS) {
          await stop(item.id, "expired");
          result.stopped++;
        } else {
          result.waitingForConfirmation++;
        }
        continue;
      }

      const mail = buildDripEmail({
        sequence: item.sequence,
        step: item.step,
        email: item.email,
        firstName: item.firstName,
        token: item.token,
      });
      if (!mail) {
        console.error(`[skin-drip] no email ${item.step} for sequence ${item.sequence}`);
        result.failed++;
        continue;
      }

      const reserved = await claim(item.id, item.step);
      if (!reserved) continue; // another run already took it
      try {
        await sendEmail(mail, { respectBlocks: true });
        result.sent++;
      } catch (err) {
        await release(item.id, item.step, reserved.previousLastSentAt); // try again tomorrow
        throw err;
      }
    } catch (err) {
      result.failed++;
      console.error(`[skin-drip] ${item.email} step ${item.step} failed:`, err);
      // Out of sending allowance: stop here, the rest go tomorrow
      if (err instanceof BrevoError && (err.status === 402 || err.status === 429)) {
        result.stoppedEarly = true;
        break;
      }
    }
  }
  return NextResponse.json(result);
}

export const GET = run;
export const POST = run;
