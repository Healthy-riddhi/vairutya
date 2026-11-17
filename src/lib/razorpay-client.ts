/** Browser helpers for Razorpay's payment window (shared by the consultation booking). */
export type RazorpayInstance = {
  open(): void;
  on(event: string, cb: (r: { error?: { description?: string } }) => void): void;
};
export type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayInstance;
export type PaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

export function loadRazorpay(failMessage: string): Promise<RazorpayCtor> {
  const get = () => (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;
  return new Promise((resolve, reject) => {
    const ready = get();
    if (ready) return resolve(ready);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => {
      const c = get();
      return c ? resolve(c) : reject(new Error(failMessage));
    };
    s.onerror = () => reject(new Error(failMessage));
    document.body.appendChild(s);
  });
}
