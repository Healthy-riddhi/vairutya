import { getTranslations } from "next-intl/server";
import { PolicyPage } from "@/components/ui/PolicyPage";
import { getBusinessDetails } from "@/lib/business";

export async function generateMetadata() {
  const t = await getTranslations("Shipping");
  return { title: `${t("title")} — Vairutya` };
}

export default async function ShippingPage() {
  const t = await getTranslations("Shipping");
  const b = await getBusinessDetails();
  const businessBlock = [b.legalName, b.registeredAddress, b.gstin ? `GSTIN: ${b.gstin}` : ""].filter(Boolean).join("\n") || null;
  return (
    <PolicyPage title={t("title")}>
      <p>{t("intro")}</p>
      <h2>{t("processingTitle")}</h2>
      <p>{t("processing")}</p>
      <h2>{t("deliveryTitle")}</h2>
      <p>{t("delivery")}</p>
      <h2>{t("chargesTitle")}</h2>
      <p>{t("charges")}</p>
      <h2>{t("trackingTitle")}</h2>
      <p>{t("tracking")}</p>
      <h2>{t("issuesTitle")}</h2>
      <p>{t("issues")}</p>
      <h2>{t("businessTitle")}</h2>
      <p className="whitespace-pre-line">{businessBlock ?? t("business")}</p>
    </PolicyPage>
  );
}
