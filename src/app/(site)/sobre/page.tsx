import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { splitBiography } from "@/lib/domain/biography";
import { getActiveCategories, getStoreSettings } from "@/lib/services/public";

export const revalidate = 60;
export const metadata: Metadata = { title: "Sobre", description: "Conheça a Pilaris: moda executiva e cristã com elegância e propósito.", alternates: { canonical: "/sobre" } };

export default async function AboutPage() {
  const [settings, categories] = await Promise.all([getStoreSettings(), getActiveCategories()]);
  const { title, body, signature } = splitBiography(settings);
  return (
    <div className="container-page grid gap-12 py-14 md:py-20 lg:grid-cols-[1fr_auto] lg:gap-20">
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-6xl">Sobre a {settings.storeName}</h1>
        <p className="mt-6 font-serif text-2xl text-navy">{title}</p>
        <div className="mt-5 space-y-4 text-[1.05rem] leading-relaxed">{body.map((p, i) => <p key={i}>{p}</p>)}</div>
        {signature && <p className="mt-5 font-serif text-lg italic text-navy">{signature}</p>}
        {categories.length > 0 && (
          <section className="mt-10" aria-labelledby="categorias">
            <h2 id="categorias" className="text-2xl">O que você encontra</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.id}><Link href={`/catalogo?categoria=${c.slug}`} className="inline-flex min-h-[44px] items-center border border-stone/60 px-4 hover:border-navy hover:text-navy">{c.name}</Link></li>
              ))}
            </ul>
          </section>
        )}
        <Link href="/contato" className="btn-primary mt-10">Fale com a loja</Link>
      </div>
      <div className="hidden lg:block">
        <Image src="/brand/logo-pilaris.png" alt={`${settings.storeName} — ${settings.slogan}`} width={900} height={775} className="h-72 w-auto" />
      </div>
    </div>
  );
}
