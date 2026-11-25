import "server-only";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./supabase/config";
import { createServerSupabase } from "./supabase/server";

export class SessionError extends Error {
  constructor() {
    super("Sessão expirada ou sem permissão.");
  }
}

/** A conta do proprietário é marcada com app_metadata.role = "admin" (só editável pelo painel do Supabase/SQL). */
export function isAdminUser(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === "admin";
}

export async function getAdminSession(): Promise<{ supabase: SupabaseClient; user: User } | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser(); // valida o token no servidor do Supabase
  if (error || !isAdminUser(data.user)) return null;
  return { supabase, user: data.user! };
}

/** Para páginas e layouts do painel. */
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?expirada=1");
  return session;
}

/** Para Server Actions: lança SessionError (tratado em withAdmin). */
export async function requireAdminAction() {
  const session = await getAdminSession();
  if (!session) throw new SessionError();
  return session;
}
