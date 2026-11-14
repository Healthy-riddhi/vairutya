import { CheckoutClient } from "./CheckoutClient";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Checkout — Vairutya" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  return (
    <CheckoutClient
      user={{ fullName: user.fullName, phone: user.phone, email: user.email }}
      manual={process.env.PAYMENT_MODE !== "razorpay"}
    />
  );
}
