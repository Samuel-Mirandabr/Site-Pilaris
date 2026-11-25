import type { Metadata } from "next";
import Link from "next/link";
import { ProductImage } from "@/components/ui/ProductImage";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { Pagination } from "@/components/catalog/Pagination";
import { applyCatalogQuery, countActiveFilters, parseCatalogQuery } from "@/lib/domain/catalog";
import { getActiveCategories, getPublishedProducts } from "@/lib/services/public";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Veja todos os produtos da Pilaris: ternos, camisas sociais, sapatos, acessórios, gravatas, véus e bolsas de Bíblia.",
  alternates: { canonical: "/catalogo" },
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseCatalogQuery(await searchParams);
  const [products, categories] = await Promise.all([getPublishedProducts(), getActiveCategories()]);
  const result = applyCatalogQuery(products, query);
  const filtered = countActiveFilters(query) > 0 || query.q !== "";

  return (
    <div className="container-page py-14 md:py-20">
      <h1 className="text-4xl md:text-6xl">Catálogo</h1>
      <p className="mt-2 max-w-xl">Consulte preços, características e disponibilidade. A compra ou encomenda é combinada pelo WhatsApp.</p>

      {categories.some((category) => category.imageUrl) && (
        <section className="mt-8" aria-label="Categorias com foto">
          <ul className="flex gap-4 overflow-x-auto pb-2">
            {categories.filter((category) => category.imageUrl).map((category) => (
              <li key={category.id} className="shrink-0">
                <Link href={"/catalogo?categoria=" + category.slug} className="flex min-w-20 flex-col items-center gap-2 text-center text-sm text-ink hover:text-navy">
                  <span className="relative block h-16 w-16 overflow-hidden rounded-full bg-[#F1F3F5]">
                    <ProductImage src={category.imageUrl} alt="" sizes="64px" className="object-cover" />
                  </span>
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mt-8"><CatalogFilters categories={categories} query={query} total={result.total} /></div>

      <div className="mt-8">
        {products.length === 0 ? (
          <div className="border border-stone/40 px-6 py-16 text-center">
            <p className="font-serif text-2xl text-navy">O catálogo está sendo preparado</p>
            <p className="mt-2">Ainda não há produtos publicados.</p>
          </div>
        ) : result.total === 0 ? (
          <div className="border border-stone/40 px-6 py-16 text-center" role="status">
            <p className="font-serif text-2xl text-navy">Nenhum produto encontrado</p>
            <p className="mt-2">{filtered ? "Tente outro nome ou remova alguns filtros." : "Tente novamente mais tarde."}</p>
            {filtered && <Link href="/catalogo" className="btn-outline mt-6">Limpar busca e filtros</Link>}
          </div>
        ) : (
          <>
            <ProductGrid products={result.items} />
            <Pagination query={query} page={result.page} totalPages={result.totalPages} />
          </>
        )}
      </div>
    </div>
  );
}
