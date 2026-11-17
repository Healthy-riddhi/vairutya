import { UnsubscribeClient } from "./UnsubscribeClient";

export const metadata = { title: "Unsubscribe | Vairutya", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ t?: string | string[] }> }) {
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : "";
  return (
    <div className="mx-auto max-w-[520px] px-6 py-20 text-center">
      <UnsubscribeClient token={token} />
    </div>
  );
}
