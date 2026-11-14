export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16 pb-24">
      <h1 className="mb-2 font-serif text-4xl font-medium text-ink">
        Privacy Policy
      </h1>
      <p className="mb-10 text-sm text-ink-muted">Last updated: September 2026</p>

      <div className="flex flex-col gap-8 text-[15px] leading-[1.85] text-ink">
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us — such as your
            name, email, and quiz responses — when you create an account,
            take a quiz, book a consultation, or subscribe to our newsletter.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            How We Use Your Information
          </h2>
          <p>
            We use your information to personalize your wellness
            recommendations, process orders and bookings, send you relevant
            content, and improve our products and services.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            Data Sharing
          </h2>
          <p>
            We do not sell your personal data. We may share information with
            trusted service providers who help us operate our business, such
            as payment processors and email delivery services, under strict
            confidentiality agreements.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            Your Rights
          </h2>
          <p>
            You may request access to, correction of, or deletion of your
            personal data at any time by contacting us at
            hello@vairutya.com.
          </p>
        </section>
      </div>
    </div>
  );
}
