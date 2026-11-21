/**
 * One-time Brevo setup for the skin-quiz emails. It creates, in your Brevo account:
 *   - a folder "Skin quiz" with seven lists, one per skin result
 *   - six contact attributes: SKIN_TYPE and SKIN_SUBJECT_1 to _5 (all Text)
 * and prints the BREVO_SKIN_LISTS line to put in your environment settings.
 * Anything that already exists is left alone, so it is safe to run again.
 *
 * Run it from the project folder (it reads BREVO_API_KEY from .env.local):
 *   npx tsx scripts/setup-brevo-skin.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { SEQUENCE_KEYS, SEQUENCE_LABEL, SKIN_ATTRIBUTE_NAMES } from "../src/lib/skin-quiz";

// Read .env.local without needing any extra package
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const KEY = process.env.BREVO_API_KEY;
if (!KEY) {
  console.error("BREVO_API_KEY is not set. Add it to .env.local (Brevo: SMTP & API → API Keys), then run this again.");
  process.exit(1);
}
const API = process.env.BREVO_API_URL ?? "https://api.brevo.com/v3";

async function brevo(method: string, path: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "api-key": KEY!, accept: "application/json", ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return json;
}

async function allPages<T>(path: string, field: string): Promise<T[]> {
  const out: T[] = [];
  for (let offset = 0; ; offset += 50) {
    const j = await brevo("GET", `${path}${path.includes("?") ? "&" : "?"}limit=50&offset=${offset}`);
    const page: T[] = j?.[field] ?? [];
    out.push(...page);
    if (page.length < 50) return out;
  }
}

(async () => {
  // 1. folder
  const folders = await allPages<{ id: number; name: string }>("/contacts/folders", "folders");
  let folder = folders.find((f) => f.name === "Skin quiz");
  if (!folder) {
    const r = await brevo("POST", "/contacts/folders", { name: "Skin quiz" });
    folder = { id: r.id, name: "Skin quiz" };
    console.log(`Created folder "Skin quiz" (${folder.id})`);
  }

  // 2. lists
  const lists = await allPages<{ id: number; name: string }>("/contacts/lists", "lists");
  const ids: string[] = [];
  for (const key of SEQUENCE_KEYS) {
    const name = `Skin quiz – ${SEQUENCE_LABEL[key]}`;
    let list = lists.find((l) => l.name === name);
    if (!list) {
      const r = await brevo("POST", "/contacts/lists", { name, folderId: folder.id });
      list = { id: r.id, name };
      console.log(`Created list "${name}" (${list.id})`);
    } else {
      console.log(`List "${name}" already exists (${list.id})`);
    }
    ids.push(`${key}:${list.id}`);
  }

  // 3. attributes
  const existing = await brevo("GET", "/contacts/attributes");
  const have = new Set<string>((existing?.attributes ?? []).map((a: { name: string }) => a.name));
  for (const name of SKIN_ATTRIBUTE_NAMES) {
    if (have.has(name)) {
      console.log(`Attribute ${name} already exists`);
      continue;
    }
    await brevo("POST", `/contacts/attributes/normal/${name}`, { type: "text" });
    console.log(`Created attribute ${name}`);
  }

  console.log("\nDone. Add this line to your environment settings (.env.local and Hostinger), then redeploy:\n");
  console.log(`BREVO_SKIN_LISTS=${ids.join(",")}\n`);
})().catch((err) => {
  console.error("\nSetup stopped:", err instanceof Error ? err.message : err);
  process.exit(1);
});
