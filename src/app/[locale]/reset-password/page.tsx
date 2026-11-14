import { ResetForm } from "./ResetForm";

export const metadata = { title: "Choose a new password — Vairutya" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return <ResetForm code={code ?? ""} />;
}
