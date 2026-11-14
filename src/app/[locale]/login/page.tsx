import { LoginForm } from "./LoginForm";
import { safeNext } from "@/lib/safe-next";

export const metadata = { title: "Sign in — Vairutya" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; confirmed?: string }>;
}) {
  const { next, confirmed } = await searchParams;
  return <LoginForm next={safeNext(next)} justConfirmed={confirmed === "1"} />;
}
