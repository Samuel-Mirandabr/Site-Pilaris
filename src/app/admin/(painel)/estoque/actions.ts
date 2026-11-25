"use server";
import { z } from "zod";
import { revalidateAll, mapDbError, withAdmin } from "@/lib/admin/action";
import { uuidSchema } from "@/lib/validation/common";
import type { ActionResult } from "@/types";

const schema = z.object({
  target: z.enum(["product", "variant"]),
  id: uuidSchema,
  quantity: z.number().int({ message: "Informe um número inteiro." }).min(0, { message: "A quantidade não pode ser negativa." }).max(100000).optional(),
  available: z.boolean().optional(),
});

/** Atualiza SOMENTE o estoque conforme o tipo de controle já definido no cadastro (nunca desconta sozinho). */
export async function updateStock(raw: unknown): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
    const { target, id, quantity, available } = parsed.data;
    const table = target === "product" ? "products" : "product_variants";

    const { data: row, error: readError } = await supabase.from(table).select("stock_control_type").eq("id", id).maybeSingle();
    if (readError) return mapDbError(readError, "estoque");
    if (!row) return { ok: false, error: "Item não encontrado. Atualize a página." };

    let patch: Record<string, unknown>;
    if (row.stock_control_type === "quantity") {
      if (quantity === undefined) return { ok: false, error: "Informe a quantidade." };
      patch = { stock_quantity: quantity };
    } else if (row.stock_control_type === "simple") {
      if (available === undefined) return { ok: false, error: "Informe se está disponível." };
      patch = { simple_availability: available };
    } else {
      return { ok: false, error: "Este item não possui controle de estoque neste nível." };
    }
    const { error } = await supabase.from(table).update(patch).eq("id", id);
    if (error) return mapDbError(error, "estoque");
    revalidateAll();
    return { ok: true, message: "Estoque atualizado." };
  });
}
