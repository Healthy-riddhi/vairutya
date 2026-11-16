import { NextResponse } from "next/server";
import { STRAPI_URL } from "@/lib/strapi";
import { clean, clientIp, isEmail, rateLimited, readJson } from "@/lib/api-utils";
import { liftTransactionalBlock } from "@/lib/brevo";
import { clearSession, getSessionUser, getToken, setSession } from "@/lib/session";

/**
 * All account actions: POST /api/auth/<action>
 *   register · login · logout · forgot-password · reset-password · resend-confirmation
 *   profile · password · delete          (GET: session · export)
 * The browser only ever talks to these; Strapi stays behind the server.
 */
type Ctx = { params: Promise<{ action: string }> };
type Body = Record<string, unknown>;

const NO_STORE = { "Cache-Control": "no-store" };
const MIN_PASSWORD = 10;
const MAX_PASSWORD = 72;
const TEN_MIN = 10 * 60_000;

const ok = (body: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: true, ...body }, { headers: NO_STORE });

const fail = (error: string, status = 400, code?: string) =>
  NextResponse.json({ error, code }, { status, headers: NO_STORE });

const slowDown = () => fail("Too many attempts. Please wait a few minutes and try again.", 429);

/** Blocks other websites from making a signed-in browser submit these forms. */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // browsers always send it on cross-site POSTs
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function passwordProblem(pw: unknown): string | null {
  if (typeof pw !== "string" || pw.length < MIN_PASSWORD) {
    return `Use at least ${MIN_PASSWORD} characters for your password.`;
  }
  if (pw.length > MAX_PASSWORD) return `Use at most ${MAX_PASSWORD} characters.`;
  return null;
}

async function strapi(
  path: string,
  opts: { method?: string; body?: unknown; token?: string } = {}
) {
  const method = opts.method ?? "POST";
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    method,
    headers: {
      ...(process.env.SITE_SECRET ? { "x-site-key": process.env.SITE_SECRET } : {}),
      ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  return {
    ok: res.ok,
    status: res.status,
    json,
    message: (json?.error?.message as string | undefined) ?? "",
  };
}

/* ------------------------------------------------------------------ */

async function register(body: Body, ip: string) {
  const email = clean(body.email, 254).toLowerCase();
  const fullName = clean(body.fullName, 80);
  const password = body.password;

  if (!isEmail(email) || !fullName) return fail("Please enter your name and a valid email.");
  const problem = passwordProblem(password);
  if (problem) return fail(problem);
  if (rateLimited(`register:${ip}`, 5, TEN_MIN)) return slowDown();

  await liftTransactionalBlock(email);
  const r = await strapi("/auth/local/register", {
    body: { username: email, email, password, fullName },
  });

  if (r.ok) {
    // Confirmation switched off (local development only): they are signed in straight away.
    if (r.json?.jwt) {
      await setSession(r.json.jwt);
      return ok({ signedIn: true });
    }
    return ok({ needsConfirmation: true });
  }

  // Never reveal whether an address already has an account.
  if (/already taken/i.test(r.message)) return ok({ needsConfirmation: true });

  console.error("[auth] register failed:", r.status, r.message);
  return r.status === 400
    ? fail("Please check your details and try again.")
    : fail("We couldn't create your account. Please try again.", 502);
}

async function login(body: Body, ip: string) {
  const email = clean(body.email, 254).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!isEmail(email) || !password) return fail("Please enter your email and password.");
  if (rateLimited(`login:${ip}`, 30, TEN_MIN) || rateLimited(`login-email:${email}`, 8, TEN_MIN)) {
    return slowDown();
  }

  const r = await strapi("/auth/local", { body: { identifier: email, password } });

  if (r.ok && r.json?.jwt) {
    await setSession(r.json.jwt);
    return ok();
  }
  if (r.status === 429) return slowDown();
  if (/not confirmed/i.test(r.message)) {
    return fail("Please confirm your email first. We sent you a link.", 403, "unconfirmed");
  }
  if (/blocked/i.test(r.message)) {
    return fail("This account is unavailable. Please contact us.", 403, "blocked");
  }
  if (r.status >= 500) {
    console.error("[auth] login failed:", r.status, r.message);
    return fail("Something went wrong. Please try again.", 502);
  }
  return fail("Incorrect email or password.", 401);
}

async function forgotPassword(body: Body, ip: string) {
  const email = clean(body.email, 254).toLowerCase();
  if (!isEmail(email)) return fail("Please enter a valid email.");
  if (rateLimited(`forgot:${ip}`, 3, TEN_MIN)) return slowDown();

  // Always answer the same way, so nobody can use this to find out who has an account.
  await liftTransactionalBlock(email);
  const r = await strapi("/auth/forgot-password", { body: { email } });
  if (!r.ok) console.error("[auth] forgot-password:", r.status, r.message);
  return ok();
}

async function resetPassword(body: Body, ip: string) {
  const code = clean(body.code, 300);
  const problem = passwordProblem(body.password);
  if (!code) return fail("This reset link is invalid.", 400, "invalid_code");
  if (problem) return fail(problem);
  if (rateLimited(`reset:${ip}`, 5, TEN_MIN)) return slowDown();

  const r = await strapi("/auth/reset-password", {
    body: { code, password: body.password, passwordConfirmation: body.password },
  });
  if (r.ok) {
    await clearSession();
    return ok();
  }
  if (r.status === 400) {
    return fail("This reset link is invalid or has expired. Please request a new one.", 400, "invalid_code");
  }
  console.error("[auth] reset-password:", r.status, r.message);
  return fail("Something went wrong. Please try again.", 502);
}

async function resendConfirmation(body: Body, ip: string) {
  const email = clean(body.email, 254).toLowerCase();
  if (!isEmail(email)) return fail("Please enter a valid email.");
  if (rateLimited(`resend:${ip}`, 3, TEN_MIN)) return slowDown();

  await liftTransactionalBlock(email);
  await strapi("/auth/send-email-confirmation", { body: { email } });
  return ok();
}

async function updateProfile(body: Body) {
  const token = await getToken();
  if (!token) return fail("Please sign in again.", 401);

  const fullName = clean(body.fullName, 80);
  const phone = clean(body.phone, 40);
  if (!fullName) return fail("Please enter your name.");

  const r = await strapi("/account/profile", {
    method: "PUT",
    token,
    body: { fullName, phone },
  });
  if (r.status === 401 || r.status === 403) return fail("Please sign in again.", 401);
  if (!r.ok) return fail("We couldn't save your changes. Please try again.", 502);
  return ok({ fullName, phone });
}

async function changePassword(body: Body, ip: string) {
  const token = await getToken();
  if (!token) return fail("Please sign in again.", 401);

  const current = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const problem = passwordProblem(body.password);
  if (!current) return fail("Please enter your current password.");
  if (problem) return fail(problem);
  if (current === body.password) return fail("Please choose a password different from your current one.");
  if (rateLimited(`pw:${ip}`, 5, TEN_MIN)) return slowDown();

  const r = await strapi("/auth/change-password", {
    token,
    body: { currentPassword: current, password: body.password, passwordConfirmation: body.password },
  });
  if (r.ok) return ok();
  if (r.status === 401 || r.status === 403) return fail("Please sign in again.", 401);
  if (/current password/i.test(r.message)) {
    return fail("Your current password is incorrect.", 400, "wrong_password");
  }
  console.error("[auth] change-password:", r.status, r.message);
  return fail("We couldn't change your password. Please try again.", 502);
}

async function deleteAccount(body: Body, ip: string) {
  const token = await getToken();
  const user = await getSessionUser();
  if (!token || !user) return fail("Please sign in again.", 401);
  const password = typeof body.password === "string" ? body.password : "";
  if (!password) return fail("Please enter your password to confirm.");
  if (rateLimited(`delete:${ip}`, 3, TEN_MIN)) return slowDown();

  // Deleting is permanent, so ask for the password again.
  const again = await strapi("/auth/local", { body: { identifier: user.email, password } });
  if (!again.ok) return fail("That password isn't correct.", 400, "wrong_password");

  const r = await strapi("/account", { method: "DELETE", token });
  if (!r.ok) return fail("We couldn't delete your account. Please contact us.", 502);
  await clearSession();
  return ok();
}

/* ------------------------------------------------------------------ */

export async function POST(req: Request, { params }: Ctx) {
  const { action } = await params;
  if (!sameOrigin(req)) return fail("Request blocked.", 403);

  const body: Body = (await readJson(req)) ?? {};
  const ip = clientIp(req);

  switch (action) {
    case "register":
      return register(body, ip);
    case "login":
      return login(body, ip);
    case "logout":
      await clearSession();
      return ok();
    case "forgot-password":
      return forgotPassword(body, ip);
    case "reset-password":
      return resetPassword(body, ip);
    case "resend-confirmation":
      return resendConfirmation(body, ip);
    case "profile":
      return updateProfile(body);
    case "password":
      return changePassword(body, ip);
    case "delete":
      return deleteAccount(body, ip);
    default:
      return fail("Not found.", 404);
  }
}

export async function GET(_req: Request, { params }: Ctx) {
  const { action } = await params;

  if (action === "session") {
    const user = await getSessionUser();
    return NextResponse.json(
      { user: user ? { id: user.id, email: user.email, fullName: user.fullName } : null },
      { headers: NO_STORE }
    );
  }

  if (action === "export") {
    const token = await getToken();
    if (!token) return fail("Please sign in again.", 401);
    const r = await strapi("/account/export", { method: "GET", token });
    if (!r.ok) return fail("We couldn't prepare your data.", 502);
    return new NextResponse(JSON.stringify(r.json, null, 2), {
      headers: {
        ...NO_STORE,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="vairutya-my-data.json"',
      },
    });
  }

  return fail("Not found.", 404);
}
