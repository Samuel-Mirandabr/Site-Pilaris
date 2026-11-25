/** Variáveis públicas do Supabase. Somente a chave pública (anon/publishable) é usada. */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) return false;
  try {
    return new URL(url).protocol.startsWith("http");
  } catch {
    return false;
  }
}

export const PRODUCT_BUCKET = "product-images";
