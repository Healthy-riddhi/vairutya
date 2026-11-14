import { ContactClient } from "./ContactClient";
import { getBusinessDetails } from "@/lib/business";

export default async function ContactPage() {
  return <ContactClient details={await getBusinessDetails()} />;
}
