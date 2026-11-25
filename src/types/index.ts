export type SaleType = "pronta_entrega" | "sob_encomenda";
/** Controle de estoque do produto. "variant" = o estoque fica em cada variação. */
export type StockControlType = "none" | "quantity" | "simple" | "variant";
export type VariantStockControl = "none" | "quantity" | "simple";
export type AvailabilityStatus = "available" | "sold_out" | "made_to_order";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  storagePath: string | null;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // grupo: "Tamanho", "Cor"...
  value: string; // opção: "M", "Azul"...
  stockControlType: VariantStockControl;
  stockQuantity: number | null;
  simpleAvailability: boolean | null;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  categoryId: string;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  saleType: SaleType;
  stockControlType: StockControlType;
  stockQuantity: number | null;
  simpleAvailability: boolean | null;
  published: boolean;
  featured: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  biography: string;
  whatsappNumber: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  contactEmail: string | null;
  contactInfo: string | null;
  updatedAt: string | null;
}

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; code?: "session" };
