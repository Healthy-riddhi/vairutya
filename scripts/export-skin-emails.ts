/**
 * Writes the 35 skin-quiz emails as HTML files, ready to paste into Brevo, plus an index that tells
 * you which list, wait and subject line goes with each one.
 *
 * Run it from the project folder:   npx tsx scripts/export-skin-emails.ts
 * It creates a folder called  skin-emails/  (safe to delete afterwards; run it again any time the
 * wording in src/lib/skin-sequences.ts changes).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SKIN_SEQUENCES } from "../src/lib/skin-sequences";
import { SCHEDULE, SEQUENCE_KEYS, SEQUENCE_LABEL, brevoEmailHtml } from "../src/lib/skin-quiz";

const out = join(process.cwd(), "skin-emails");
mkdirSync(out, { recursive: true });

const index: string[] = [
  "# Skin quiz emails for Brevo",
  "",
  "One Brevo list and one automation per result. In each automation:",
  "",
  "1. Trigger: **Contact added to list** (the list below)",
  "2. Wait → Send email → Wait → Send email … as in the table. Each **Wait** counts from the previous email.",
  "3. In each **Send an email** step, use the HTML file named in the table, with the subject and preview text shown.",
  "",
];

for (const key of SEQUENCE_KEYS) {
  const label = SEQUENCE_LABEL[key];
  index.push(`## ${label}`, "", `List name suggestion: **Skin quiz – ${label}**   ·   Automation name suggestion: **Skin quiz – ${label}**`, "");
  index.push("| Step | Wait before | Sent on day | File | Subject | Preview text |", "|---|---|---|---|---|---|");
  for (const e of SKIN_SEQUENCES[key]) {
    const s = SCHEDULE.find((x) => x.step === e.step)!;
    const file = `${key}-${e.step}-day${s.day}.html`;
    writeFileSync(join(out, file), brevoEmailHtml(e), "utf8");
    index.push(`| ${e.step} | ${s.wait} | ${s.day} | ${file} | ${e.subject} | ${e.preview} |`);
  }
  index.push("");
}

writeFileSync(join(out, "INDEX.md"), index.join("\n"), "utf8");
console.log(`Wrote ${SEQUENCE_KEYS.length * 5} emails and INDEX.md to ${out}`);
