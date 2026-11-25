"use server";
import { revalidateAll, mapDbError, withAdmin } from "@/lib/admin/action";
import { issuesToFieldErrors } from "@/lib/validation/common";
import { settingsInputSchema } from "@/lib/validation/settings";
import type { ActionResult } from "@/types";

export async function saveSettings(raw: unknown): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const parsed = settingsInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: issuesToFieldErrors(parsed.error) };
    const d = parsed.data;
    const { error } = await supabase.from("store_settings").upsert({
      id: 1, store_name: d.storeName, slogan: d.slogan, biography: d.biography, whatsapp_number: d.whatsappNumber,
      instagram_url: d.instagramUrl, facebook_url: d.facebookUrl, contact_email: d.contactEmail, contact_info: d.contactInfo,
    });
    if (error) return mapDbError(error, "configurações");
    revalidateAll();
    return { ok: true, message: "Configurações salvas." };
  });
}
