export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignClass}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-2 font-display text-3xl text-teal sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-ink-muted leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
