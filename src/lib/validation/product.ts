import { z } from "zod";
import { issuesToFieldErrors, line, optionalText, slugSchema, uuidSchema, type FieldErrors } from "./common";

export const STORAGE_PATH_RE = /^(products|categories)\/[a-z0-9-]{8,64}\.(webp|jpg|jpeg|png)$/;

const variantSchema = z.object({
  id: uuidSchema.nullish(),
  name: line(1, 40, "O tipo da variação"),
  value: line(1, 60, "A opção da variação"),
  stockControlType: z.enum(["none", "quantity", "simple"]),
  stockQuantity: z.number().int({ message: "Informe um número inteiro." }).min(0, { message: "A quantidade não pode ser negativa." }).max(100000).nullish(),
  simpleAvailability: z.boolean().nullish(),
  active: z.boolean(),
});

const imageSchema = z.object({
  id: uuidSchema.nullish(),
  storagePath: z.string().regex(STORAGE_PATH_RE, { message: "Caminho de imagem inválido." }).nullish(),
  altText: z.string().nullish().transform((v) => (v ? v.replace(/\s+/g, " ").trim().slice(0, 200) : null)),
  isPrimary: z.boolean(),
});

export const productInputSchema = z.object({
  id: uuidSchema.nullish(),
  name: line(2, 120, "O nome"),
  slug: slugSchema,
  description: optionalText(4000, "A descrição"),
  price: z.number({ message: "Informe o preço." }).min(0, { message: "O preço não pode ser negativo." }).max(1_000_000, { message: "Preço acima do permitido." })
    .transform((v) => Math.round(v * 100) / 100),
  categoryId: uuidSchema,
  saleType: z.enum(["pronta_entrega", "sob_encomenda"]),
  stockControlType: z.enum(["none", "quantity", "simple", "variant"]),
  stockQuantity: z.number().int({ message: "Informe um número inteiro." }).min(0, { message: "A quantidade não pode ser negativa." }).max(100000).nullish(),
  simpleAvailability: z.boolean().nullish(),
  published: z.boolean(),
  featured: z.boolean(),
  variants: z.array(variantSchema).max(50, { message: "No máximo 50 variações." }),
  images: z.array(imageSchema).max(12, { message: "No máximo 12 imagens por produto." }),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductInputRaw = z.input<typeof productInputSchema>;

export type ProductParseResult = { ok: true; data: ProductInput } | { ok: false; fieldErrors: FieldErrors };

/** Valida o formato (zod) e aplica as regras de negócio de estoque/variações/imagens. */
export function parseProductInput(raw: unknown): ProductParseResult {
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: issuesToFieldErrors(parsed.error) };
  const d = structuredClone(parsed.data);
  const errors: FieldErrors = {};

  if (d.saleType === "sob_encomenda") {
    // Sob encomenda não possui estoque: nada de pronta entrega.
    d.stockControlType = "none";
    d.stockQuantity = null;
    d.simpleAvailability = null;
    d.variants.forEach((v) => Object.assign(v, { stockControlType: "none", stockQuantity: null, simpleAvailability: null }));
  } else {
    if (d.stockControlType === "none") errors.stockControlType = "Escolha como controlar o estoque deste produto.";
    if (d.stockControlType === "quantity") {
      if (d.stockQuantity == null) errors.stockQuantity = "Informe a quantidade disponível.";
      d.simpleAvailability = null;
    }
    if (d.stockControlType === "simple") {
      d.simpleAvailability = d.simpleAvailability ?? true;
      d.stockQuantity = null;
    }
    if (d.stockControlType === "variant") {
      // Estoque por variação: não duplicar o controle no produto principal.
      d.stockQuantity = null;
      d.simpleAvailability = null;
      if (d.variants.length === 0) errors.variants = "Adicione ao menos uma variação para controlar o estoque por variação.";
      if (new Set(d.variants.map((v) => v.name.toLowerCase())).size > 1)
        errors.variants = "Com estoque por variação, use um único tipo de variação (ex.: só Tamanho).";
      d.variants.forEach((v, i) => {
        if (v.stockControlType === "none") errors[`variants.${i}.stockControlType`] = "Defina o estoque desta variação.";
        if (v.stockControlType === "quantity" && v.stockQuantity == null) errors[`variants.${i}.stockQuantity`] = "Informe a quantidade.";
      });
    } else {
      // Variações apenas informativas: sem estoque próprio.
      d.variants.forEach((v) => Object.assign(v, { stockControlType: "none", stockQuantity: null, simpleAvailability: null }));
    }
  }

  d.variants.forEach((v) => {
    if (v.stockControlType === "quantity") v.simpleAvailability = null;
    else if (v.stockControlType === "simple") { v.stockQuantity = null; v.simpleAvailability = v.simpleAvailability ?? true; }
    else { v.stockQuantity = null; v.simpleAvailability = null; }
  });
  const seen = new Set<string>();
  d.variants.forEach((v, i) => {
    const key = `${v.name.toLowerCase()}|${v.value.toLowerCase()}`;
    if (seen.has(key)) errors[`variants.${i}.value`] = "Esta variação está repetida.";
    seen.add(key);
  });

  d.images.forEach((img, i) => {
    if (!img.id && !img.storagePath) errors[`images.${i}`] = "Imagem sem arquivo.";
  });
  if (d.images.length > 0 && !d.images.some((i) => i.isPrimary)) d.images[0].isPrimary = true;
  if (d.images.filter((i) => i.isPrimary).length > 1) {
    let found = false;
    d.images.forEach((i) => { if (i.isPrimary && found) i.isPrimary = false; else if (i.isPrimary) found = true; });
  }
  if (d.published && d.images.length === 0) errors.images = "Adicione ao menos uma foto para publicar o produto.";

  return Object.keys(errors).length ? { ok: false, fieldErrors: errors } : { ok: true, data: d };
}
