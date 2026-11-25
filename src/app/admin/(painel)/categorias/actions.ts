"use server";
import { revalidateAll, mapDbError, publicUrlFor, removeFromStorage, withAdmin } from "@/lib/admin/action";
import { categoryInputSchema } from "@/lib/validation/category";
import { issuesToFieldErrors, uuidSchema } from "@/lib/validation/common";
import type { ActionResult } from "@/types";

export async function saveCategory(raw: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin<{ id: string }>(async ({ supabase }) => {
    const parsed = categoryInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: issuesToFieldErrors(parsed.error) };
    const d = parsed.data;

    let oldPath: string | null = null;
    if (d.id) {
      const { data: current } = await supabase.from("categories").select("image_path").eq("id", d.id).maybeSingle();
      oldPath = (current?.image_path as string | null) ?? null;
    }
    const row: Record<string, unknown> = { name: d.name, slug: d.slug, description: d.description, active: d.active };
    let removeOld = false;
    if (d.imageStoragePath) { row.image_path = d.imageStoragePath; row.image_url = publicUrlFor(supabase, d.imageStoragePath); removeOld = true; }
    else if (!d.keepImage) { row.image_path = null; row.image_url = null; removeOld = true; }

    const q = d.id ? supabase.from("categories").update(row).eq("id", d.id).select("id").single() : supabase.from("categories").insert(row).select("id").single();
    const { data, error } = await q;
    if (error) return mapDbError(error, "categoria");
    if (removeOld) await removeFromStorage(supabase, [oldPath]);
    revalidateAll();
    return { ok: true, message: d.id ? "Categoria atualizada." : "Categoria criada.", data: { id: data.id as string } };
  });
}

export async function setCategoryActive(id: string, active: boolean): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    if (!uuidSchema.safeParse(id).success) return { ok: false, error: "Categoria inválida." };
    const { error } = await supabase.from("categories").update({ active }).eq("id", id);
    if (error) return mapDbError(error, "categoria");
    revalidateAll();
    return { ok: true, message: active ? "Categoria ativada." : "Categoria desativada." };
  });
}

/** Categoria em uso não é apagada: o painel orienta a mover os produtos ou desativá-la. */
export async function deleteCategory(id: string): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    if (!uuidSchema.safeParse(id).success) return { ok: false, error: "Categoria inválida." };
    const { count, error: countError } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (countError) return mapDbError(countError, "categoria");
    if (count && count > 0) {
      return { ok: false, error: `Esta categoria tem ${count} ${count === 1 ? "produto" : "produtos"}. Mova-${count === 1 ? "o" : "os"} para outra categoria ou desative a categoria em vez de excluir.` };
    }
    const { data: current } = await supabase.from("categories").select("image_path").eq("id", id).maybeSingle();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return mapDbError(error, "categoria");
    await removeFromStorage(supabase, [current?.image_path as string | null]);
    revalidateAll();
    return { ok: true, message: "Categoria excluída." };
  });
}
