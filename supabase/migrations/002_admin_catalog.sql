-- BalticMare Admin v1
-- Persistent fields controlled by the Back Office.
alter table public.products add column if not exists short_description text;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists is_top_product boolean not null default false;
alter table public.products add column if not exists is_on_sale boolean not null default false;
alter table public.products add column if not exists sale_price numeric(12,2);
alter table public.products add column if not exists sale_from timestamptz;
alter table public.products add column if not exists sale_until timestamptz;

alter table public.customer_price_overrides add column if not exists discount_percent numeric(5,2) check (discount_percent is null or (discount_percent >= 0 and discount_percent <= 100));

create table if not exists public.product_promotions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  promotion_type text not null default 'sale' check (promotion_type in ('sale','clearance','campaign')),
  sale_price numeric(12,2),
  discount_percent numeric(5,2) check (discount_percent is null or (discount_percent >= 0 and discount_percent <= 100)),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_product_promotions_product on public.product_promotions(product_id);
create index if not exists idx_product_promotions_active on public.product_promotions(is_active);
alter table public.product_promotions enable row level security;

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  media_type text not null default 'image' check (media_type in ('image','video')),
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_media_product on public.product_media(product_id);
alter table public.product_media enable row level security;
