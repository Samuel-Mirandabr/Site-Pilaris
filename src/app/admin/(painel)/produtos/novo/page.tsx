import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdminPage } from "@/lib/auth";
import { getAdminCategories } from "@/lib/services/admin";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const { supabase } = await requireAdminPage();
  const categories = await getAdminCategories(supabase);
  return (
    <>
      <PageHeader title="Novo produto" />
      {categories.length === 0 ? <p>Crie ao menos uma categoria antes de cadastrar produtos.</p> : <ProductForm categories={categories} />}
    </>
  );
}
