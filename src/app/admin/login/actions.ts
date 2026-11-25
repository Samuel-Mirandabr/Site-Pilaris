"use server";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/settings";

export interface LoginState { error?: string }

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) return { error: "O Supabase ainda não foi configurado. Veja as instruções nesta página." };
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    // Mensagem genérica: não revela se o e-mail existe.
    return { error: "E-mail ou senha incorretos." };
  }
  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    return { error: "Esta conta não tem permissão para acessar o painel." };
  }
  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
