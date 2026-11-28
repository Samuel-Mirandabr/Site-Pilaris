import type { Metadata } from "next";
import Link from "next/link";
import { Intro } from "@/components/home/Intro";
import { ProductRail } from "@/components/catalog/ProductRail";
import { FluteMark } from "@/components/ui/FluteMark";
import { getPublishedProducts, getStoreSettings } from "@/lib/services/public";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings();
  return { title: { absolute: `${s.storeName} — ${s.slogan.replace(/\.$/, "")}` }, description: `${s.storeName}: moda executiva e cristã. Roupas e acessórios com elegância e propósito.`, alternates: { canonical: "/" } };
}

export default async function HomePage() {
  const [settings, all] = await Promise.all([getStoreSettings(), getPublishedProducts()]);
  // Destaques primeiro; depois os mais recentes.
  const products = [...all].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 8);
  return (
    <>
      <Intro settings={settings} featuredProduct={products[0]} products={products} />
      <section aria-labelledby="titulo-produtos" className="container-page pt-12 md:pt-20">
        <div className="mb-7 flex items-end justify-between gap-4 border-b border-stone/25 pb-4 md:mb-9 md:pb-5">
          <h2 id="titulo-produtos" className="flex items-center gap-3 text-3xl md:text-4xl"><FluteMark className="text-amber" /> Produtos</h2>
          {all.length > 0 && <Link href="/catalogo" className="min-h-[44px] content-center text-navy underline underline-offset-4 hover:text-ink">Ver tudo</Link>}
        </div>
        {products.length > 0 ? (
          <>
            <ProductRail products={products} />
            <div className="product-marquee mt-14" aria-label="Pilaris — elegância com propósito">
              <div className="product-marquee-track"><span>PILARIS</span><i>•</i><span>ELEGÂNCIA COM PROPÓSITO</span><i>•</i><span>SEJA O PILAR</span><i>•</i><span>PILARIS</span><i>•</i><span>ELEGÂNCIA COM PROPÓSITO</span><i>•</i><span>SEJA O PILAR</span><i>•</i></div>
            </div>
            <div className="mt-12 text-center"><Link href="/catalogo" className="btn-outline">Ir para o catálogo</Link></div>
          </>
        ) : (
          <div className="border border-stone/40 px-6 py-16 text-center">
            <p className="font-serif text-2xl text-navy">Novos produtos em breve</p>
            <p className="mt-2">Ainda não há peças publicadas. Volte logo ou fale conosco.</p>
            <Link href="/contato" className="btn-outline mt-6">Falar com a loja</Link>
          </div>
        )}
      </section>
    </>
  );
}
