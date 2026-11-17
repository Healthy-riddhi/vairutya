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

async function brevoRequest(method: "PUT" | "DELETE", path: string, body?: unknown): Promise<Response> {
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
}): Promise<void> {
  if (devFallback()) {
    console.log("[brevo:dev] DOI subscribe →", opts);
    return;
  }

  await liftUnsubscribeBlocks(opts.email);

  const payload = {
    email: opts.email,
    includeListIds: [Number(requireEnv("BREVO_NEWSLETTER_LIST_ID"))],
    templateId: Number(requireEnv("BREVO_DOI_TEMPLATE_ID")),
    redirectionUrl: `${siteUrl()}/newsletter/confirmed`,
    ...(opts.firstName ? { attributes: { FIRSTNAME: opts.firstName } } : {}),
  };

  let res = await brevoPost("/contacts/doubleOptinConfirmation", payload);

  // The FIRSTNAME attribute must already exist in the Brevo account. If it doesn't,
  // still subscribe the person (without their first name) rather than failing.
  if (res.status === 400 && payload.attributes) {
    const { attributes: _drop, ...withoutAttributes } = payload;
    void _drop;
    res = await brevoPost("/contacts/doubleOptinConfirmation", withoutAttributes);
  }

  if (res.status === 201 || res.status === 204) return;

  const text = await res.text();
  // Already on the list / already pending: treat as success so the form stays friendly.
  if (res.status === 400 && /duplicate|already/i.test(text)) return;
  throw new BrevoError(res.status, text.slice(0, 500));
}

export type Mail = {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
  replyTo?: { email: string; name?: string };
  /** Extra email headers, e.g. List-Unsubscribe. */
  headers?: Record<string, string>;
};

/**
 * `respectBlocks`: for marketing-style emails (the skin-quiz series). Brevo's "blocked" list is then
 * honoured, so someone who bounced or marked us as spam is never emailed again. Account emails
 * (receipts, password resets) leave it off so an old unsubscribe can't cost anyone their account email.
 */
export async function sendEmail(mail: Mail, opts: { respectBlocks?: boolean } = {}): Promise<void> {
  if (devFallback()) {
    console.log(
      `[brevo:dev] EMAIL → ${mail.to.email}\n  subject: ${mail.subject}\n  replyTo: ${mail.replyTo?.email ?? "-"}\n  ${mail.text.replace(/\n/g, "\n  ")}`
    );
    return;
  }

  if (!opts.respectBlocks) await liftTransactionalBlock(mail.to.email);

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
    ...(mail.headers ? { headers: mail.headers } : {}),
  });

  if (!res.ok) throw new BrevoError(res.status, (await res.text()).slice(0, 500));
}

/**
 * Has this person confirmed the newsletter (double opt-in) and not left it?
 *  - "ok": they are on the newsletter list
 *  - "pending": no confirmation yet (the confirmation email is still unanswered)
 *  - "blocked": they unsubscribed, or Brevo blocks their address
 * The skin-quiz emails only go to people who say "ok". In development with no Brevo key it is always "ok".
 */
export async function newsletterConsent(email: string): Promise<"ok" | "pending" | "blocked"> {
  if (devFallback()) return "ok";
  const listId = Number(requireEnv("BREVO_NEWSLETTER_LIST_ID"));
  const res = await fetch(`${API}/contacts/${encodeURIComponent(email)}`, {
    headers: { "api-key": requireEnv("BREVO_API_KEY"), accept: "application/json" },
    cache: "no-store",
  });
  if (res.status === 404) return "pending";
  if (!res.ok) throw new BrevoError(res.status, (await res.text()).slice(0, 300));
  const c = (await res.json()) as { listIds?: number[]; emailBlacklisted?: boolean; listUnsubscribed?: number[] };
  if (c.emailBlacklisted || c.listUnsubscribed?.includes(listId)) return "blocked";
  return c.listIds?.includes(listId) ? "ok" : "pending";
}

/** Where messages to the team (contact form, booking requests) are delivered. */
export function notifyAddress(): string {
  return requireEnv("NOTIFY_EMAIL");
}
