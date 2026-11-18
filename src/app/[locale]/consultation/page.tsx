import { getLocale } from "next-intl/server";
import { ConsultationClient } from "./ConsultationClient";
import { getConsultationPage } from "@/lib/content";
import { getBookingInfo } from "@/lib/consultation-api";
import { localizePackages } from "@/lib/consultation-packages";

export const dynamic = "force-dynamic"; // open slots change as people book

export default async function ConsultationPage() {
  const locale = await getLocale();

  async function pageCopy() {
    // A French entry if you've published one in Strapi, otherwise the English one
    const fr = locale !== "en" ? await getConsultationPage(locale).catch(() => null) : null;
    return fr ?? (await getConsultationPage("en"));
  }

  const [content, info] = await Promise.all([pageCopy(), getBookingInfo()]);
  // Prices are in rupees on the English site and euros on the French one
  const currency = locale === "fr" ? "EUR" : "INR";
  const packages = localizePackages(info.packages, locale, currency);
  // With no packages set up, the single fee from Consultation Availability applies (0 = free request)
  const feeMinor = locale === "fr" ? info.fees.EUR : info.fees.INR;
  return <ConsultationClient content={content} days={info.days} feeMinor={feeMinor} packages={packages} />;
}
