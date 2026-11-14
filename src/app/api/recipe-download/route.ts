import { NextResponse } from "next/server";
import { sendEmail, subscribeWithDoi } from "@/lib/brevo";
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
import { recipeEmail } from "@/lib/email-templates";
import { getRecipeBySlug } from "@/lib/content";

/** Emails the recipe PDF. Joining the newsletter is separate and optional. */
export async function POST(req: Request) {
  const body = await readJson(req);
  const name = clean(body?.name, 80);
  const slug = clean(body?.slug, 120);
  if (!body || !name || !slug || !isEmail(body.email)) {
    return bad("Please enter your name and a valid email.");
  }

  if (rateLimited(`recipe:${clientIp(req)}`, 5, 10 * 60_000)) return tooMany();

  const recipe = await getRecipeBySlug(slug).catch(() => undefined);
  if (!recipe) return bad("Recipe not found.", 404);
  if (!recipe.pdfUrl) return bad("The PDF for this recipe isn’t available yet.", 404);

  try {
    await sendEmail(
      recipeEmail({
        name,
        email: body.email,
        recipeTitle: recipe.title,
        pdfUrl: recipe.pdfUrl,
      })
    );
  } catch (err) {
    return emailFailure(err);
  }

  // Newsletter only if they ticked the box. A failure here must not undo the download.
  if (body.newsletter === true) {
    try {
      await subscribeWithDoi({
        email: body.email,
        firstName: name.split(" ")[0],
        source: `recipe-${slug}`,
      });
    } catch (err) {
      console.error("[recipe-download] newsletter opt-in failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
