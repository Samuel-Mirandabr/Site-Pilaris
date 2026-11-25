"use server";
import { revalidateAll, mapDbError, publicUrlFor, removeFromStorage, withAdmin } from "@/lib/admin/action";
import { parseProductInput } from "@/lib/validation/product";
import { uuidSchema } from "@/lib/validation/common";
import type { ActionResult } from "@/types";

export async function saveProduct(raw: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin<{ id: string }>(async ({ supabase }) => {
    const parsed = parseProductInput(raw);
    if (!parsed.ok) return { ok: false, error: "Revise os campos destacados.", fieldErrors: parsed.fieldErrors };
    const d = parsed.data;

    const payload = {
      id: d.id ?? null, name: d.name, slug: d.slug, description: d.description ?? "", price: d.price, category_id: d.categoryId,
      sale_type: d.saleType, stock_control_type: d.stockControlType, stock_quantity: d.stockQuantity ?? null,
      simple_availability: d.simpleAvailability ?? null, published: d.published, featured: d.featured,
      variants: d.variants.map((v) => ({
        id: v.id ?? null, name: v.name, value: v.value, stock_control_type: v.stockControlType,
        stock_quantity: v.stockQuantity ?? null, simple_availability: v.simpleAvailability ?? null, active: v.active,
      })),
      // A URL pública é montada no servidor a partir do caminho: nunca aceitamos URL vinda do navegador.
      images: d.images.map((i) => ({
        id: i.id ?? null, storage_path: i.storagePath ?? null, image_url: i.storagePath ? publicUrlFor(supabase, i.storagePath) : null,
        alt_text: i.altText ?? "", is_primary: i.isPrimary,
      })),
    };

    const { data, error } = await supabase.rpc("save_product", { payload });
    if (error) return mapDbError(error, "produto");
    const result = data as { id: string; removed_paths: string[] };
    await removeFromStorage(supabase, result.removed_paths);
    revalidateAll();
    return { ok: true, message: "Produto salvo.", data: { id: result.id } };
  });
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    if (!uuidSchema.safeParse(id).success) return { ok: false, error: "Produto inválido." };
    const { data: imgs } = await supabase.from("product_images").select("storage_path").eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return mapDbError(error, "produto");
    await removeFromStorage(supabase, (imgs ?? []).map((i) => i.storage_path as string | null));
    revalidateAll();
    return { ok: true, message: "Produto excluído." };
  });
}

export async function setProductPublished(id: string, published: boolean): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    if (!uuidSchema.safeParse(id).success) return { ok: false, error: "Produto inválido." };
    if (published) {
      const { count } = await supabase.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", id);
      if (!count) return { ok: false, error: "Adicione ao menos uma foto antes de publicar este produto." };
    }
    const { error } = await supabase.from("products").update({ published }).eq("id", id);
    if (error) return mapDbError(error, "produto");
    revalidateAll();
    return { ok: true, message: published ? "Produto publicado." : "Produto retirado do catálogo." };
  });
}

export async function removeDemoProducts(): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error } = await supabase.from("products").delete().eq("is_demo", true);
    if (error) return mapDbError(error, "produto");
    revalidateAll();
    return { ok: true, message: "Produtos de exemplo removidos." };
  });
}
