import { AccountClient } from "./AccountClient";
import { requireUser } from "@/lib/session";

export const metadata = { title: "My account — Vairutya" };
export const dynamic = "force-dynamic"; // always check who is signed in

export default async function AccountPage() {
  // Visitors who aren't signed in are sent to /login, then back here.
  const user = await requireUser("/account");
  return <AccountClient user={user} />;
}
