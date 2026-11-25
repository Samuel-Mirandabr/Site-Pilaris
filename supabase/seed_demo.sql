-- Pilaris — produtos de EXEMPLO (is_demo = true). Opcional: serve só para testar a vitrine.
-- Preços, textos e fotos são ilustrativos. Remova antes de divulgar o site:
--   delete from public.products where is_demo;   (ou use o botão no painel, em Resumo)

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Terno Clássico Azul-marinho', 'terno-classico-azul-marinho', 'Corte reto em lã fria, forro completo e caimento estruturado.

Produto de exemplo para teste da vitrine.', 1290, c.id, 'pronta_entrega', 'variant', null, null, true, true, true, '2026-06-30T00:00:00.000Z'
  from public.categories c where c.slug = 'ternos' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-1-1.webp', 'Foto demonstrativa do produto Terno Clássico Azul-marinho', true, 1 from p
    union all
    select id, '/demo/demo-1-2.webp', 'Foto demonstrativa do produto Terno Clássico Azul-marinho', false, 2 from p returning 1)
insert into public.product_variants (product_id, name, value, stock_control_type, stock_quantity, simple_availability, active)
    select id, 'Tamanho', '46', 'quantity', 2::int, null::boolean, true from p
    union all
    select id, 'Tamanho', '48', 'quantity', 0::int, null::boolean, true from p
    union all
    select id, 'Tamanho', '50', 'quantity', 3::int, null::boolean, true from p
    union all
    select id, 'Tamanho', '52', 'quantity', 1::int, null::boolean, true from p;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Terno Slim Grafite', 'terno-slim-grafite', 'Modelagem ajustada para uso diário no escritório.

Produto de exemplo para teste da vitrine.', 1190, c.id, 'pronta_entrega', 'quantity', 4, null, true, false, true, '2026-06-29T00:00:00.000Z'
  from public.categories c where c.slug = 'ternos' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-2-1.webp', 'Foto demonstrativa do produto Terno Slim Grafite', true, 1 from p
    union all
    select id, '/demo/demo-2-2.webp', 'Foto demonstrativa do produto Terno Slim Grafite', false, 2 from p returning 1)
select 1;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Terno Executivo sob medida', 'terno-executivo-sob-medida', 'Confeccionado conforme as suas medidas. Prazo combinado pelo WhatsApp.

Produto de exemplo para teste da vitrine.', 1890, c.id, 'sob_encomenda', 'none', null, null, true, false, true, '2026-06-28T00:00:00.000Z'
  from public.categories c where c.slug = 'ternos' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-3-1.webp', 'Foto demonstrativa do produto Terno Executivo sob medida', true, 1 from p
    union all
    select id, '/demo/demo-3-2.webp', 'Foto demonstrativa do produto Terno Executivo sob medida', false, 2 from p returning 1)
insert into public.product_variants (product_id, name, value, stock_control_type, stock_quantity, simple_availability, active)
    select id, 'Cor', 'Azul-marinho', 'none', null::int, null::boolean, true from p
    union all
    select id, 'Cor', 'Cinza', 'none', null::int, null::boolean, true from p
    union all
    select id, 'Cor', 'Preto', 'none', null::int, null::boolean, true from p;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Camisa Social Branca', 'camisa-social-branca', 'Algodão egípcio, colarinho firme e punho para abotoaduras.

Produto de exemplo para teste da vitrine.', 219, c.id, 'pronta_entrega', 'quantity', 12, null, true, true, true, '2026-06-27T00:00:00.000Z'
  from public.categories c where c.slug = 'camisas-sociais' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-4-1.webp', 'Foto demonstrativa do produto Camisa Social Branca', true, 1 from p
    union all
    select id, '/demo/demo-4-2.webp', 'Foto demonstrativa do produto Camisa Social Branca', false, 2 from p returning 1)
insert into public.product_variants (product_id, name, value, stock_control_type, stock_quantity, simple_availability, active)
    select id, 'Tamanho', 'P', 'none', null::int, null::boolean, true from p
    union all
    select id, 'Tamanho', 'M', 'none', null::int, null::boolean, true from p
    union all
    select id, 'Tamanho', 'G', 'none', null::int, null::boolean, true from p
    union all
    select id, 'Tamanho', 'GG', 'none', null::int, null::boolean, true from p;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Camisa Social Azul Clara', 'camisa-social-azul-clara', 'Tecido leve com acabamento antiamassado.

Produto de exemplo para teste da vitrine.', 219, c.id, 'pronta_entrega', 'simple', null, true, true, false, true, '2026-06-26T00:00:00.000Z'
  from public.categories c where c.slug = 'camisas-sociais' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-5-1.webp', 'Foto demonstrativa do produto Camisa Social Azul Clara', true, 1 from p
    union all
    select id, '/demo/demo-5-2.webp', 'Foto demonstrativa do produto Camisa Social Azul Clara', false, 2 from p returning 1)
insert into public.product_variants (product_id, name, value, stock_control_type, stock_quantity, simple_availability, active)
    select id, 'Tamanho', 'M', 'none', null::int, null::boolean, true from p
    union all
    select id, 'Tamanho', 'G', 'none', null::int, null::boolean, true from p;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Camisa Social Listrada', 'camisa-social-listrada', 'Listras finas em azul e branco. Peça atemporal.

Produto de exemplo para teste da vitrine.', 239, c.id, 'pronta_entrega', 'simple', null, false, true, false, true, '2026-06-25T00:00:00.000Z'
  from public.categories c where c.slug = 'camisas-sociais' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-6-1.webp', 'Foto demonstrativa do produto Camisa Social Listrada', true, 1 from p
    union all
    select id, '/demo/demo-6-2.webp', 'Foto demonstrativa do produto Camisa Social Listrada', false, 2 from p returning 1)
select 1;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Sapato Oxford Preto', 'sapato-oxford-preto', 'Couro legítimo, solado em couro e costura Goodyear.

Produto de exemplo para teste da vitrine.', 589, c.id, 'pronta_entrega', 'variant', null, null, true, true, true, '2026-06-24T00:00:00.000Z'
  from public.categories c where c.slug = 'sapatos' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-7-1.webp', 'Foto demonstrativa do produto Sapato Oxford Preto', true, 1 from p
    union all
    select id, '/demo/demo-7-2.webp', 'Foto demonstrativa do produto Sapato Oxford Preto', false, 2 from p returning 1)
insert into public.product_variants (product_id, name, value, stock_control_type, stock_quantity, simple_availability, active)
    select id, 'Numeração', '39', 'quantity', 1::int, null::boolean, true from p
    union all
    select id, 'Numeração', '40', 'quantity', 2::int, null::boolean, true from p
    union all
    select id, 'Numeração', '41', 'quantity', 0::int, null::boolean, true from p
    union all
    select id, 'Numeração', '42', 'quantity', 3::int, null::boolean, true from p
    union all
    select id, 'Numeração', '43', 'quantity', 1::int, null::boolean, true from p;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Sapato Derby Marrom', 'sapato-derby-marrom', 'Versátil para o dia a dia, com palmilha anatômica.

Produto de exemplo para teste da vitrine.', 549, c.id, 'pronta_entrega', 'quantity', 0, null, true, false, true, '2026-06-23T00:00:00.000Z'
  from public.categories c where c.slug = 'sapatos' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-8-1.webp', 'Foto demonstrativa do produto Sapato Derby Marrom', true, 1 from p
    union all
    select id, '/demo/demo-8-2.webp', 'Foto demonstrativa do produto Sapato Derby Marrom', false, 2 from p returning 1)
select 1;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Cinto de Couro Preto', 'cinto-de-couro-preto', 'Fivela discreta em metal escovado.

Produto de exemplo para teste da vitrine.', 189, c.id, 'pronta_entrega', 'quantity', 8, null, true, false, true, '2026-06-22T00:00:00.000Z'
  from public.categories c where c.slug = 'acessorios' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-9-1.webp', 'Foto demonstrativa do produto Cinto de Couro Preto', true, 1 from p
    union all
    select id, '/demo/demo-9-2.webp', 'Foto demonstrativa do produto Cinto de Couro Preto', false, 2 from p returning 1)
select 1;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Abotoaduras Prata', 'abotoaduras-prata', 'Par de abotoaduras com acabamento fosco.

Produto de exemplo para teste da vitrine.', 149, c.id, 'pronta_entrega', 'simple', null, true, true, false, true, '2026-06-21T00:00:00.000Z'
  from public.categories c where c.slug = 'acessorios' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-10-1.webp', 'Foto demonstrativa do produto Abotoaduras Prata', true, 1 from p
    union all
    select id, '/demo/demo-10-2.webp', 'Foto demonstrativa do produto Abotoaduras Prata', false, 2 from p returning 1)
select 1;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Gravata Azul Real', 'gravata-azul-real', 'Seda pura, 7 cm de largura.

Produto de exemplo para teste da vitrine.', 129, c.id, 'pronta_entrega', 'quantity', 15, null, true, false, true, '2026-06-20T00:00:00.000Z'
  from public.categories c where c.slug = 'gravatas' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-1-1.webp', 'Foto demonstrativa do produto Gravata Azul Real', true, 1 from p
    union all
    select id, '/demo/demo-1-2.webp', 'Foto demonstrativa do produto Gravata Azul Real', false, 2 from p returning 1)
select 1;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Gravata Listrada Marinho', 'gravata-listrada-marinho', 'Seda jacquard com listras diagonais.

Produto de exemplo para teste da vitrine.', 129, c.id, 'pronta_entrega', 'quantity', 3, null, true, false, true, '2026-06-19T00:00:00.000Z'
  from public.categories c where c.slug = 'gravatas' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-2-1.webp', 'Foto demonstrativa do produto Gravata Listrada Marinho', true, 1 from p
    union all
    select id, '/demo/demo-2-2.webp', 'Foto demonstrativa do produto Gravata Listrada Marinho', false, 2 from p returning 1)
select 1;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Véu de Renda Branco', 'veu-de-renda-branco', 'Renda delicada com borda trabalhada.

Produto de exemplo para teste da vitrine.', 169, c.id, 'sob_encomenda', 'none', null, null, true, false, true, '2026-06-18T00:00:00.000Z'
  from public.categories c where c.slug = 'veus' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-3-1.webp', 'Foto demonstrativa do produto Véu de Renda Branco', true, 1 from p
    union all
    select id, '/demo/demo-3-2.webp', 'Foto demonstrativa do produto Véu de Renda Branco', false, 2 from p returning 1)
insert into public.product_variants (product_id, name, value, stock_control_type, stock_quantity, simple_availability, active)
    select id, 'Cor', 'Branco', 'none', null::int, null::boolean, true from p
    union all
    select id, 'Cor', 'Off-white', 'none', null::int, null::boolean, true from p
    union all
    select id, 'Cor', 'Preto', 'none', null::int, null::boolean, true from p;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Véu Mantilha Preto', 'veu-mantilha-preto', 'Mantilha tradicional para celebrações.

Produto de exemplo para teste da vitrine.', 159, c.id, 'pronta_entrega', 'simple', null, true, true, false, true, '2026-06-17T00:00:00.000Z'
  from public.categories c where c.slug = 'veus' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-4-1.webp', 'Foto demonstrativa do produto Véu Mantilha Preto', true, 1 from p
    union all
    select id, '/demo/demo-4-2.webp', 'Foto demonstrativa do produto Véu Mantilha Preto', false, 2 from p returning 1)
select 1;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Bolsa de Bíblia Marinho', 'bolsa-de-biblia-marinho', 'Compartimento acolchoado e alça ajustável.

Produto de exemplo para teste da vitrine.', 249, c.id, 'pronta_entrega', 'quantity', 0, null, true, false, true, '2026-06-16T00:00:00.000Z'
  from public.categories c where c.slug = 'bolsas-de-biblia' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-5-1.webp', 'Foto demonstrativa do produto Bolsa de Bíblia Marinho', true, 1 from p
    union all
    select id, '/demo/demo-5-2.webp', 'Foto demonstrativa do produto Bolsa de Bíblia Marinho', false, 2 from p returning 1)
select 1;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Bolsa de Bíblia Bege', 'bolsa-de-biblia-bege', 'Zíper reforçado e bolso interno para canetas.

Produto de exemplo para teste da vitrine.', 259, c.id, 'pronta_entrega', 'quantity', 5, null, true, false, true, '2026-06-15T00:00:00.000Z'
  from public.categories c where c.slug = 'bolsas-de-biblia' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-6-1.webp', 'Foto demonstrativa do produto Bolsa de Bíblia Bege', true, 1 from p
    union all
    select id, '/demo/demo-6-2.webp', 'Foto demonstrativa do produto Bolsa de Bíblia Bege', false, 2 from p returning 1)
insert into public.product_variants (product_id, name, value, stock_control_type, stock_quantity, simple_availability, active)
    select id, 'Tamanho', 'Médio', 'none', null::int, null::boolean, true from p
    union all
    select id, 'Tamanho', 'Grande', 'none', null::int, null::boolean, true from p;

with p as (insert into public.products (name, slug, description, price, category_id, sale_type, stock_control_type, stock_quantity, simple_availability, published, featured, is_demo, created_at)
  select 'Gravata em rascunho (não publicada)', 'gravata-em-rascunho-nao-publicada', 'Item de teste: não deve aparecer no site público.

Produto de exemplo para teste da vitrine.', 99, c.id, 'pronta_entrega', 'simple', null, true, false, false, true, '2026-06-14T00:00:00.000Z'
  from public.categories c where c.slug = 'gravatas' on conflict (slug) do nothing returning id)
, i as (insert into public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    select id, '/demo/demo-7-1.webp', 'Foto demonstrativa do produto Gravata em rascunho (não publicada)', true, 1 from p
    union all
    select id, '/demo/demo-7-2.webp', 'Foto demonstrativa do produto Gravata em rascunho (não publicada)', false, 2 from p returning 1)
select 1;
