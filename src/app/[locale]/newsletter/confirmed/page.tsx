import { Link } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "Subscription confirmed — Vairutya" };

export default function NewsletterConfirmedPage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal/10">
        <CheckCircle2 size={40} strokeWidth={1.75} className="text-teal" />
      </div>
      <h1 className="mb-4 font-serif text-3xl font-medium text-ink">
        You&apos;re subscribed
      </h1>
      <p className="mb-8 max-w-[440px] text-base leading-relaxed text-ink-muted">
        Thank you for confirming. Welcome to Vairutya — you&apos;ll hear from us
        soon, and you can unsubscribe at any time from any email.
      </p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
