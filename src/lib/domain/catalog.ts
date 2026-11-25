import type { Product } from "@/types";
import { normalizeText } from "./format";
import { productAvailability } from "./availability";

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor_preco", label: "Menor preço" },
  { value: "maior_preco", label: "Maior preço" },
  { value: "nome", label: "Nome (A–Z)" },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export interface CatalogQuery {
  q: string;
  categoria: string;
  disponibilidade: "" | "disponivel" | "esgotado";
  venda: "" | "pronta_entrega" | "sob_encomenda";
  min: number | null;
  max: number | null;
  ordem: SortKey;
  pagina: number;
}

type Raw = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const num = (v: string) => (v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : null);

/** Lê e valida os parâmetros de URL (nunca confia no valor bruto). */
export function parseCatalogQuery(raw: Raw): CatalogQuery {
  const disp = first(raw.disponibilidade);
  const venda = first(raw.venda);
  const ordem = first(raw.ordem);
  const pagina = Math.floor(Number(first(raw.pagina)));
  return {
    q: first(raw.q).slice(0, 80).trim(),
    categoria: first(raw.categoria).slice(0, 80),
    disponibilidade: disp === "disponivel" || disp === "esgotado" ? disp : "",
    venda: venda === "pronta_entrega" || venda === "sob_encomenda" ? venda : "",
    min: num(first(raw.min)),
    max: num(first(raw.max)),
    ordem: SORT_OPTIONS.some((o) => o.value === ordem) ? (ordem as SortKey) : "recentes",
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina : 1,
  };
}

export function countActiveFilters(q: CatalogQuery): number {
  return [q.categoria, q.disponibilidade, q.venda, q.min !== null ? "x" : "", q.max !== null ? "x" : ""].filter(Boolean).length;
}

export function applyCatalogQuery(products: Product[], q: CatalogQuery) {
  const term = normalizeText(q.q);
  let list = products.filter((p) => {
    if (term && !normalizeText(p.name).includes(term)) return false;
    if (q.categoria && p.category?.slug !== q.categoria) return false;
    if (q.venda && p.saleType !== q.venda) return false;
    if (q.disponibilidade) {
      const s = productAvailability(p).status;
      if (q.disponibilidade === "disponivel" && s !== "available") return false;
      if (q.disponibilidade === "esgotado" && s !== "sold_out") return false;
    }
    if (q.min !== null && p.price < q.min) return false;
    if (q.max !== null && p.price > q.max) return false;
    return true;
  });

  list = [...list].sort((a, b) => {
    switch (q.ordem) {
      case "menor_preco": return a.price - b.price;
      case "maior_preco": return b.price - a.price;
      case "nome": return a.name.localeCompare(b.name, "pt-BR");
      default: return +new Date(b.createdAt) - +new Date(a.createdAt);
    }
  });

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(q.pagina, totalPages);
  return { items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total, page, totalPages };
}

/** Monta a query string preservando apenas parâmetros preenchidos. */
export function catalogHref(q: Partial<CatalogQuery>): string {
  const p = new URLSearchParams();
  if (q.q) p.set("q", q.q);
  if (q.categoria) p.set("categoria", q.categoria);
  if (q.disponibilidade) p.set("disponibilidade", q.disponibilidade);
  if (q.venda) p.set("venda", q.venda);
  if (q.min != null) p.set("min", String(q.min));
  if (q.max != null) p.set("max", String(q.max));
  if (q.ordem && q.ordem !== "recentes") p.set("ordem", q.ordem);
  if (q.pagina && q.pagina > 1) p.set("pagina", String(q.pagina));
  const s = p.toString();
  return s ? `/catalogo?${s}` : "/catalogo";
}
