"use client";
import Image from "next/image";
import { useState } from "react";
import { FluteMark } from "./FluteMark";

function isOptimizable(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    const configured = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
    return host === configured;
  } catch {
    return false;
  }
}

interface Props {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Imagem com estado de "indisponível" quando não há arquivo ou o carregamento falha. */
export function ProductImage({ src, alt, sizes, priority, className = "object-contain p-[8%] mix-blend-multiply" }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div role="img" aria-label={`Imagem indisponível: ${alt}`} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F1F3F5] text-stone">
        <FluteMark className="h-8 w-8" />
        <span className="text-sm text-ink">Imagem indisponível</span>
      </div>
    );
  }
  if (!isOptimizable(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} loading={priority ? "eager" : "lazy"} onError={() => setFailed(true)} />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} onError={() => setFailed(true)} />;
}
