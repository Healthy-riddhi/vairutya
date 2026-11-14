import { strapiGet } from "@/lib/strapi";

/** Contact, company and payment details, edited in Strapi under Business Details. */
export type BusinessDetails = {
  email: string;
  phone: string;
  studio: string;
  legalName: string;
  registeredAddress: string;
  gstin: string;
  upiId: string;
  upiPayeeName: string;
  paymentNote: string;
};

const DEFAULTS: BusinessDetails = {
  email: "hello@vairutya.com",
  phone: "+91 00000 00000",
  studio: "Ahmedabad, Gujarat, India",
  legalName: "",
  registeredAddress: "",
  gstin: "",
  upiId: "",
  upiPayeeName: "Vairutya",
  paymentNote: "",
};

export async function getBusinessDetails(): Promise<BusinessDetails> {
  try {
    const { data } = await strapiGet<{ data: Partial<Record<keyof BusinessDetails, unknown>> | null }>("business-detail", "", 15);
    const out = { ...DEFAULTS };
    for (const k of Object.keys(DEFAULTS) as (keyof BusinessDetails)[]) {
      const v = data?.[k];
      if (typeof v === "string" && v.trim()) out[k] = v.trim();
    }
    return out;
  } catch (err) {
    console.error("[business] using defaults:", (err as Error).message);
    return DEFAULTS;
  }
}
