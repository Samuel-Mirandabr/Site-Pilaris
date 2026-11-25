-- Pilaris — esquema do banco (PostgreSQL / Supabase)
-- Execute no SQL Editor do Supabase (ou via `supabase db push`). Idempotente: pode ser reexecutado.

------------------------------------------------------------------ funções auxiliares
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- O proprietário é a conta cujo app_metadata contém {"role":"admin"}.
-- app_metadata só pode ser alterado pelo painel do Supabase / SQL com privilégio de serviço:
-- um usuário comum NÃO consegue se promover a administrador.
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

------------------------------------------------------------------ categorias
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 60),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 300),
  image_url   text,
  image_path  text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

------------------------------------------------------------------ produtos
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null check (char_length(name) between 2 and 120),
  slug                text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description         text check (char_length(description) <= 4000),
  price               numeric(10,2) not null check (price >= 0),
  -- RESTRICT: uma categoria em uso não pode ser apagada (o painel orienta o que fazer).
  category_id         uuid not null references public.categories(id) on delete restrict,
  sale_type           text not null default 'pronta_entrega' check (sale_type in ('pronta_entrega','sob_encomenda')),
  stock_control_type  text not null default 'quantity'       check (stock_control_type in ('none','quantity','simple','variant')),
  stock_quantity      integer check (stock_quantity >= 0),
  simple_availability boolean,
  published           boolean not null default false,
  featured            boolean not null default false,
  is_demo             boolean not null default false, -- dados de exemplo (removíveis)
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint products_stock_consistency check (
    (sale_type = 'sob_encomenda' and stock_control_type = 'none' and stock_quantity is null and simple_availability is null)
    or (sale_type = 'pronta_entrega' and (
         (stock_control_type = 'quantity' and stock_quantity is not null and simple_availability is null)
      or (stock_control_type = 'simple'   and simple_availability is not null and stock_quantity is null)
      or (stock_control_type = 'variant'  and stock_quantity is null and simple_availability is null)))
  )
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_published_idx on public.products (published, created_at desc);

------------------------------------------------------------------ imagens
create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  image_url     text not null,
  storage_path  text,
  alt_text      text check (char_length(alt_text) <= 200),
  is_primary    boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id, display_order);
create unique index if not exists product_images_one_primary on public.product_images (product_id) where is_primary;

------------------------------------------------------------------ variações
create table if not exists public.product_variants (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references public.products(id) on delete cascade,
  name                text not null check (char_length(name) between 1 and 40),
  value               text not null check (char_length(value) between 1 and 60),
  stock_control_type  text not null default 'none' check (stock_control_type in ('none','quantity','simple')),
  stock_quantity      integer check (stock_quantity >= 0),
  simple_availability boolean,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (product_id, name, value),
  constraint variants_stock_consistency check (
    (stock_control_type = 'none'     and stock_quantity is null and simple_availability is null)
    or (stock_control_type = 'quantity' and stock_quantity is not null and simple_availability is null)
    or (stock_control_type = 'simple'   and simple_availability is not null and stock_quantity is null)
  )
);
create index if not exists product_variants_product_idx on public.product_variants (product_id);

------------------------------------------------------------------ configurações da loja (linha única)
create table if not exists public.store_settings (
  id              smallint primary key default 1 check (id = 1),
  store_name      text not null default 'Pilaris' check (char_length(store_name) between 2 and 60),
  slogan          text not null default 'Seja o Pilar.' check (char_length(slogan) between 1 and 80),
  biography       text not null default E'Elegância com propósito.\n\nA Pilaris reúne moda executiva e cristã em uma seleção de roupas e acessórios pensados para diferentes estilos e ocasiões. Mais do que vestir, acreditamos que cada detalhe pode expressar personalidade, elegância e propósito.\n\nPilaris — Seja o Pilar.',
  whatsapp_number text check (whatsapp_number ~ '^[0-9]{12,15}$'), -- somente dígitos, com DDI (55...)
  instagram_url   text,
  facebook_url    text,
  contact_email   text,
  contact_info    text check (char_length(contact_info) <= 500),
  updated_at      timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

------------------------------------------------------------------ categorias iniciais
insert into public.categories (name, slug) values
  ('Ternos','ternos'), ('Camisas sociais','camisas-sociais'), ('Sapatos','sapatos'),
  ('Acessórios','acessorios'), ('Gravatas','gravatas'), ('Véus','veus'), ('Bolsas de Bíblia','bolsas-de-biblia')
on conflict (slug) do nothing;

------------------------------------------------------------------ updated_at
do $$
declare t text;
begin
  foreach t in array array['categories','products','product_variants','store_settings'] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

------------------------------------------------------------------ salvar produto (transação única)
-- Cria/atualiza produto + variações + imagens atomicamente. SECURITY INVOKER: o RLS continua valendo.
create or replace function public.save_product(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  pid uuid := nullif(payload->>'id','')::uuid;
  v jsonb;
  img jsonb;
  keep_variants uuid[];
  keep_images uuid[];
  removed text[];
  ord integer := 0;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if pid is null then
    insert into products (name, slug, description, price, category_id, sale_type, stock_control_type,
                          stock_quantity, simple_availability, published, featured)
    values (payload->>'name', payload->>'slug', nullif(payload->>'description',''), (payload->>'price')::numeric,
            (payload->>'category_id')::uuid, payload->>'sale_type', payload->>'stock_control_type',
            nullif(payload->>'stock_quantity','')::integer, nullif(payload->>'simple_availability','')::boolean,
            (payload->>'published')::boolean, (payload->>'featured')::boolean)
    returning id into pid;
  else
    update products set
      name = payload->>'name', slug = payload->>'slug', description = nullif(payload->>'description',''),
      price = (payload->>'price')::numeric, category_id = (payload->>'category_id')::uuid,
      sale_type = payload->>'sale_type', stock_control_type = payload->>'stock_control_type',
      stock_quantity = nullif(payload->>'stock_quantity','')::integer,
      simple_availability = nullif(payload->>'simple_availability','')::boolean,
      published = (payload->>'published')::boolean, featured = (payload->>'featured')::boolean
    where id = pid;
    if not found then
      raise exception 'product_not_found' using errcode = 'P0002';
    end if;
  end if;

  -- variações
  select coalesce(array_agg((e->>'id')::uuid), '{}') into keep_variants
    from jsonb_array_elements(coalesce(payload->'variants','[]'::jsonb)) e where nullif(e->>'id','') is not null;
  delete from product_variants where product_id = pid and id <> all (keep_variants);

  for v in select * from jsonb_array_elements(coalesce(payload->'variants','[]'::jsonb)) loop
    if nullif(v->>'id','') is not null then
      update product_variants set
        name = v->>'name', value = v->>'value', stock_control_type = v->>'stock_control_type',
        stock_quantity = nullif(v->>'stock_quantity','')::integer,
        simple_availability = nullif(v->>'simple_availability','')::boolean,
        active = (v->>'active')::boolean
      where id = (v->>'id')::uuid and product_id = pid;
    else
      insert into product_variants (product_id, name, value, stock_control_type, stock_quantity, simple_availability, active)
      values (pid, v->>'name', v->>'value', v->>'stock_control_type', nullif(v->>'stock_quantity','')::integer,
              nullif(v->>'simple_availability','')::boolean, (v->>'active')::boolean);
    end if;
  end loop;

  -- imagens
  select coalesce(array_agg((e->>'id')::uuid), '{}') into keep_images
    from jsonb_array_elements(coalesce(payload->'images','[]'::jsonb)) e where nullif(e->>'id','') is not null;
  select coalesce(array_agg(storage_path), '{}') into removed
    from product_images where product_id = pid and storage_path is not null and id <> all (keep_images);
  delete from product_images where product_id = pid and id <> all (keep_images);
  update product_images set is_primary = false where product_id = pid;

  for img in select * from jsonb_array_elements(coalesce(payload->'images','[]'::jsonb)) loop
    if nullif(img->>'id','') is not null then
      update product_images set alt_text = nullif(img->>'alt_text',''), display_order = ord,
             is_primary = (img->>'is_primary')::boolean
      where id = (img->>'id')::uuid and product_id = pid;
    else
      insert into product_images (product_id, image_url, storage_path, alt_text, is_primary, display_order)
      values (pid, img->>'image_url', img->>'storage_path', nullif(img->>'alt_text',''), (img->>'is_primary')::boolean, ord);
    end if;
    ord := ord + 1;
  end loop;

  return jsonb_build_object('id', pid, 'removed_paths', to_jsonb(removed));
end $$;

revoke all on function public.save_product(jsonb) from public, anon;
grant execute on function public.save_product(jsonb) to authenticated;
