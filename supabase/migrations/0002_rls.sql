-- Pilaris — Row Level Security
-- Regras: o público lê somente produtos publicados (de categorias ativas) e categorias ativas;
-- somente o administrador (is_admin()) escreve. Visitantes (anon) nunca escrevem.

alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.product_variants enable row level security;
alter table public.store_settings   enable row level security;

-- Privilégios de tabela (o RLS filtra as linhas por cima disso).
revoke all on public.categories, public.products, public.product_images, public.product_variants, public.store_settings from anon, authenticated;
grant select on public.categories, public.products, public.product_images, public.product_variants, public.store_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images, public.product_variants to authenticated;
grant update, insert on public.store_settings to authenticated;

-- ---------- categories
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated using (active = true);
drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- products
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated
  using (published = true and exists (select 1 from public.categories c where c.id = category_id and c.active));
drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- product_images (visíveis quando o produto é visível)
drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));
drop policy if exists product_images_admin_all on public.product_images;
create policy product_images_admin_all on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- product_variants (somente ativas, de produtos visíveis)
drop policy if exists product_variants_public_read on public.product_variants;
create policy product_variants_public_read on public.product_variants for select to anon, authenticated
  using (active = true and exists (select 1 from public.products p where p.id = product_id));
drop policy if exists product_variants_admin_all on public.product_variants;
create policy product_variants_admin_all on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- store_settings (público lê; admin altera; linha única)
drop policy if exists store_settings_public_read on public.store_settings;
create policy store_settings_public_read on public.store_settings for select to anon, authenticated using (true);
drop policy if exists store_settings_admin_write on public.store_settings;
create policy store_settings_admin_write on public.store_settings for insert to authenticated with check (public.is_admin());
drop policy if exists store_settings_admin_update on public.store_settings;
create policy store_settings_admin_update on public.store_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
