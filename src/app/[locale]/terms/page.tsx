export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16 pb-24">
      <h1 className="mb-2 font-serif text-4xl font-medium text-ink">
        Terms of Service
      </h1>
      <p className="mb-10 text-sm text-ink-muted">Last updated: September 2026</p>

      <div className="flex flex-col gap-8 text-[15px] leading-[1.85] text-ink">
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            Use of Our Services
          </h2>
          <p>
            By using Vairutya, you agree to provide accurate information and
            use our products, quizzes, and consultations for personal,
            non-commercial purposes.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            Health Disclaimer
          </h2>
          <p>
            Content on this site, including quiz results and product
            recommendations, is for informational purposes only and does not
            constitute medical advice. Consult a qualified healthcare
            provider before making changes to your health routine.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            Orders and Payments
          </h2>
          <p>
            All orders are subject to product availability. Prices are listed
            in the currency shown at checkout and may change without notice.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-teal">
            Limitation of Liability
          </h2>
          <p>
            Vairutya is not liable for any indirect, incidental, or
            consequential damages arising from the use of our products or
            services.
          </p>
        </section>
      </div>
    </div>
  );
}
