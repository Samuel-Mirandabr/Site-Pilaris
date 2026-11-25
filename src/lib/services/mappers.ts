import type { Category, Product, ProductImage, ProductVariant, StoreSettings } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const mapCategory = (r: any): Category => ({
  id: r.id, name: r.name, slug: r.slug, description: r.description ?? null, imageUrl: r.image_url ?? null,
  active: r.active, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapImage = (r: any): ProductImage => ({
  id: r.id, productId: r.product_id, imageUrl: r.image_url, storagePath: r.storage_path ?? null,
  altText: r.alt_text ?? null, isPrimary: r.is_primary, displayOrder: r.display_order,
});

const mapVariant = (r: any): ProductVariant => ({
  id: r.id, productId: r.product_id, name: r.name, value: r.value, stockControlType: r.stock_control_type,
  stockQuantity: r.stock_quantity ?? null, simpleAvailability: r.simple_availability ?? null, active: r.active,
});

export const mapProduct = (r: any): Product => ({
  id: r.id, name: r.name, slug: r.slug, description: r.description ?? null, price: Number(r.price),
  categoryId: r.category_id, category: r.category ? { id: r.category.id, name: r.category.name, slug: r.category.slug } : null,
  saleType: r.sale_type, stockControlType: r.stock_control_type, stockQuantity: r.stock_quantity ?? null,
  simpleAvailability: r.simple_availability ?? null, published: r.published, featured: r.featured, isDemo: Boolean(r.is_demo),
  createdAt: r.created_at, updatedAt: r.updated_at,
  images: (r.images ?? []).map(mapImage).sort((a: ProductImage, b: ProductImage) => a.displayOrder - b.displayOrder),
  variants: (r.variants ?? []).map(mapVariant).sort((a: ProductVariant, b: ProductVariant) => 0 + (a.name === b.name ? 0 : a.name < b.name ? -1 : 1)),
});

export const mapSettings = (r: any): StoreSettings => ({
  storeName: r.store_name, slogan: r.slogan, biography: r.biography, whatsappNumber: r.whatsapp_number ?? null,
  instagramUrl: r.instagram_url ?? null, facebookUrl: r.facebook_url ?? null, contactEmail: r.contact_email ?? null,
  contactInfo: r.contact_info ?? null, updatedAt: r.updated_at ?? null,
});

export const PRODUCT_SELECT = "*, category:categories(id,name,slug), images:product_images(*), variants:product_variants(*)";
