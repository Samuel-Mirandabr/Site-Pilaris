import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./config";

/** Cliente anônimo (sem sessão) para leituras públicas. As políticas RLS limitam o que é visível. */
export function createPublicClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
