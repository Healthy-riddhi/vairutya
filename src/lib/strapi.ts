/**
 * Tiny Strapi client. Runs on the server only (Server Components / route handlers).
 * STRAPI_URL is set in .env.local — e.g. http://localhost:1337
 */
export const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";

export type StrapiMedia = {
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
};

/** Strapi returns "/uploads/x.jpg" for local files and a full URL for Cloudinary. */
export function mediaUrl(media?: StrapiMedia | null): string | null {
  if (!media?.url) return null;
  return media.url.startsWith("http") ? media.url : `${STRAPI_URL}${media.url}`;
}

/** An error from Strapi that keeps the HTTP status (so callers can tell a 404 apart). */
export class StrapiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "StrapiError";
  }
}

/**
 * GET /api/<path>?<query>. `query` is a raw Strapi query string,
 * e.g. "populate[image]=true&locale=en".
 * Pages re-check Strapi at most once a minute, so edits show up quickly.
 */
export async function strapiGet<T>(
  path: string,
  query = "",
  revalidate = 60
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${STRAPI_URL}/api/${path}${query ? `?${query}` : ""}`, {
      next: { revalidate },
    });
  } catch {
    throw new Error(
      `Could not reach Strapi at ${STRAPI_URL}. Is it running? (cd vairutya-cms && npm run develop)`
    );
  }
  if (!res.ok) {
    throw new StrapiError(`Strapi ${path} responded ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}
