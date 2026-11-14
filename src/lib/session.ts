import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { STRAPI_URL } from "@/lib/strapi";

/**
 * The login token lives in an httpOnly cookie, so page scripts (and anything injected
 * into the page) can never read it. Only the server reads it.
 */
export const SESSION_COOKIE = "vr_session";
const ONE_WEEK = 60 * 60 * 24 * 7; // matches the token lifetime set in Strapi

export type SessionUser = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
};

export async function setSession(jwt: string) {
  (await cookies()).set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** The signed-in customer, or null. Never cached. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(process.env.SITE_SECRET ? { "x-site-key": process.env.SITE_SECRET } : {}),
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const u = await res.json();
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName ?? "",
      phone: u.phone ?? "",
      createdAt: u.createdAt,
    };
  } catch {
    return null;
  }
}

/** For protected pages: returns the customer, or sends visitors to sign in first. */
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect({ href: `/login?next=${encodeURIComponent(returnTo)}`, locale: await getLocale() });
    throw new Error("unreachable");
  }
  return user;
}
