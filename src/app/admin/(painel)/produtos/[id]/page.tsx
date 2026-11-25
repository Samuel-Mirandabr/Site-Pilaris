import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdminPage } from "@/lib/auth";
import { getAdminCategories, getAdminProduct } from "@/lib/services/admin";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdminPage();
  const [product, categories] = await Promise.all([getAdminProduct(supabase, id), getAdminCategories(supabase)]);
  if (!product) notFound();
  return (
    <>
      <PageHeader title={product.name} description="Edite os dados, fotos e estoque deste produto." />
      <ProductForm key={product.updatedAt} product={product} categories={categories} />
    </>
  );
}
