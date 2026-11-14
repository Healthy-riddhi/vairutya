export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16 pb-24">
      <h1 className="mb-2 font-serif text-4xl font-medium text-ink">
        Cookie Settings
      </h1>
      <p className="mb-10 text-sm text-ink-muted">Last updated: September 2026</p>

      <div className="flex flex-col gap-8 text-[15px] leading-[1.85] text-ink">
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            What Are Cookies
          </h2>
          <p>
            Cookies are small text files stored on your device that help us
            remember your preferences and understand how you use our site.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            Essential Cookies
          </h2>
          <p>
            These are required for core functionality — like keeping items in
            your cart and remembering your language preference — and cannot
            be disabled.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            Analytics Cookies
          </h2>
          <p>
            We use analytics cookies to understand how visitors interact with
            our site, helping us improve content and product recommendations.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            Managing Cookies
          </h2>
          <p>
            You can control or delete cookies through your browser settings
            at any time. Disabling essential cookies may affect site
            functionality.
          </p>
        </section>
      </div>
    </div>
  );
}
