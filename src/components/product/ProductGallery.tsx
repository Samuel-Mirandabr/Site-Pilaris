"use client";
import { useRef, useState } from "react";
import { ProductImage } from "@/components/ui/ProductImage";

export interface GalleryImage { url: string; alt: string }

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const select = (i: number) => {
    setIndex(i);
    track.current?.children[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };
  const slides = images.length ? images : [{ url: "", alt: productName }];
  return (
    <div>
      <div ref={track} onScroll={(event) => {
        const node = event.currentTarget;
        const next = Math.round(node.scrollLeft / Math.max(1, node.clientWidth));
        setIndex((current) => current === next ? current : Math.min(slides.length - 1, next));
      }} className="product-gallery-track flex snap-x snap-mandatory overflow-x-auto scroll-smooth bg-[#F1F3F5]" aria-label="Galeria de fotos">
        {slides.map((image, i) => (
          <div key={image.url || "none"} className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden">
            <ProductImage src={image.url} alt={image.alt || productName} priority={i === 0}
              sizes="(min-width:1440px) 650px, (min-width:1024px) 50vw, 100vw"
              className="product-gallery-image object-contain p-[8%] mix-blend-multiply transition-transform duration-300 md:hover:scale-[1.02]" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1" aria-label="Miniaturas das fotos">
          {images.map((img, i) => (
            <li key={img.url + i} className="shrink-0 snap-start">
              <button type="button" onClick={() => select(i)} aria-label={"Ver foto " + (i + 1) + " de " + images.length} aria-pressed={i === index}
                className={"relative block h-20 w-16 overflow-hidden border-2 bg-[#F1F3F5] sm:h-24 sm:w-20 " + (i === index ? "border-navy" : "border-transparent hover:border-stone")}>
                <ProductImage src={img.url} alt="" sizes="80px" className="object-contain p-[8%] mix-blend-multiply" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="sr-only" aria-live="polite">{images.length ? "Foto " + (index + 1) + " de " + images.length : "Sem fotos"}</p>
    </div>
  );
}

