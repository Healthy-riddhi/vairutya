import { Link } from "@/i18n/navigation";
import { Fragment, type ReactNode } from "react";

/**
 * Tiny, safe formatter for article text written in Strapi.
 *   **bold**   *italic*   [label](/link or https://…)
 * No HTML is ever injected — everything becomes React elements.
 */
const TOKEN = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function InlineText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));

    if (m[1] !== undefined) {
      out.push(
        <strong key={key++} className="font-semibold text-ink">
          <InlineText text={m[1]} />
        </strong>
      );
    } else if (m[2] !== undefined) {
      out.push(<em key={key++}>{m[2]}</em>);
    } else {
      const href = m[4];
      const cls =
        "font-medium text-teal underline decoration-teal/40 underline-offset-4 transition-colors hover:decoration-teal";
      out.push(
        href.startsWith("/") ? (
          <Link key={key++} href={href} className={cls}>
            {m[3]}
          </Link>
        ) : (
          <a
            key={key++}
            href={href}
            className={cls}
            target="_blank"
            rel="noopener noreferrer"
          >
            {m[3]}
          </a>
        )
      );
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));

  return (
    <>
      {out.map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </>
  );
}

const BULLET = /^\s*[-•]\s+/;
const NUMBER = /^\s*\d+[.)]\s+/;

/** One block of article text: a bullet list, a numbered list, or a paragraph. */
export function RichBlock({ text }: { text: string }) {
  const lines = text.split("\n").filter((l) => l.trim() !== "");

  if (lines.length > 0 && lines.every((l) => BULLET.test(l))) {
    return (
      <ul className="mb-5 list-disc space-y-3 pl-6 text-base leading-[1.8] text-ink marker:text-teal">
        {lines.map((l, i) => (
          <li key={i}>
            <InlineText text={l.replace(BULLET, "")} />
          </li>
        ))}
      </ul>
    );
  }

  if (lines.length > 0 && lines.every((l) => NUMBER.test(l))) {
    return (
      <ol className="mb-5 list-decimal space-y-3 pl-6 text-base leading-[1.8] text-ink marker:font-semibold marker:text-teal">
        {lines.map((l, i) => (
          <li key={i}>
            <InlineText text={l.replace(NUMBER, "")} />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <p className="mb-5 whitespace-pre-line text-base leading-[1.85] text-ink">
      <InlineText text={text} />
    </p>
  );
}
