import { NextResponse } from "next/server";
import { bookingConfirmation, bookingNotification, contactNotification, recipeEmail } from "@/lib/email-templates";
import { customerConfirmation, ownerNotification } from "@/lib/order-emails";
import type { Mail } from "@/lib/brevo";
import type { StoredOrder } from "@/lib/orders";

/** Development only: /api/dev/email-preview?type=order-customer */
const order: StoredOrder = {
  orderNumber: "VR-00042",
  status: "paid",
  country: "IN",
  currency: "INR",
  items: [{ slug: "silver-tongue-scraper", name: "The Silver Tongue Scraper", qty: 1, unitMinor: 650000, lineMinor: 650000 }],
  subtotalMinor: 650000,
  shippingMinor: 0,
  taxIncludedMinor: 99153,
  totalMinor: 650000,
  shippingAddress: { name: "Asha Patel", line1: "12 Ashram Road", line2: "", city: "Ahmedabad", state: "Gujarat", postcode: "380009", country: "IN", phone: "+91 98765 43210" },
  email: "asha@example.com",
  customerName: "Asha Patel",
  razorpayOrderId: "order_test",
  paymentMethod: "razorpay",
  utr: null,
  language: "en",
  paymentMethod: "razorpay",
  utr: null,
  language: "en",
  paymentMethod: "razorpay",
  utr: null,
  language: "en",
  paymentMethod: "razorpay",
  utr: null,
  language: "en",
  paymentMethod: "razorpay",
  utr: null,
  language: "en",
  carrier: null,
  trackingNumber: null,
  createdAt: new Date().toISOString(),
  paidAt: new Date().toISOString(),
};
const booking = { name: "Asha Patel", email: "asha@example.com", phone: "+91 98765 43210", concern: "Hair fall and dryness", date: "2026-12-04", slot: "10:00 AM" };

const makers: Record<string, () => Mail> = {
  "order-customer": () => customerConfirmation(order),
  "order-owner": () => ownerNotification(order),
  "booking-customer": () => bookingConfirmation(booking, { locale: "en", statusUrl: "http://localhost:3000/consultation/confirmed?ref=CR-00001&t=x", when: "Friday, 4 December at 10:00 AM IST" }),
  "booking-customer-fr": () => bookingConfirmation(booking, { locale: "fr", statusUrl: "http://localhost:3000/fr/consultation/confirmed?ref=CR-00001&t=x", when: "vendredi 4 décembre à 10h00 (heure de l’Inde)" }),
  "booking-team": () => bookingNotification("team@example.com", booking),
  contact: () => contactNotification({ to: "team@example.com", name: "Asha Patel", email: "asha@example.com", message: "Hello, do you ship the scraper outside Gujarat?" }),
  recipe: () => recipeEmail({ name: "Asha Patel", email: "asha@example.com", recipeTitle: "Golden Milk", pdfUrl: "https://example.com/golden-milk.pdf" }),
};

export function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const type = new URL(req.url).searchParams.get("type") ?? "";
  const make = makers[type];
  if (!make) {
    const links = Object.keys(makers).map((k) => `<li><a href="?type=${k}">${k}</a></li>`).join("");
    return new NextResponse(`<h3>Email previews</h3><ul>${links}</ul>`, { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  try {
    return new NextResponse(make().html, { headers: { "content-type": "text/html; charset=utf-8" } });
  } catch (e) {
    return new NextResponse(`Could not build this email: ${(e as Error).message}`, { status: 500 });
  }
}
