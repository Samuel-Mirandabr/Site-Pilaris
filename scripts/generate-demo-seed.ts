// Gera supabase/seed_demo.sql a partir de src/lib/demo/data.ts. Uso: npx tsx scripts/generate-demo-seed.ts
import { writeFileSync } from "node:fs";
import { DEMO_PRODUCTS } from "../src/lib/demo/data";

const q = (v: string | null) => (v === null ? "null" : `'${v.replace(/'/g, "''")}'`);
const lines: string[] = [
  "-- Pilaris — produtos de EXEMPLO (is_demo = true). Opcional: serve só para testar a vitrine.",
  "-- Preços, textos e fotos são ilustrativos. Remova antes de divulgar o site:",
  "--   delete from public.products where is_demo;   (ou use o botão no painel, em Resumo)",
  "",
];
for (const p of DEMO_PRODUCTS) {
  lines.push(
    `with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)`,
    `  select ${q(p.name)}, ${q(p.slug)}, ${q(p.description)}, ${p.price}, c.id, ${q(p.saleType)}, ${q(p.stockControlType)}, ${p.stockQuantity ?? "null"}, ${p.simpleAvailability ?? "null"}, ${p.published}, ${p.featured}, true, ${q(p.createdAt)}`,
    `  from public.categories c where c.slug = ${q(p.category!.slug)} on conflict (slug) do nothing returning id)`,
  );
  const imgs = p.images.map((i) => `    select id, ${q(i.imageUrl)}, ${q(i.altText)}, ${i.isPrimary}, ${i.displayOrder} from p`).join("\n    union all\n");
  const vars = p.variants.map((v) => `    select id, ${q(v.name)}, ${q(v.value)}, ${q(v.stockControlType)}, ${v.stockQuantity ?? "null"}::int, ${v.simpleAvailability ?? "null"}::boolean, true from p`).join("\n    union all\n");
  lines.push(`, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)\n${imgs} returning 1)`);
  if (vars) lines.push(`insert into public.product_variants (product_id, name, value, stock_control_type, stock_quantity, simple_availability, active)\n${vars};`);
  else lines.push(`select 1;`);
  lines.push("");
}
writeFileSync("supabase/seed_demo.sql", lines.join("\n"));
console.log("ok", DEMO_PRODUCTS.length);
