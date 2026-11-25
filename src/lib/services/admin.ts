import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, Product } from "@/types";
import { productAvailability } from "@/lib/domain/availability";
import { PRODUCT_SELECT, mapCategory, mapProduct } from "./mappers";

/** Leituras do painel usam o cliente com a sessão do administrador (RLS libera rascunhos e categorias inativas). */
export async function getAdminProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false }).limit(2000);
  if (error) throw new Error(`Falha ao carregar produtos: ${error.message}`);
  return (data ?? []).map(mapProduct);
}

export async function getAdminProduct(supabase: SupabaseClient, id: string): Promise<Product | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`Falha ao carregar o produto: ${error.message}`);
  return data ? mapProduct(data) : null;
}

export async function getAdminCategories(supabase: SupabaseClient): Promise<(Category & { productCount: number })[]> {
  const { data, error } = await supabase.from("categories").select("*, products(count)").order("name");
  if (error) throw new Error(`Falha ao carregar categorias: ${error.message}`);
  return (data ?? []).map((r) => ({ ...mapCategory(r), productCount: (r.products as { count: number }[] | null)?.[0]?.count ?? 0 }));
}

export function computeDashboardStats(products: Product[]) {
  const s = { total: products.length, published: 0, drafts: 0, available: 0, soldOut: 0, madeToOrder: 0, demo: 0 };
  for (const p of products) {
    if (p.published) s.published++; else s.drafts++;
    if (p.isDemo) s.demo++;
    const st = productAvailability(p).status;
    if (st === "available") s.available++;
    else if (st === "sold_out") s.soldOut++;
    else s.madeToOrder++;
  }
  return s;
}
