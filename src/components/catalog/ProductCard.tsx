import Link from "next/link";
import type { Product } from "@/types";
import { primaryImage, productAvailability } from "@/lib/domain/availability";
import { formatBRL } from "@/lib/domain/format";
import { ProductImage } from "@/components/ui/ProductImage";
import { DemoTag, SaleTypeBadge, StatusText } from "@/components/ui/Badge";
import { Entrance } from "@/components/motion/Entrance";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const img = primaryImage(product);
  const { status } = productAvailability(product);
  const soldOut = status === "sold_out";
  const secondImage = [...product.images]
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder)
    .find((image) => image.imageUrl !== img?.imageUrl);
  return (
    <article className="group relative">
      <Link href={"/produto/" + product.slug} className="block focus-visible:outline-offset-4">
        <div className="product-image-frame relative aspect-[4/5] overflow-hidden bg-[#F1F3F5]">
          <ProductImage src={img?.imageUrl} alt={img?.altText || product.name} priority={priority}
            sizes="(min-width:1440px) 300px, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className={"product-image object-contain p-[8%] mix-blend-multiply transition-[opacity,transform] duration-[350ms] group-hover:scale-[1.025] group-focus-visible:scale-[1.025] " + (secondImage ? "opacity-100 group-hover:opacity-0 group-focus-visible:opacity-0 " : "opacity-100 ") + (soldOut ? "opacity-60" : "")} />
          {secondImage && <ProductImage src={secondImage.imageUrl} alt={secondImage.altText || product.name}
            sizes="(min-width:1440px) 300px, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className="product-image product-image-secondary object-contain p-[8%] mix-blend-multiply opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />}
          <SaleTypeBadge saleType={product.saleType} className="absolute left-3 top-3 z-[1]" />
          {soldOut && <span className="absolute inset-x-0 bottom-0 bg-ink py-2 text-center text-sm font-medium text-white">Esgotado</span>}
        </div>
        <div className="mt-4 space-y-1.5">
          <p className="text-sm text-ink/80">{product.category?.name ?? "Sem categoria"}</p>
          <h3 className="product-name font-serif text-xl font-semibold leading-snug text-ink">{product.name}</h3>
          <p className="text-base font-medium text-ink">{formatBRL(product.price)}</p>
          <StatusText status={status} />
        </div>
      </Link>
      {product.isDemo && <div className="mt-2"><DemoTag /></div>}
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  const count = products.length;
  const layout = count === 1 ? "mx-auto max-w-[390px] grid-cols-1"
    : count === 2 ? "mx-auto max-w-[900px] grid-cols-2"
    : count === 3 ? "product-grid-three mx-auto max-w-[1120px] grid-cols-2 md:grid-cols-3"
    : "grid-cols-2 lg:grid-cols-4";
  return (
    <ul className={"product-grid grid " + layout + " gap-x-4 gap-y-10 md:gap-x-6 lg:gap-x-8"}>
      {products.map((p, i) => (
        <li key={p.id}><Entrance className={i < 4 ? "product-card-entrance" : ""} delay={i * 60}><ProductCard product={p} priority={i < 4} /></Entrance></li>
      ))}
    </ul>
  );
}

