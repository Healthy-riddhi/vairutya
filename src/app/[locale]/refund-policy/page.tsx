import { getTranslations } from "next-intl/server";
import { PolicyPage } from "@/components/ui/PolicyPage";
import { getBusinessDetails } from "@/lib/business";

export async function generateMetadata() {
  const t = await getTranslations("Refund");
  return { title: `${t("title")} — Vairutya` };
}

export default async function RefundPolicyPage() {
  const t = await getTranslations("Refund");
  const b = await getBusinessDetails();
  const businessBlock = [b.legalName, b.registeredAddress, b.gstin ? `GSTIN: ${b.gstin}` : ""].filter(Boolean).join("\n") || null;
  return (
    <PolicyPage title={t("title")}>
      <h2>{t("cancelTitle")}</h2>
      <p>{t("cancel")}</p>
      <h2>{t("refundTitle")}</h2>
      <p>{t("refund")}</p>
      <h2>{t("returnsTitle")}</h2>
      <p>{t("r1")}</p>
      <p>{t("r2")}</p>
      <p>{t("r3")}</p>
      <p>{t("r4")}</p>
      <p>{t("r5")}</p>
      <h2>{t("contactTitle")}</h2>
      <p>{t("contact")}</p>
      <h2>{t("businessTitle")}</h2>
      <p className="whitespace-pre-line">{businessBlock ?? t("business")}</p>
    </PolicyPage>
  );
}
