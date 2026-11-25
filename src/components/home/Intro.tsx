"use client";

import Link from "next/link";
import type { StoreSettings } from "@/types";
import { Entrance } from "@/components/motion/Entrance";
import { ProductImage } from "@/components/ui/ProductImage";
import { primaryImage } from "@/lib/domain/availability";
import type { Product } from "@/types";
import { useEffect, useState } from "react";
import { splitBiography } from "@/lib/domain/biography";

export function Intro({ settings, featuredProduct, products = [] }: { settings: StoreSettings; featuredProduct?: Product; products?: Product[] }) {
  const { title, body, signature } = splitBiography(settings);
  const rotatingProducts = products.filter((product) => primaryImage(product));
  const slides = rotatingProducts.length ? rotatingProducts : featuredProduct ? [featuredProduct] : [];
  const [slideIndex, setSlideIndex] = useState(0);
  const activeProduct = slides[slideIndex] ?? featuredProduct;
  const heroImage = activeProduct ? primaryImage(activeProduct) : null;

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setSlideIndex((current) => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  return (
    <Entrance className="hero-motion">
    <section aria-labelledby="titulo-apresentacao" className="hero-section relative isolate overflow-hidden bg-navy text-white">
      <div aria-hidden="true" className="hero-background" />
      <div aria-hidden="true" className="hero-atmosphere"><span /><span /><span /></div>
      <div className="container-page relative grid min-h-[500px] items-center gap-10 py-12 md:min-h-[560px] md:grid-cols-[1.05fr_.85fr] md:py-16">
        <div className="hero-copy max-w-[690px]">
          <p className="hero-eyebrow mb-5 text-xs font-medium uppercase tracking-[.24em] text-white/70">Moda executiva · Fé · Propósito</p>
          <div className="hero-title-mask"><h1 id="titulo-apresentacao" className="hero-title text-4xl font-normal leading-[1.08] text-white md:text-6xl">{title}</h1></div>
          <span aria-hidden className="section-rule mt-5 !mb-0" />
          <div className="mt-5 max-w-[58ch] space-y-3 text-[1.0625rem] leading-[1.65] text-white/90">{body.map((p, i) => <p key={i}>{p}</p>)}</div>
          <p className="mt-4 font-serif text-lg italic text-white/90">{signature || settings.storeName + " — " + settings.slogan.replace(/\.$/, "") + "."}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={activeProduct ? "/produto/" + activeProduct.slug : "/catalogo"} className="btn hero-cta border border-white/85 bg-white text-navy hover:bg-white/90">{activeProduct ? "Conheça a peça" : "Ver o catálogo"}</Link>
            {activeProduct && <Link href="/catalogo" className="hero-secondary-link text-sm text-white/85 underline decoration-white/40 underline-offset-4 hover:text-white">Explorar coleção</Link>}
          </div>
        </div>
        {activeProduct && heroImage ? (
          <Link href={"/produto/" + activeProduct.slug} className="hero-feature group relative mx-auto block w-full max-w-[390px] focus-visible:outline-offset-8 md:mr-0 md:ml-auto" aria-label={"Conheça " + activeProduct.name}>
            <div className="hero-photo-frame relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border border-white/35 bg-white/10 p-3 shadow-2xl shadow-[#0C1C32]/20">
              <div className="relative h-full w-full overflow-hidden rounded-[.85rem] bg-[#F5F4F0]">
                <ProductImage src={heroImage.imageUrl} alt={heroImage.altText || activeProduct.name} key={activeProduct.id} sizes="(min-width:768px) 38vw, 82vw" priority className="object-contain p-[7%] mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.045]" />
                <div className="hero-photo-caption absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-5 pb-5 pt-14 text-navy">
                  <span><span className="block text-[.62rem] uppercase tracking-[.2em] text-ink/70">Em destaque</span><strong className="mt-1 block font-serif text-lg font-normal leading-tight">{activeProduct.name}</strong></span>
                  <span aria-hidden="true" className="hero-photo-arrow mb-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-navy/20 bg-white/75 text-lg">↗</span>
                </div>
              </div>
            </div>
            <span aria-hidden="true" className="hero-photo-orbit" />
          </Link>
        ) : (
          <div className="hero-art mx-auto hidden w-full max-w-[390px] md:block"><svg aria-hidden="true" viewBox="0 0 340 400" fill="none" className="h-auto w-full"><path d="M37 330c64-21 78-114 124-181 41-60 91-80 145-91" stroke="currentColor" strokeOpacity=".28" strokeWidth="1.2"/><path d="M45 364c75-41 87-114 133-187 39-62 83-85 125-102" stroke="currentColor" strokeOpacity=".16" strokeWidth="1.2"/><path d="M120 350c0-73 12-162 47-260M172 356c-8-79 4-161 39-250M223 354c-16-77-7-154 26-230" stroke="currentColor" strokeOpacity=".18" strokeWidth="1.2"/><circle cx="262" cy="98" r="71" stroke="currentColor" strokeOpacity=".16"/><circle cx="262" cy="98" r="48" stroke="currentColor" strokeOpacity=".12"/></svg></div>
        )}
      </div>
      <div aria-hidden="true" className="hero-bottom-line" />
    </section>
    </Entrance>
  );
}

