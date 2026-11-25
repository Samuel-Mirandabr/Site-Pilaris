import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { StockManager } from "@/components/admin/StockManager";
import { requireAdminPage } from "@/lib/auth";
import { getAdminProducts } from "@/lib/services/admin";

export const metadata: Metadata = { title: "Estoque" };

export default async function StockPage({ searchParams }: { searchParams: Promise<{ somente?: string }> }) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const products = await getAdminProducts(supabase);
  return (
    <>
      <PageHeader title="Estoque" description="Atualize a disponibilidade manualmente. Cliques no WhatsApp nunca descontam estoque automaticamente." />
      <StockManager products={products} onlySoldOut={sp.somente === "esgotados"} />
    </>
  );
}
