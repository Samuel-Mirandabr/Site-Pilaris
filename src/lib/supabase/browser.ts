"use client";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Usado apenas no painel, para enviar imagens ao Storage com a sessão do administrador. */
export function getBrowserSupabase() {
  if (!client) {
    const { url, anonKey } = getSupabaseEnv();
    client = createBrowserClient(url, anonKey);
  }
  return client;
}
