import { NextResponse } from "next/server";
import { notifyAddress, sendEmail } from "@/lib/brevo";
import { bad, clean, clientIp, emailFailure, isEmail, rateLimited, readJson, tooMany } from "@/lib/api-utils";
import { quizNotification } from "@/lib/email-templates";
import { getQuizBySlug } from "@/lib/quiz/cms";
import { scoreQuiz } from "@/lib/quiz/model";
import { sequenceFor } from "@/lib/skin-drip";
import { subscribeToDrip } from "@/lib/quiz-drip-api";

/**
 * A finished quiz → an email to the team with the person's details, result and every answer.
 * The email is built here from the quiz in Strapi, so a visitor can only send their own choices
 * (answer numbers) and details, never their own question or result text.
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  const slug = clean(body?.slug, 80);
  const firstName = clean(body?.firstName, 80);
  if (!body || !slug || !firstName || !isEmail(body.email) || !Array.isArray(body.answers)) {
    return bad("Please fill in your name and a valid email.");
  }

  if (rateLimited(`quiz:${clientIp(req)}`, 6, 10 * 60_000)) return tooMany();

  // Always the English quiz, so the email reads the same whatever language they used.
  const quiz = await getQuizBySlug(slug, "en").catch(() => undefined);
  if (!quiz) return bad("Unknown quiz.", 404);

  const picked = body.answers as unknown[];
  const valid =
    picked.length === quiz.questions.length &&
    picked.every((a, i) => Number.isInteger(a) && (a as number) >= 0 && (a as number) < quiz.questions[i].answers.length);
  if (!valid) return bad("Invalid answers.");

  const chosen = (picked as number[]).map((a, i) => quiz.questions[i].answers[a]);
  const score = scoreQuiz(quiz.outcomes.length, chosen.map((c) => c.outcome));

  // Skin quiz + newsletter box ticked: start their follow-up emails for this result. Best effort:
  // it never blocks the quiz. The emails only go out once they have confirmed their email address.
  if (body.newsletter === true && /skin/i.test(quiz.slug)) {
    const sequence = sequenceFor(score.winners.map((i) => quiz.outcomes[i].name));
    if (sequence) {
      try {
        await subscribeToDrip({
          email: body.email,
          firstName,
          quizSlug: quiz.slug,
          sequence,
          language: body.locale === "fr" ? "fr" : "en",
        });
      } catch (err) {
        console.error("[quiz] could not start the follow-up emails:", err);
      }
    } else {
      console.warn("[quiz] skin quiz result has no matching email sequence:", score.winners.map((i) => quiz.outcomes[i].name));
    }
  }

  try {
    await sendEmail(
      quizNotification({
        to: notifyAddress(),
        quizTitle: quiz.title,
        quizSlug: quiz.slug,
        language: body.locale === "fr" ? "French" : "English",
        firstName,
        email: body.email,
        ageGroup: clean(body.ageGroup, 80),
        identity: clean(body.identity, 80),
        country: clean(body.country, 80),
        motivation: clean(body.motivation, 160),
        newsletter: body.newsletter === true,
        balance: quiz.outcomes.map((o, i) => ({ name: o.name, percent: score.percents[i] })),
        winners: score.winners.map((i) => quiz.outcomes[i].name),
        answers: chosen.map((c, i) => ({
          question: quiz.questions[i].prompt,
          answer: c.text,
          outcome: quiz.outcomes[c.outcome]?.name ?? "",
        })),
      })
    );
  } catch (err) {
    return emailFailure(err);
  }

  return NextResponse.json({ ok: true });
}
