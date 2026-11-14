#!/usr/bin/env node
/**
 * Brevo setup helper. Does the fiddly dashboard work through Brevo's API.
 *
 *   node --env-file=.env.local scripts/brevo-setup.mjs <command>
 *
 * Commands
 *   account              check that your API key works
 *   senders              list your senders (is hello@... verified?)
 *   lists                list your contact lists and their IDs
 *   create-list [name]   create the newsletter list (default name "Newsletter")
 *   create-templates     create (or update) the confirmation + newsletter templates
 *   test-email <to>      send a real test email through your sender
 *   test-doi <to>        run the real double opt-in flow for an address
 *
 * Reads from .env.local: BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME,
 * BREVO_NEWSLETTER_LIST_ID, BREVO_DOI_TEMPLATE_ID, SITE_URL
 */
import { readFile } from "node:fs/promises";

const API = process.env.BREVO_API_URL ?? "https://api.brevo.com/v3";
const KEY = process.env.BREVO_API_KEY;

const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
};
const need = (name) => process.env[name] || fail(`${name} is missing from .env.local`);

if (!KEY) fail("BREVO_API_KEY is missing from .env.local (Brevo → your name → SMTP & API → API Keys).");

async function call(method, path, body) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        "api-key": KEY,
        accept: "application/json",
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    fail(`Could not reach Brevo (${err.message}). Check your internet connection.`);
  }
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* not JSON */
  }
  return { status: res.status, ok: res.ok, json, text };
}

/** Print a helpful message for a failed call, then stop. */
function explain(r, what) {
  const detail = r.json?.message ?? r.text ?? "";
  let hint = "";
  if (r.status === 401) hint = "Brevo rejected the API key. Generate a new one (SMTP & API → API Keys) and paste it into .env.local with no spaces or quotes.";
  else if (r.status === 403) hint = "Your account isn't allowed to do this yet. New Brevo accounts sometimes need to be activated: contact Brevo support from inside the dashboard.";
  else if (/sender/i.test(detail)) hint = "Brevo doesn't accept this sender. Run the 'senders' command: the address in BREVO_SENDER_EMAIL must be listed there and active. Add and verify it under Senders, Domains & Dedicated IPs.";
  fail(`${what} failed (HTTP ${r.status}): ${detail}${hint ? `\n\n  → ${hint}` : ""}`);
}

const sender = () => ({
  email: need("BREVO_SENDER_EMAIL"),
  name: process.env.BREVO_SENDER_NAME || "Vairutya",
});

const commands = {
  async account() {
    const r = await call("GET", "/account");
    if (!r.ok) explain(r, "Checking your account");
    const a = r.json;
    console.log("✓ Your API key works.\n");
    console.log(`  Account : ${a.companyName || a.firstName || "(unnamed)"} <${a.email}>`);
    for (const p of a.plan ?? []) {
      console.log(`  Plan    : ${p.type}${p.credits !== undefined ? `, ${p.credits} credits left` : ""}${p.creditsType ? ` (${p.creditsType})` : ""}`);
    }
  },

  async senders() {
    const r = await call("GET", "/senders");
    if (!r.ok) explain(r, "Listing senders");
    const list = r.json?.senders ?? [];
    if (!list.length) {
      console.log("No senders yet. Add one in Brevo: Senders, Domains & Dedicated IPs → Senders → Add a sender.");
      return;
    }
    console.log("Senders:\n");
    for (const s of list) console.log(`  ${s.active ? "✓ active  " : "✗ inactive"}  ${s.email}  (${s.name})`);
    const want = process.env.BREVO_SENDER_EMAIL;
    if (want) {
      const found = list.find((s) => s.email.toLowerCase() === want.toLowerCase());
      console.log(
        found?.active
          ? `\n✓ BREVO_SENDER_EMAIL (${want}) is a verified, active sender.`
          : `\n✗ BREVO_SENDER_EMAIL (${want}) is ${found ? "not active yet" : "not in this list"}. Fix that before sending.`
      );
    }
  },

  async lists() {
    const r = await call("GET", "/contacts/lists?limit=50&offset=0");
    if (!r.ok) explain(r, "Listing contact lists");
    const lists = r.json?.lists ?? [];
    if (!lists.length) return console.log("No lists yet. Run:  create-list");
    console.log("ID      Subscribers  Name");
    for (const l of lists) {
      console.log(`${String(l.id).padEnd(7)} ${String(l.uniqueSubscribers ?? l.totalSubscribers ?? 0).padEnd(12)} ${l.name}`);
    }
  },

  async "create-list"(name = "Newsletter") {
    const existing = await call("GET", "/contacts/lists?limit=50&offset=0");
    if (!existing.ok) explain(existing, "Listing contact lists");
    const found = (existing.json?.lists ?? []).find((l) => l.name === name);
    if (found) {
      console.log(`• A list called "${name}" already exists.\n`);
      return console.log(`Add this to .env.local:\n\n  BREVO_NEWSLETTER_LIST_ID=${found.id}\n`);
    }
    const folders = await call("GET", "/contacts/folders?limit=50&offset=0");
    if (!folders.ok) explain(folders, "Listing folders");
    const folder = folders.json?.folders?.[0];
    if (!folder) fail("Your account has no contact folder yet. Create one in Brevo (Contacts → Lists → New folder) and run this again.");
    const r = await call("POST", "/contacts/lists", { name, folderId: folder.id });
    if (!r.ok) explain(r, "Creating the list");
    console.log(`✓ Created the list "${name}".\n`);
    console.log(`Add this to .env.local:\n\n  BREVO_NEWSLETTER_LIST_ID=${r.json.id}\n`);
  },

  async "create-templates"() {
    const from = sender();
    const defs = [
      {
        env: "BREVO_DOI_TEMPLATE_ID",
        templateName: "Vairutya - Confirm your subscription (double opt-in)",
        subject: "Please confirm your subscription to Vairutya",
        file: "double-opt-in.html",
      },
      {
        env: null,
        templateName: "Vairutya - Recipe newsletter",
        subject: "The Rebel Avocado Toast: a breakfast that balances Vata & Pitta",
        file: "recipe-newsletter.html",
      },
    ];

    const existing = await call("GET", "/smtp/templates?limit=100&offset=0&sort=desc");
    if (!existing.ok) explain(existing, "Listing templates");
    const byName = new Map((existing.json?.templates ?? []).map((t) => [t.name, t.id]));

    const ids = {};
    for (const d of defs) {
      const htmlContent = await readFile(new URL(`../email-templates/${d.file}`, import.meta.url), "utf8");
      const body = { templateName: d.templateName, subject: d.subject, htmlContent, sender: from, isActive: true };
      const id = byName.get(d.templateName);
      if (id) {
        const r = await call("PUT", `/smtp/templates/${id}`, body);
        if (!r.ok) explain(r, `Updating "${d.templateName}"`);
        console.log(`↻ Updated  "${d.templateName}"  (ID ${id})`);
        ids[d.templateName] = id;
      } else {
        const r = await call("POST", "/smtp/templates", body);
        if (!r.ok) explain(r, `Creating "${d.templateName}"`);
        console.log(`✓ Created  "${d.templateName}"  (ID ${r.json.id})`);
        ids[d.templateName] = r.json.id;
      }
    }
    console.log(`\nAdd this to .env.local:\n\n  BREVO_DOI_TEMPLATE_ID=${ids[defs[0].templateName]}\n`);
    console.log("Your newsletter template is now in Brevo under Campaigns → Email templates (or Templates).");
  },

  async "test-email"(to) {
    if (!to) fail("Usage: test-email you@example.com");
    const r = await call("POST", "/smtp/email", {
      sender: sender(),
      to: [{ email: to }],
      subject: "Vairutya test email",
      htmlContent: "<p>If you can read this, your Brevo sender works. 🎉</p>",
      textContent: "If you can read this, your Brevo sender works.",
    });
    if (!r.ok) explain(r, "Sending the test email");
    console.log(`✓ Brevo accepted the email for ${to}. Check the inbox (and spam) in a minute.`);
  },

  async "test-doi"(to) {
    if (!to) fail("Usage: test-doi you@example.com");
    const site = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
    const r = await call("POST", "/contacts/doubleOptinConfirmation", {
      email: to,
      includeListIds: [Number(need("BREVO_NEWSLETTER_LIST_ID"))],
      templateId: Number(need("BREVO_DOI_TEMPLATE_ID")),
      redirectionUrl: `${site}/newsletter/confirmed`,
    });
    if (r.status === 201 || r.status === 204) {
      console.log(`✓ Confirmation email requested for ${to}.`);
      console.log(`  Open it and click "Yes, subscribe me". You should land on ${site}/newsletter/confirmed`);
      console.log("  (the website must be running), and the address appears in your Newsletter list.");
      return;
    }
    explain(r, "Starting the double opt-in");
  },
};

const [cmd, ...args] = process.argv.slice(2);
if (!cmd || !commands[cmd]) {
  console.log("Usage: node --env-file=.env.local scripts/brevo-setup.mjs <command>\n");
  console.log("Commands: " + Object.keys(commands).join(", "));
  process.exit(cmd ? 1 : 0);
}
await commands[cmd](...args);
