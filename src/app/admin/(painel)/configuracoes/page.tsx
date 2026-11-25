import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdminPage } from "@/lib/auth";
import { mapSettings } from "@/lib/services/mappers";
import { DEFAULT_SETTINGS } from "@/lib/demo/data";

export const metadata: Metadata = { title: "Configurações da loja" };

export default async function SettingsPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
  const settings = data ? mapSettings(data) : DEFAULT_SETTINGS;
  return (
    <>
      <PageHeader title="Configurações da loja" description="Textos e contatos exibidos no site. As alterações valem imediatamente, sem mexer no código." />
      <SettingsForm settings={settings} />
    </>
  );
}
