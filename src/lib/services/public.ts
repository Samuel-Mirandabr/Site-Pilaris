import "server-only";
import { cache } from "react";
import type { Category, Product, StoreSettings } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_SETTINGS, DEMO_CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo/data";
import { PRODUCT_SELECT, mapCategory, mapProduct, mapSettings } from "./mappers";

/** True quando não há Supabase: o site exibe dados demonstrativos locais (somente leitura). */
export const isDemoMode = () => !isSupabaseConfigured();

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (isDemoMode()) return DEFAULT_SETTINGS;
  const { data, error } = await createPublicClient().from("store_settings").select("*").limit(1).maybeSingle();
  if (error) console.error("[settings]", error.message);
  return data ? mapSettings(data) : DEFAULT_SETTINGS;
});

export const getActiveCategories = cache(async (): Promise<Category[]> => {
  if (isDemoMode()) return DEMO_CATEGORIES.filter((c) => c.active);
  const { data, error } = await createPublicClient().from("categories").select("*").eq("active", true).order("name");
  if (error) throw new Error(`Falha ao carregar categorias: ${error.message}`);
  return (data ?? []).map(mapCategory);
});

/** Apenas produtos publicados (e de categorias ativas, garantido também pelo RLS). */
export const getPublishedProducts = cache(async (): Promise<Product[]> => {
  if (isDemoMode()) return DEMO_PRODUCTS.filter((p) => p.published);
  const { data, error } = await createPublicClient()
    .from("products").select(PRODUCT_SELECT).eq("published", true).order("created_at", { ascending: false }).limit(1000);
  if (error) throw new Error(`Falha ao carregar produtos: ${error.message}`);
  return (data ?? []).map(mapProduct);
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (isDemoMode()) return DEMO_PRODUCTS.find((p) => p.published && p.slug === slug) ?? null;
  const { data, error } = await createPublicClient()
    .from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("published", true).maybeSingle();
  if (error) throw new Error(`Falha ao carregar o produto: ${error.message}`);
  return data ? mapProduct(data) : null;
});

export const getRelatedProducts = cache(async (categoryId: string, productId: string, limit = 4): Promise<Product[]> => {
  if (isDemoMode()) {
    return DEMO_PRODUCTS.filter((product) => product.published && product.categoryId === categoryId && product.id !== productId).slice(0, limit);
  }
  const { data, error } = await createPublicClient()
    .from("products").select(PRODUCT_SELECT).eq("published", true).eq("category_id", categoryId)
    .neq("id", productId).order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(`Falha ao carregar produtos relacionados: ${error.message}`);
  return (data ?? []).map(mapProduct);
});
export async function getHomeProducts(limit = 8): Promise<Product[]> {
  const all = await getPublishedProducts();
  return all.slice(0, limit);
}
