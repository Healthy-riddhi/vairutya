import { Link } from "@/i18n/navigation";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-serif text-xl font-medium tracking-[0.28em] text-clay select-none ${className}`}
      aria-label="Vairutya home"
    >
      VAIRUTYA
    </Link>
  );
}
