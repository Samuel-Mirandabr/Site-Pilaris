import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { FluteMark } from "@/components/ui/FluteMark";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { DemoTag, SaleTypeBadge } from "@/components/ui/Badge";
import { primaryImage, productAvailability } from "@/lib/domain/availability";
import { formatBRL } from "@/lib/domain/format";
import { getProductBySlug, getRelatedProducts, getStoreSettings } from "@/lib/services/public";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 60;
type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado", robots: { index: false } };
  const img = primaryImage(product);
  const description = (product.description ?? `${product.name} na Pilaris.`).replace(/\s+/g, " ").slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: { type: "website", title: `${product.name} | Pilaris`, description, url: `/produto/${product.slug}`, images: img ? [{ url: img.imageUrl, alt: img.altText || product.name }] : undefined },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getStoreSettings()]);
  if (!product) notFound();
  const relatedProducts = product.categoryId ? await getRelatedProducts(product.categoryId, product.id, 4) : [];

  const url = `${getSiteUrl()}/produto/${product.slug}`;
  const { status } = productAvailability(product);
  const images = (product.images.length ? [...product.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder) : []).map((i) => ({ url: i.imageUrl, alt: i.altText || product.name }));
  const schemaAvailability = { available: "https://schema.org/InStock", sold_out: "https://schema.org/OutOfStock", made_to_order: "https://schema.org/PreOrder" }[status];
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description ?? undefined,
    image: images.map((i) => (i.url.startsWith("http") ? i.url : `${getSiteUrl()}${i.url}`)), category: product.category?.name,
    offers: { "@type": "Offer", priceCurrency: "BRL", price: product.price.toFixed(2), availability: schemaAvailability, url },
  };

  return (
    <div className="container-page py-10 md:py-16">
      <nav aria-label="Você está em" className="mb-6 text-sm">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:underline">Início</Link></li><li aria-hidden>/</li>
          <li><Link href="/catalogo" className="hover:underline">Catálogo</Link></li>
          {product.category && (<><li aria-hidden>/</li><li><Link href={`/catalogo?categoria=${product.category.slug}`} className="hover:underline">{product.category.name}</Link></li></>)}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={images} productName={product.name} />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SaleTypeBadge saleType={product.saleType} />
            {product.isDemo && <DemoTag />}
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl">{product.name}</h1>
          {product.category && <p className="mt-2">Categoria: <Link href={`/catalogo?categoria=${product.category.slug}`} className="text-navy underline underline-offset-4">{product.category.name}</Link></p>}
          <p className="mt-5 font-serif text-3xl text-navy">{formatBRL(product.price)}</p>
          {product.description && <p className="mt-5 max-w-prose whitespace-pre-line leading-relaxed">{product.description}</p>}
          <hr className="my-7 border-stone/40" />
          <ProductPurchasePanel product={product} storeName={settings.storeName} whatsappNumber={settings.whatsappNumber} productUrl={url} />
        </div>
      </div>
      {relatedProducts.length > 0 && (
        <section aria-labelledby="titulo-relacionados" className="mt-20 border-t border-stone/30 pt-12 md:mt-24">
          <div className="mb-8 flex items-end justify-between gap-4 border-b border-stone/25 pb-5">
            <h2 id="titulo-relacionados" className="flex items-center gap-3 text-3xl md:text-4xl"><FluteMark className="text-amber" /> Produtos relacionados</h2>
            {product.category && <Link href={`/catalogo?categoria=${product.category.slug}`} className="min-h-[44px] content-center text-navy underline underline-offset-4 hover:text-ink">Ver categoria</Link>}
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}