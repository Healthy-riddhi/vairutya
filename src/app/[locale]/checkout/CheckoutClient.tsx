"use client";

import { useState } from "react";
import NextImage from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { useQuote } from "@/lib/use-quote";
import { formatMinor } from "@/lib/money";
import { StepLabel } from "@/components/consultation/StepLabel";

type RazorpayInstance = {
  open(): void;
  on(event: string, cb: (r: { error?: { description?: string } }) => void): void;
};
type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayInstance;
declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

function loadRazorpay(failMessage: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(failMessage));
    document.body.appendChild(s);
  });
}

type PaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

export function CheckoutClient({
  user,
  manual,
}: {
  user: { fullName: string; phone: string; email: string };
  manual: boolean;
}) {
  const t = useTranslations("Checkout");
  const country = useLocale() === "fr" ? "FR" : "IN";
  const router = useRouter();
  const { items, totalQty, ready, clearCart } = useCart();
  const { quote, error: quoteError, loading } = useQuote(items);

  const [step, setStep] = useState<1 | 2>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");

  const money = (m: number) => formatMinor(m, quote?.currency ?? (country === "FR" ? "EUR" : "INR"));
  const addressValid =
    name.trim().length >= 2 &&
    /^[+\d][\d\s-]{5,19}$/.test(phone.trim()) &&
    line1.trim().length >= 3 &&
    city.trim().length >= 2 &&
    (country === "FR" || state.trim().length >= 2) &&
    (country === "FR" ? /^\d{5}$/ : /^\d{6}$/).test(postcode.replace(/\s+/g, ""));

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ slug, qty }) => ({ slug, qty })),
          country,
          locale: country === "FR" ? "fr" : "en",
          address: { name, phone, line1, line2, city, state, postcode },
        }),
      });
      const j = await res.json().catch(() => null);
      if (res.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      if (j?.code === "payments_fr_off") throw new Error(t("frSoon"));
      if (!res.ok) throw new Error(j?.error ?? t("errGeneric"));

      if (j.mode === "upi") {
        clearCart();
        router.push(`/checkout/pay?order=${encodeURIComponent(j.orderNumber)}`);
        return;
      }

      await loadRazorpay(t("errLoad"));
      const Razorpay = window.Razorpay!;
      const rzp = new Razorpay({
        key: j.keyId,
        amount: j.amountMinor,
        currency: j.currency,
        order_id: j.razorpayOrderId,
        name: "Vairutya",
        description: j.orderNumber,
        prefill: j.prefill,
        theme: { color: "#003b43" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (r: PaymentResponse) => {
          try {
            const v = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(r),
            });
            const vj = await v.json().catch(() => null);
            if (!v.ok) throw new Error("verify failed");
            clearCart();
            router.push(`/checkout/success?order=${encodeURIComponent(vj.orderNumber)}`);
          } catch {
            setError(t("errConfirm", { order: j.orderNumber }));
            setBusy(false);
          }
        },
      });
      rzp.on("payment.failed", (r) => {
        setError(r.error?.description ?? t("errFailed"));
      });
      rzp.open();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (!ready) return <div className="mx-auto max-w-[860px] px-6 py-24" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[560px] px-6 py-24 text-center">
        <ShoppingCart size={56} strokeWidth={1.5} className="mx-auto mb-4 text-line" />
        <p className="mb-2 font-serif text-2xl font-medium text-ink">{t("emptyTitle")}</p>
        <Link href="/shop" className="btn-primary mt-6 !rounded-full">{t("browse")}</Link>
      </div>
    );
  }

  const label = "mb-1.5 block text-[13px] font-semibold text-ink";

  return (
    <div className="mx-auto max-w-[860px] px-6 py-10 pb-24">
      <h1 className="mb-9 font-serif text-3xl font-medium text-ink sm:text-4xl">{t("title")}</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <StepLabel number={1} label={country === "FR" ? t("step1Fr") : t("step1")} />
          {step === 1 ? (
            <div className="mb-10 flex flex-col gap-3.5">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className={label}>{t("fullName")}</label>
                  <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("fullNamePh")} />
                </div>
                <div>
                  <label className={label}>{t("phone")}</label>
                  <input className="field" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={country === "FR" ? "+33 6 00 00 00 00" : "+91 00000 00000"} />
                </div>
              </div>
              <div>
                <label className={label}>{t("address")}</label>
                <input className="field" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder={t("addressPh")} />
              </div>
              <div>
                <label className={label}>{t("line2")}</label>
                <input className="field" value={line2} onChange={(e) => setLine2(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div>
                  <label className={label}>{t("city")}</label>
                  <input className="field" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                {country === "IN" && (
                  <div>
                    <label className={label}>{t("state")}</label>
                    <input className="field" value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                )}
                <div>
                  <label className={label}>{country === "FR" ? t("postcodeFr") : t("pin")}</label>
                  <input className="field" inputMode="numeric" maxLength={country === "FR" ? 5 : 6} value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder={country === "FR" ? "75001" : "380001"} />
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!addressValid}
                  onClick={() => setStep(2)}
                  className={`rounded-sm px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors ${
                    addressValid ? "cursor-pointer bg-teal" : "cursor-not-allowed bg-line"
                  }`}
                >
                  {t("continue")}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setStep(1)} className="mb-10 -mt-2 block text-left text-sm text-ink-muted underline">
              {name} · {line1}, {city} {postcode} {t("edit")}
            </button>
          )}

          <StepLabel number={2} label={t("step2")} />
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ink-muted">{manual ? t("payInfoUpi") : t("payInfo")}</p>
              {(error || quoteError) && (
                <p className="rounded-xl border border-line/30 bg-white p-4 text-sm text-ink">{error ?? quoteError}</p>
              )}
              <button
                type="button"
                onClick={pay}
                disabled={busy || !quote}
                className="btn-primary w-full !rounded-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? t("opening")
                  : quote
                    ? t(manual ? "continuePay" : "pay", { amount: money(quote.totalMinor) })
                    : t("checking")}
              </button>
              <p className="text-xs text-ink-muted">
                {t.rich("agree", {
                  terms: (c) => <Link href="/terms" className="underline">{c}</Link>,
                  shipping: (c) => <Link href="/shipping" className="underline">{c}</Link>,
                  refund: (c) => <Link href="/refund-policy" className="underline">{c}</Link>,
                })}
              </p>
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-line/20 bg-white p-6">
          <h3 className="mb-4 font-display text-[15px] font-bold text-ink">{t("summary", { count: totalQty })}</h3>
          <div className="mb-4 flex flex-col gap-3.5">
            {items.map((item) => {
              const line = quote?.lines.find((l) => l.slug === item.slug);
              return (
                <div key={item.slug} className="flex items-center gap-3.5">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[8px] bg-stone">
                    <NextImage src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-ink-muted">{t("qty", { n: item.qty })}</p>
                  </div>
                  <span className="text-sm font-semibold text-ink">{line ? money(line.lineMinor) : "…"}</span>
                </div>
              );
            })}
          </div>
          {quote ? (
            <div className="flex flex-col gap-2 border-t border-line/20 pt-4 text-sm">
              <div className="flex justify-between text-ink-muted"><span>{t("subtotal")}</span><span>{money(quote.subtotalMinor)}</span></div>
              <div className="flex justify-between text-ink-muted"><span>{t("shipping")}</span><span>{quote.shippingMinor === 0 ? t("free") : money(quote.shippingMinor)}</span></div>
              <div className="mt-1 flex justify-between border-t border-line/20 pt-2.5">
                <span className="font-display text-base font-bold text-ink">{t("total")}</span>
                <span className="font-display text-lg font-bold text-teal">{money(quote.totalMinor)}</span>
              </div>
              {quote.taxIncludedMinor ? <p className="text-right text-xs text-ink-muted">{t("gst", { amount: money(quote.taxIncludedMinor) })}</p> : null}
            </div>
          ) : (
            <p className="border-t border-line/20 pt-4 text-sm text-ink-muted">{loading ? t("checking") : quoteError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
