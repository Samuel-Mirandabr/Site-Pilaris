import "server-only";
import { revalidatePath } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/supabase-js";
import { SessionError, requireAdminAction } from "@/lib/auth";
import { PRODUCT_BUCKET } from "@/lib/supabase/config";
import type { ActionResult } from "@/types";

/**
 * Envolve toda Server Action do painel: revalida a sessão E o papel de administrador no servidor
 * (nunca confia no frontend) e padroniza as respostas de erro.
 */
export async function withAdmin<T = undefined>(
  fn: (ctx: { supabase: SupabaseClient; user: User }) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    const ctx = await requireAdminAction();
    return await fn(ctx);
  } catch (e) {
    if (e instanceof SessionError) return { ok: false, code: "session", error: "Sua sessão expirou. Entre novamente para continuar." };
    console.error("[admin-action]", e);
    return { ok: false, error: "Não foi possível concluir a ação. Tente novamente." };
  }
}

/** Atualiza as páginas públicas e do painel após uma alteração. */
export function revalidateAll() {
  revalidatePath("/", "layout");
}

export function publicUrlFor(supabase: SupabaseClient, path: string): string {
  return supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function removeFromStorage(supabase: SupabaseClient, paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => Boolean(p));
  if (list.length === 0) return;
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).remove(list);
  if (error) console.error("[storage-remove]", error.message); // arquivos órfãos não bloqueiam a operação
}

/** Traduz erros do Postgres/PostgREST em mensagens úteis para o proprietário. */
export function mapDbError(error: PostgrestError, ctx: "produto" | "categoria" | "configurações" | "estoque" = "produto"): ActionResult<never> {
  switch (error.code) {
    case "23505":
      return { ok: false, error: "Este endereço (slug) já está em uso.", fieldErrors: { slug: "Já existe um item com este endereço (slug). Escolha outro." } };
    case "23503":
      return { ok: false, error: "A categoria escolhida não existe mais. Atualize a página e tente novamente." };
    case "23514":
      return { ok: false, error: "Algum valor informado não é permitido. Revise os campos." };
    case "42501":
    case "PGRST301":
      return { ok: false, code: "session", error: "Sua sessão expirou ou não tem permissão. Entre novamente." };
    case "P0002":
      return { ok: false, error: "Este item não existe mais. Volte à lista e atualize a página." };
    default:
      console.error(`[db:${ctx}]`, error.code, error.message);
      return { ok: false, error: `Não foi possível salvar (${ctx}). Tente novamente.` };
  }
}
