import type { AvailabilityStatus, Product, ProductVariant } from "@/types";

export const SALE_TYPE_LABEL = {
  pronta_entrega: "Pronta entrega",
  sob_encomenda: "Sob encomenda",
} as const;

export const AVAILABILITY_LABEL: Record<AvailabilityStatus, string> = {
  available: "Disponível",
  sold_out: "Esgotado",
  made_to_order: "Sob encomenda",
};

/** Variações visíveis ao público (inativas ficam ocultas). */
export function activeVariants(product: Pick<Product, "variants">): ProductVariant[] {
  return product.variants.filter((v) => v.active);
}

function productLevelAvailable(p: Pick<Product, "stockControlType" | "stockQuantity" | "simpleAvailability">): boolean {
  if (p.stockControlType === "quantity") return (p.stockQuantity ?? 0) > 0;
  if (p.stockControlType === "simple") return p.simpleAvailability === true;
  return true;
}

/** Disponibilidade de uma variação específica. */
export function variantAvailability(product: Product, v: ProductVariant): AvailabilityStatus {
  if (product.saleType === "sob_encomenda") return "made_to_order";
  if (v.stockControlType === "quantity") return (v.stockQuantity ?? 0) > 0 ? "available" : "sold_out";
  if (v.stockControlType === "simple") return v.simpleAvailability === true ? "available" : "sold_out";
  // Variação sem estoque próprio herda a disponibilidade do produto.
  return productLevelAvailable(product) ? "available" : "sold_out";
}

/**
 * Regra central de disponibilidade.
 * - Sob encomenda nunca é apresentado como pronta entrega.
 * - Controle por variação: o estoque do produto principal é ignorado.
 */
export function productAvailability(product: Product): { status: AvailabilityStatus; quantity: number | null } {
  if (product.saleType === "sob_encomenda") return { status: "made_to_order", quantity: null };

  if (product.stockControlType === "variant") {
    const variants = activeVariants(product);
    const any = variants.some((v) => variantAvailability(product, v) === "available");
    return { status: any ? "available" : "sold_out", quantity: null };
  }
  if (product.stockControlType === "quantity") {
    const q = product.stockQuantity ?? 0;
    return { status: q > 0 ? "available" : "sold_out", quantity: q };
  }
  return { status: product.simpleAvailability === true ? "available" : "sold_out", quantity: null };
}

export function variantGroups(variants: ProductVariant[]): { name: string; options: ProductVariant[] }[] {
  const map = new Map<string, ProductVariant[]>();
  for (const v of variants) map.set(v.name, [...(map.get(v.name) ?? []), v]);
  return [...map.entries()].map(([name, options]) => ({ name, options }));
}

export function primaryImage(product: Pick<Product, "images">) {
  return [...product.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder)[0] ?? null;
}
