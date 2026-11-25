import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdminPage } from "@/lib/auth";
import { getAdminCategories } from "@/lib/services/admin";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdminPage();
  const categories = await getAdminCategories(supabase);
  return (
    <>
      <PageHeader title="Categorias" description="Organize o catálogo. Uma categoria com produtos não pode ser excluída; desative-a para ocultá-la do site." />
      <CategoryManager categories={categories} />
    </>
  );
}
