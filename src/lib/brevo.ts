/**
 * Minimal Brevo client (plain fetch, no SDK). Server-side only.
 *
 * Env (.env.local):
 *   BREVO_API_KEY               API key (SMTP & API → API Keys)
 *   BREVO_NEWSLETTER_LIST_ID    numeric id of the newsletter list
 *   BREVO_DOI_TEMPLATE_ID       numeric id of the double opt-in email template
 *   BREVO_SENDER_EMAIL          a verified sender on your authenticated domain
 *   BREVO_SENDER_NAME           display name (default "Vairutya")
 *   SITE_URL                    public site address (used for the confirmation redirect)
 *
 * In development, with no BREVO_API_KEY, emails are printed to the terminal instead
 * of being sent. In production a missing key is an error.
 */

const API = process.env.BREVO_API_URL ?? "https://api.brevo.com/v3";

export class EmailConfigError extends Error {}

export class BrevoError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(`Brevo responded ${status}`);
    this.name = "BrevoError";
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new EmailConfigError(`${name} is not set`);
  return v;
}

/** True when we should only log instead of calling Brevo (dev, no key). */
function devFallback(): boolean {
  return !process.env.BREVO_API_KEY && process.env.NODE_ENV !== "production";
}

async function brevoPost(path: string, body: unknown): Promise<Response> {
  return fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "api-key": requireEnv("BREVO_API_KEY"),
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

async function brevoRequest(method: "GET" | "PUT" | "DELETE", path: string, body?: unknown): Promise<Response> {
  return fetch(`${API}${path}`, {
    method,
    headers: {
      "api-key": requireEnv("BREVO_API_KEY"),
      accept: "application/json",
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
}

/**
 * Brevo keeps a "blocked or unsubscribed" list for transactional email. Someone who clicked
 * "unsubscribe" in any email sent through it lands there, and from then on Brevo silently drops
 * everything sent to them, including password resets. Unsubscribing from the newsletter must not
 * cost anyone their account emails, so this clears that block just before we send them one.
 * Best effort: a 404 means there was nothing to clear, and any other problem must never stop the email.
 */
export async function liftTransactionalBlock(email: string): Promise<void> {
  if (devFallback()) return;
  try {
    const res = await brevoRequest("DELETE", `/smtp/blockedContacts/${encodeURIComponent(email)}`);
    if (!res.ok && res.status !== 404) console.warn("[brevo] could not clear transactional block:", res.status);
  } catch (err) {
    console.warn("[brevo] could not clear transactional block:", (err as Error).message);
  }
}

/**
 * Someone who unsubscribed and now signs up again on the website has asked for the newsletter
 * on purpose, so lift the "unsubscribed" blocks Brevo may have on their address. Without this
 * Brevo silently refuses to send them the confirmation email. Best effort, never stops the signup.
 */
async function liftUnsubscribeBlocks(email: string): Promise<void> {
  if (devFallback()) return;
  try {
    const res = await brevoRequest("PUT", `/contacts/${encodeURIComponent(email)}`, { emailBlacklisted: false });
    if (!res.ok && res.status !== 404) console.warn("[brevo] could not lift marketing blocklist:", res.status);
  } catch (err) {
    console.warn("[brevo] could not lift marketing blocklist:", (err as Error).message);
  }
  await liftTransactionalBlock(email);
}

/** Public address of the site, without a trailing slash. */
export function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Double opt-in subscribe: Brevo emails the person a confirmation link and only
 * adds them to the list once they click it.
 */
export async function subscribeWithDoi(opts: {
  email: string;
  firstName?: string;
  source?: string;
  /**
   * Skin quiz: the result's list to join once they confirm, and the attributes that go with it (SKIN_TYPE, …).
   * They only join the list if Brevo accepts the attributes, because the automation's emails need them.
   */
  skin?: { listId: number; attributes: Record<string, string> };
}): Promise<void> {
  if (devFallback()) {
    console.log("[brevo:dev] DOI subscribe →", opts);
    return;
  }

  await liftUnsubscribeBlocks(opts.email);

  const base = {
    email: opts.email,
    includeListIds: [Number(requireEnv("BREVO_NEWSLETTER_LIST_ID"))],
    templateId: Number(requireEnv("BREVO_DOI_TEMPLATE_ID")),
    redirectionUrl: `${siteUrl()}/newsletter/confirmed`,
  };

  // Attributes must already exist in the Brevo account (FIRSTNAME does by default; the SKIN_* ones are created
  // by scripts/setup-brevo-skin.ts). If Brevo refuses them, still sign the person up for the newsletter, but
  // without the skin list, so the automation never sends them an email with missing content.
  const attempts: { attributes: Record<string, string>; skin: boolean }[] = [];
  if (opts.skin) attempts.push({ attributes: { ...(opts.firstName ? { FIRSTNAME: opts.firstName } : {}), ...opts.skin.attributes }, skin: true });
  if (opts.firstName) attempts.push({ attributes: { FIRSTNAME: opts.firstName }, skin: false });
  attempts.push({ attributes: {}, skin: false });

  let res!: Response;
  for (const [i, { attributes, skin }] of attempts.entries()) {
    res = await brevoPost("/contacts/doubleOptinConfirmation", {
      ...base,
      includeListIds: [...base.includeListIds, ...(skin && opts.skin ? [opts.skin.listId] : [])],
      ...(Object.keys(attributes).length ? { attributes } : {}),
    });
    if (res.status !== 400) break;
    const text = await res.clone().text();
    if (/duplicate|already/i.test(text)) break; // not an attribute problem
    if (skin) console.error("[brevo] the skin-quiz attributes were refused, so this person gets the newsletter only. Run scripts/setup-brevo-skin.ts. Brevo said:", text.slice(0, 200));
    void i;
  }

  if (res.status === 201 || res.status === 204) return;

  const text = await res.text();
  // Already on the list / already pending: treat as success so the form stays friendly.
  if (res.status === 400 && /duplicate|already/i.test(text)) return;
  throw new BrevoError(res.status, text.slice(0, 500));
}

/**
 * A quiz taker who ticked the newsletter box.
 *  - Skin quiz: they also join the list for their result, which starts that result's Brevo automation.
 *    New contact: double opt-in as usual, and the lists are joined once they confirm.
 *    Already confirmed on the newsletter (e.g. retaking the quiz): no second confirmation email;
 *    they are moved straight to the list for the new result, so the new automation starts.
 *  - Any other quiz: the plain newsletter signup.
 */
export async function subscribeQuizTaker(opts: {
  email: string;
  firstName?: string;
  skin?: { type: string; listId: number; otherListIds: number[]; attributes: Record<string, string> };
}): Promise<void> {
  if (!opts.skin) return subscribeWithDoi({ email: opts.email, firstName: opts.firstName, source: "quiz" });

  const { listId, otherListIds, attributes } = opts.skin;
  if (devFallback()) {
    console.log("[brevo:dev] quiz subscribe →", opts);
    return;
  }

  const newsletterId = Number(requireEnv("BREVO_NEWSLETTER_LIST_ID"));
  const found = await brevoRequest("GET", `/contacts/${encodeURIComponent(opts.email)}`);
  if (found.ok) {
    const c = (await found.json()) as { listIds?: number[]; emailBlacklisted?: boolean };
    if (!c.emailBlacklisted && c.listIds?.includes(newsletterId)) {
      // Update the attributes first: the emails read them, so they must be right before the automation starts.
      const attrs = await brevoRequest("PUT", `/contacts/${encodeURIComponent(opts.email)}`, { attributes });
      if (attrs.status === 400) {
        console.error("[brevo] the skin-quiz attributes were refused, so they stay on the newsletter only. Run scripts/setup-brevo-skin.ts. Brevo said:", (await attrs.text()).slice(0, 200));
        return;
      }
      if (!attrs.ok && attrs.status !== 204) throw new BrevoError(attrs.status, (await attrs.text()).slice(0, 500));
      const moved = await brevoRequest("PUT", `/contacts/${encodeURIComponent(opts.email)}`, {
        listIds: [listId],
        unlinkListIds: otherListIds.filter((id) => id !== listId),
      });
      if (!moved.ok && moved.status !== 204) throw new BrevoError(moved.status, (await moved.text()).slice(0, 500));
      return;
    }
  } else if (found.status !== 404) {
    throw new BrevoError(found.status, (await found.text()).slice(0, 300));
  }

  await subscribeWithDoi({ email: opts.email, firstName: opts.firstName, source: "quiz", skin: { listId, attributes } });
}

export type Mail = {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
  replyTo?: { email: string; name?: string };
};

export async function sendEmail(mail: Mail): Promise<void> {
  if (devFallback()) {
    console.log(
      `[brevo:dev] EMAIL → ${mail.to.email}\n  subject: ${mail.subject}\n  replyTo: ${mail.replyTo?.email ?? "-"}\n  ${mail.text.replace(/\n/g, "\n  ")}`
    );
    return;
  }

  await liftTransactionalBlock(mail.to.email);

  const res = await brevoPost("/smtp/email", {
    sender: {
      email: requireEnv("BREVO_SENDER_EMAIL"),
      name: process.env.BREVO_SENDER_NAME ?? "Vairutya",
    },
    to: [mail.to],
    subject: mail.subject,
    htmlContent: mail.html,
    textContent: mail.text,
    ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
  });

  if (!res.ok) throw new BrevoError(res.status, (await res.text()).slice(0, 500));
}

/** Where messages to the team (contact form, booking requests) are delivered. */
export function notifyAddress(): string {
  return requireEnv("NOTIFY_EMAIL");
}
