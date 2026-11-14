import { ShopCard } from "@/components/ui/ShopCard";
import { getLocale } from "next-intl/server";
import { getAllProducts } from "@/lib/products";

export async function PopularProducts() {
  const products = (await getAllProducts(await getLocale())).slice(0, 6);

  return (
    <section className="flex flex-col gap-14 bg-cream py-20">
      <div className="px-5 text-center">
        <h2 className="eyebrow mb-3">Popular Products</h2>
        <p className="text-base text-ink-muted">
          Curated essentials for your daily balance.
        </p>
      </div>
      <div className="hide-scrollbar flex gap-10 overflow-x-auto px-5">
        {products.map(({ product }) => (
          <div key={product.id} className="w-[clamp(240px,28vw,300px)] shrink-0">
            <ShopCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
