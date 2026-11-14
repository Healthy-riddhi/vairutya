import { getLocale } from "next-intl/server";
import { ConsultationClient } from "./ConsultationClient";
import { getConsultationPage } from "@/lib/content";
import { getAvailability } from "@/lib/consultation-api";

export const dynamic = "force-dynamic"; // open slots change as people book

export default async function ConsultationPage() {
  const locale = await getLocale();

  async function pageCopy() {
    // A French entry if you've published one in Strapi, otherwise the English one
    const fr = locale !== "en" ? await getConsultationPage(locale).catch(() => null) : null;
    return fr ?? (await getConsultationPage("en"));
  }

  const [content, days] = await Promise.all([pageCopy(), getAvailability()]);
  return <ConsultationClient content={content} days={days} />;
}
