import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/services/public";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  let products: Awaited<ReturnType<typeof getPublishedProducts>> = [];
  try { products = await getPublishedProducts(); } catch { /* sitemap parcial se o banco estiver indisponível */ }
  return [
    ...["", "/catalogo", "/sobre", "/contato"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${base}/produto/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
