import { getLocale } from "next-intl/server";
import { ShopClient } from "./ShopClient";
import { getAllProducts } from "@/lib/products";

export default async function ShopPage() {
  const products = await getAllProducts(await getLocale());
  return <ShopClient products={products.map((x) => x.product)} />;
}
