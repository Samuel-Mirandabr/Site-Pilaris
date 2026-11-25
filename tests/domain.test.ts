import { test } from "node:test";
import assert from "node:assert/strict";
import { productAvailability, variantAvailability } from "../src/lib/domain/availability";
import { applyCatalogQuery, parseCatalogQuery, PAGE_SIZE } from "../src/lib/domain/catalog";
import { buildProductMessage, buildWhatsappUrl, normalizeWhatsappNumber } from "../src/lib/domain/whatsapp";
import { parsePriceInput, slugify, formatBRL } from "../src/lib/domain/format";
import { parseProductInput } from "../src/lib/validation/product";
import { settingsInputSchema } from "../src/lib/validation/settings";
import { DEMO_PRODUCTS } from "../src/lib/demo/data";
import type { Product } from "../src/types";

const base = DEMO_PRODUCTS.find((p) => p.stockControlType === "quantity" && p.saleType === "pronta_entrega")!;
const mk = (o: Partial<Product>): Product => ({ ...base, ...o });
const CAT = "00000000-0000-4000-8000-0000000000c1";
const input = (o: Record<string, unknown> = {}) => ({
  name: "Camisa Teste", slug: "camisa-teste", description: "x", price: 100, categoryId: CAT, saleType: "pronta_entrega",
  stockControlType: "quantity", stockQuantity: 3, simpleAvailability: null, published: false, featured: false, variants: [], images: [], ...o,
});

test("disponibilidade: quantidade, simples, encomenda e variação", () => {
  assert.equal(productAvailability(mk({ stockControlType: "quantity", stockQuantity: 0 })).status, "sold_out");
  assert.equal(productAvailability(mk({ stockControlType: "quantity", stockQuantity: 2 })).status, "available");
  assert.equal(productAvailability(mk({ stockControlType: "simple", stockQuantity: null, simpleAvailability: false })).status, "sold_out");
  assert.equal(productAvailability(mk({ saleType: "sob_encomenda", stockControlType: "none", stockQuantity: null })).status, "made_to_order");
  const v = (q: number, active = true) => ({ id: String(Math.random()), productId: base.id, name: "Tamanho", value: "M", stockControlType: "quantity" as const, stockQuantity: q, simpleAvailability: null, active });
  const allOut = mk({ stockControlType: "variant", stockQuantity: 99, variants: [v(0), v(0)] });
  assert.equal(productAvailability(allOut).status, "sold_out", "estoque do produto principal é ignorado quando há controle por variação");
  assert.equal(productAvailability(mk({ stockControlType: "variant", variants: [v(0), v(2)] })).status, "available");
  assert.equal(productAvailability(mk({ stockControlType: "variant", variants: [v(0), v(5, false)] })).status, "sold_out", "variação inativa não conta");
  assert.equal(variantAvailability(allOut, allOut.variants[0]), "sold_out");
});

test("catálogo: busca sem acento/caixa, filtros, ordenação e paginação", () => {
  const pub = DEMO_PRODUCTS.filter((p) => p.published);
  const q = (r: Record<string, string>) => parseCatalogQuery(r);
  assert.ok(applyCatalogQuery(pub, q({ q: "VÉU" })).items.every((p) => p.category?.slug === "veus"));
  assert.equal(applyCatalogQuery(pub, q({ q: "camisa social" })).total, pub.filter((p) => p.name.toLowerCase().includes("camisa social")).length);
  assert.ok(applyCatalogQuery(pub, q({ venda: "sob_encomenda" })).items.every((p) => p.saleType === "sob_encomenda"));
  assert.ok(applyCatalogQuery(pub, q({ disponibilidade: "esgotado" })).total > 0);
  assert.ok(applyCatalogQuery(pub, q({ categoria: "gravatas" })).items.every((p) => p.category?.slug === "gravatas"));
  const asc = applyCatalogQuery(pub, q({ ordem: "menor_preco" })).items.map((p) => p.price);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  const range = applyCatalogQuery(pub, q({ min: "200", max: "300" })).items;
  assert.ok(range.length > 0 && range.every((p) => p.price >= 200 && p.price <= 300));
  assert.equal(applyCatalogQuery(pub, q({ q: "zzzz" })).total, 0);
  const p1 = applyCatalogQuery(pub, q({}));
  assert.equal(p1.items.length, Math.min(PAGE_SIZE, pub.length));
  assert.equal(applyCatalogQuery(pub, q({ pagina: "99" })).page, p1.totalPages);
  assert.equal(q({ ordem: "hack", disponibilidade: "x", pagina: "-3" }).ordem, "recentes");
});

test("rascunhos do demo existem e não são publicados", () => {
  assert.ok(DEMO_PRODUCTS.some((p) => !p.published));
});

test("whatsapp: normalização e mensagem", () => {
  assert.equal(normalizeWhatsappNumber("(11) 91234-5678"), "5511912345678");
  assert.equal(normalizeWhatsappNumber("+55 11 91234-5678"), "5511912345678");
  assert.equal(normalizeWhatsappNumber("123"), null);
  assert.equal(normalizeWhatsappNumber(""), null);
  const msg = buildProductMessage({ productName: "Terno Azul", selections: [{ name: "Tamanho", value: "50" }], productUrl: "https://x.com/produto/terno" });
  assert.match(msg, /^Olá! Tenho interesse no produto Terno Azul, anunciado no site da Pilaris\./);
  assert.match(msg, /Variação: Tamanho 50\./);
  assert.match(msg, /Gostaria de obter mais informações\./);
  assert.match(msg, /https:\/\/x\.com\/produto\/terno$/);
  assert.equal(buildProductMessage({ productName: "A" }), "Olá! Tenho interesse no produto A, anunciado no site da Pilaris. Gostaria de obter mais informações.");
  const url = buildWhatsappUrl("11912345678", msg)!;
  assert.ok(url.startsWith("https://wa.me/5511912345678?text="));
  assert.equal(decodeURIComponent(url.split("text=")[1]), msg);
  assert.equal(buildWhatsappUrl(null, msg), null);
});

test("formatação e slug", () => {
  assert.equal(formatBRL(1290).replace(/\s/g, " "), "R$ 1.290,00");
  assert.equal(parsePriceInput("1.234,56"), 1234.56);
  assert.equal(parsePriceInput("289,9"), 289.9);
  assert.ok(Number.isNaN(parsePriceInput("abc")));
  assert.equal(slugify("Bolsa de Bíblia – Marinho!"), "bolsa-de-biblia-marinho");
});

test("validação de produto: regras de estoque", () => {
  assert.ok(parseProductInput(input()).ok);
  assert.ok(!parseProductInput(input({ slug: "Slug Inválido" })).ok);
  assert.ok(!parseProductInput(input({ price: -1 })).ok);
  assert.ok(!parseProductInput(input({ stockQuantity: null })).ok, "quantidade obrigatória");
  assert.ok(!parseProductInput(input({ stockQuantity: -2 })).ok);
  const enc = parseProductInput(input({ saleType: "sob_encomenda", stockControlType: "quantity", stockQuantity: 9 }));
  assert.ok(enc.ok && enc.data.stockControlType === "none" && enc.data.stockQuantity === null, "sob encomenda zera estoque");
  assert.ok(!parseProductInput(input({ published: true })).ok, "publicar exige foto");
  const withImg = parseProductInput(input({ published: true, images: [{ storagePath: "products/0a1b2c3d-aaaa-bbbb-cccc-0123456789ab.webp", isPrimary: false }] }));
  assert.ok(withImg.ok && withImg.data.images[0].isPrimary, "primeira imagem vira principal");
  assert.ok(!parseProductInput(input({ images: [{ storagePath: "../../etc/passwd", isPrimary: true }] })).ok, "caminho de imagem inválido");
  const v = (name: string, value: string, extra = {}) => ({ name, value, stockControlType: "quantity", stockQuantity: 1, active: true, ...extra });
  const pv = parseProductInput(input({ stockControlType: "variant", stockQuantity: 50, variants: [v("Tamanho", "M"), v("Tamanho", "G")] }));
  assert.ok(pv.ok && pv.data.stockQuantity === null, "estoque do produto principal não duplica");
  assert.ok(!parseProductInput(input({ stockControlType: "variant", variants: [v("Tamanho", "M"), v("Cor", "Azul")] })).ok, "um único tipo com estoque por variação");
  assert.ok(!parseProductInput(input({ stockControlType: "variant", variants: [] })).ok);
  assert.ok(!parseProductInput(input({ variants: [v("Tamanho", "M"), v("tamanho", "m")] })).ok, "variação repetida");
  const info = parseProductInput(input({ variants: [v("Cor", "Azul", { stockQuantity: 9 })] }));
  assert.ok(info.ok && info.data.variants[0].stockControlType === "none", "variação informativa não tem estoque próprio");
});

test("validação: sanitização de texto e configurações", () => {
  const r = parseProductInput(input({ name: "  Camisa\u0000   Azul\u200B  ", description: "linha1\r\n\u0007linha2" }));
  assert.ok(r.ok && r.data.name === "Camisa Azul" && r.data.description === "linha1\nlinha2");
  const s = settingsInputSchema.safeParse({ storeName: "Pilaris", slogan: "Seja o Pilar.", biography: "Texto longo o bastante.", whatsappNumber: "(11) 91234-5678", instagramUrl: "javascript:alert(1)", facebookUrl: "", contactEmail: "", contactInfo: "" });
  assert.ok(!s.success, "URL com javascript: é rejeitada");
  const ok = settingsInputSchema.safeParse({ storeName: "Pilaris", slogan: "Seja o Pilar.", biography: "Texto longo o bastante.", whatsappNumber: "(11) 91234-5678", instagramUrl: "https://instagram.com/x", facebookUrl: "", contactEmail: "a@b.co", contactInfo: "" });
  assert.ok(ok.success && ok.data.whatsappNumber === "5511912345678" && ok.data.facebookUrl === null);
});
