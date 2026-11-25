import type { Category, Product, ProductVariant, StoreSettings, VariantStockControl } from "@/types";

/**
 * DADOS DEMONSTRATIVOS — usados somente quando o Supabase não está configurado.
 * Nomes, preços e textos são exemplos para testar a interface. Não são informações comerciais reais.
 * Para removê-los basta configurar o Supabase (este arquivo deixa de ser usado).
 */

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Pilaris",
  slogan: "Seja o Pilar.",
  biography:
    "Elegância com propósito.\n\nA Pilaris reúne moda executiva e cristã em uma seleção de roupas e acessórios pensados para diferentes estilos e ocasiões. Mais do que vestir, acreditamos que cada detalhe pode expressar personalidade, elegância e propósito.\n\nPilaris — Seja o Pilar.",
  // Opcional, só para testar o botão do WhatsApp localmente no modo demonstração (nunca invente um número real).
  whatsappNumber: process.env.DEMO_WHATSAPP_NUMBER || null,
  instagramUrl: null,
  facebookUrl: null,
  contactEmail: null,
  contactInfo: null,
  updatedAt: null,
};

const T = "2026-01-01T00:00:00.000Z";
const catId = (n: number) => `00000000-0000-4000-8000-0000000000c${n}`;
const catNames = ["Ternos", "Camisas sociais", "Sapatos", "Acessórios", "Gravatas", "Véus", "Bolsas de Bíblia"];
const catSlugs = ["ternos", "camisas-sociais", "sapatos", "acessorios", "gravatas", "veus", "bolsas-de-biblia"];

export const DEMO_CATEGORIES: Category[] = catNames.map((name, i) => ({
  id: catId(i + 1), name, slug: catSlugs[i], description: null, imageUrl: null, active: true, createdAt: T, updatedAt: T,
}));

interface Seed {
  name: string; cat: number; price: number; desc: string; sale?: "sob_encomenda";
  stock?: { type: "quantity"; qty: number } | { type: "simple"; ok: boolean } | { type: "variant" };
  variants?: { name: string; values: string[]; stock?: (number | boolean)[] };
  draft?: boolean; featured?: boolean;
}

const seeds: Seed[] = [
  { name: "Terno Clássico Azul-marinho", cat: 1, price: 1290, desc: "Corte reto em lã fria, forro completo e caimento estruturado.", stock: { type: "variant" }, variants: { name: "Tamanho", values: ["46", "48", "50", "52"], stock: [2, 0, 3, 1] }, featured: true },
  { name: "Terno Slim Grafite", cat: 1, price: 1190, desc: "Modelagem ajustada para uso diário no escritório.", stock: { type: "quantity", qty: 4 } },
  { name: "Terno Executivo sob medida", cat: 1, price: 1890, desc: "Confeccionado conforme as suas medidas. Prazo combinado pelo WhatsApp.", sale: "sob_encomenda", variants: { name: "Cor", values: ["Azul-marinho", "Cinza", "Preto"] } },
  { name: "Camisa Social Branca", cat: 2, price: 219, desc: "Algodão egípcio, colarinho firme e punho para abotoaduras.", stock: { type: "quantity", qty: 12 }, variants: { name: "Tamanho", values: ["P", "M", "G", "GG"] }, featured: true },
  { name: "Camisa Social Azul Clara", cat: 2, price: 219, desc: "Tecido leve com acabamento antiamassado.", stock: { type: "simple", ok: true }, variants: { name: "Tamanho", values: ["M", "G"] } },
  { name: "Camisa Social Listrada", cat: 2, price: 239, desc: "Listras finas em azul e branco. Peça atemporal.", stock: { type: "simple", ok: false } },
  { name: "Sapato Oxford Preto", cat: 3, price: 589, desc: "Couro legítimo, solado em couro e costura Goodyear.", stock: { type: "variant" }, variants: { name: "Numeração", values: ["39", "40", "41", "42", "43"], stock: [1, 2, 0, 3, 1] }, featured: true },
  { name: "Sapato Derby Marrom", cat: 3, price: 549, desc: "Versátil para o dia a dia, com palmilha anatômica.", stock: { type: "quantity", qty: 0 } },
  { name: "Cinto de Couro Preto", cat: 4, price: 189, desc: "Fivela discreta em metal escovado.", stock: { type: "quantity", qty: 8 } },
  { name: "Abotoaduras Prata", cat: 4, price: 149, desc: "Par de abotoaduras com acabamento fosco.", stock: { type: "simple", ok: true } },
  { name: "Gravata Azul Real", cat: 5, price: 129, desc: "Seda pura, 7 cm de largura.", stock: { type: "quantity", qty: 15 } },
  { name: "Gravata Listrada Marinho", cat: 5, price: 129, desc: "Seda jacquard com listras diagonais.", stock: { type: "quantity", qty: 3 } },
  { name: "Véu de Renda Branco", cat: 6, price: 169, desc: "Renda delicada com borda trabalhada.", sale: "sob_encomenda", variants: { name: "Cor", values: ["Branco", "Off-white", "Preto"] } },
  { name: "Véu Mantilha Preto", cat: 6, price: 159, desc: "Mantilha tradicional para celebrações.", stock: { type: "simple", ok: true } },
  { name: "Bolsa de Bíblia Marinho", cat: 7, price: 249, desc: "Compartimento acolchoado e alça ajustável.", stock: { type: "quantity", qty: 0 } },
  { name: "Bolsa de Bíblia Bege", cat: 7, price: 259, desc: "Zíper reforçado e bolso interno para canetas.", stock: { type: "quantity", qty: 5 }, variants: { name: "Tamanho", values: ["Médio", "Grande"] } },
  { name: "Gravata em rascunho (não publicada)", cat: 5, price: 99, desc: "Item de teste: não deve aparecer no site público.", stock: { type: "simple", ok: true }, draft: true },
];

const uid = (a: number, b: number) => `00000000-0000-4000-8000-${String(a).padStart(4, "0")}${String(b).padStart(8, "0")}`;

export const DEMO_PRODUCTS: Product[] = seeds.map((s, i) => {
  const n = i + 1;
  const id = uid(1, n);
  const cat = DEMO_CATEGORIES[s.cat - 1];
  const made = s.sale === "sob_encomenda";
  const perVariant = !made && s.stock?.type === "variant";
  const variants: ProductVariant[] = (s.variants?.values ?? []).map((value, k) => {
    const st = s.variants?.stock?.[k];
    const control: VariantStockControl = perVariant ? (typeof st === "number" ? "quantity" : "simple") : "none";
    return {
      id: uid(2, n * 100 + k), productId: id, name: s.variants!.name, value, stockControlType: control,
      stockQuantity: control === "quantity" ? (st as number) : null, simpleAvailability: control === "simple" ? Boolean(st) : null, active: true,
    };
  });
  const image = (k: number) => ({
    id: uid(3, n * 10 + k), productId: id, imageUrl: `/demo/demo-${(i % 10) + 1}-${k}.webp`, storagePath: null,
    altText: `Foto demonstrativa do produto ${s.name}`, isPrimary: k === 1, displayOrder: k,
  });
  return {
    id, name: s.name, slug: s.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    description: `${s.desc}\n\nProduto de exemplo para teste da vitrine.`, price: s.price, categoryId: cat.id,
    category: { id: cat.id, name: cat.name, slug: cat.slug }, saleType: made ? "sob_encomenda" : "pronta_entrega",
    stockControlType: made ? "none" : s.stock?.type ?? "none",
    stockQuantity: !made && s.stock?.type === "quantity" ? s.stock.qty : null,
    simpleAvailability: !made && s.stock?.type === "simple" ? s.stock.ok : null,
    published: !s.draft, featured: Boolean(s.featured), isDemo: true,
    createdAt: new Date(Date.UTC(2026, 5, 30 - i)).toISOString(), updatedAt: T,
    images: [image(1), image(2)], variants,
  };
});
