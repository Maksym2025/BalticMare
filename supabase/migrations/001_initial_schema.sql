-- Royal Baltic Seafood / BalticMare
-- 001_initial_schema.sql
-- Backend foundation: 2026-08-28

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text, locale text not null default 'en',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.customer_segments (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
  description text, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(), legal_name text not null, trading_name text,
  registration_number text, vat_number text, country_code text not null, email text, phone text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  customer_segment_id uuid references public.customer_segments(id), approved_at timestamptz,
  approved_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.company_users (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'buyer' check (role in ('owner','admin','buyer','viewer')),
  is_active boolean not null default true, created_at timestamptz not null default now(), unique(company_id,user_id)
);
create table if not exists public.company_addresses (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  address_type text not null check (address_type in ('billing','shipping','both')), company_name text, contact_name text,
  address_line1 text not null, address_line2 text, postal_code text not null, city text not null, state_region text,
  country_code text not null, is_default boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.price_lists (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
  currency char(3) not null default 'EUR', customer_segment_id uuid references public.customer_segments(id),
  valid_from timestamptz, valid_until timestamptz, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), sku text not null unique, slug text not null unique, name text not null,
  description text, category text, origin_country_code text, catch_area text, processing_type text,
  storage_temperature_c numeric(5,2), is_frozen boolean not null default true,
  status text not null default 'draft' check (status in ('draft','active','inactive','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique, name text not null, net_weight_kg numeric(10,3), gross_weight_kg numeric(10,3),
  units_per_case integer, min_order_qty numeric(12,3), order_qty_step numeric(12,3) not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.packagings (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, description text,
  units_per_package numeric(12,3), tare_weight_kg numeric(10,3), created_at timestamptz not null default now()
);
create table if not exists public.price_list_items (
  id uuid primary key default gen_random_uuid(), price_list_id uuid not null references public.price_lists(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id) on delete cascade, packaging_id uuid references public.packagings(id),
  unit_price numeric(12,2) not null check (unit_price >= 0), currency char(3) not null default 'EUR',
  min_qty numeric(12,3), max_qty numeric(12,3), created_at timestamptz not null default now()
);
create table if not exists public.customer_price_overrides (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id) on delete cascade, packaging_id uuid references public.packagings(id),
  unit_price numeric(12,2) not null check (unit_price >= 0), currency char(3) not null default 'EUR', min_qty numeric(12,3), max_qty numeric(12,3),
  valid_from timestamptz, valid_until timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.moq_rules (
  id uuid primary key default gen_random_uuid(), product_variant_id uuid not null references public.product_variants(id) on delete cascade,
  customer_segment_id uuid references public.customer_segments(id), min_qty numeric(12,3) not null, qty_step numeric(12,3) not null default 1,
  created_at timestamptz not null default now()
);
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(), legal_name text not null, country_code text, registration_number text, vat_number text,
  email text, phone text, status text not null default 'active' check (status in ('active','inactive')), created_at timestamptz not null default now()
);
create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(), supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id) on delete cascade, supplier_sku text, cost_price numeric(12,2),
  currency char(3) default 'EUR', lead_time_days integer, created_at timestamptz not null default now(), unique(supplier_id,product_variant_id)
);
create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(), name text not null, code text not null unique, country_code text not null, city text,
  address_line1 text, postal_code text, timezone text, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(), product_variant_id uuid not null references public.product_variants(id), supplier_id uuid references public.suppliers(id),
  batch_number text not null, catch_date date, production_date date, expiry_date date, origin_country_code text, created_at timestamptz not null default now(),
  unique(batch_number,product_variant_id)
);
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(), warehouse_id uuid not null references public.warehouses(id), batch_id uuid not null references public.batches(id),
  quantity numeric(14,3) not null default 0 check (quantity >= 0), reserved_quantity numeric(14,3) not null default 0 check (reserved_quantity >= 0),
  updated_at timestamptz not null default now(), unique(warehouse_id,batch_id)
);
create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, country_code text not null,
  postal_code_pattern text, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.delivery_rules (
  id uuid primary key default gen_random_uuid(), delivery_zone_id uuid not null references public.delivery_zones(id) on delete cascade,
  min_weight_kg numeric(12,3), max_weight_kg numeric(12,3), min_order_value numeric(12,2), delivery_cost numeric(12,2) not null default 0,
  currency char(3) not null default 'EUR', free_delivery_threshold numeric(12,2), lead_time_days integer, created_at timestamptz not null default now()
);
create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), requested_by uuid references auth.users(id),
  status text not null default 'draft' check (status in ('draft','submitted','reviewing','quoted','accepted','rejected','cancelled')),
  notes text, currency char(3) not null default 'EUR', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.rfq_items (
  id uuid primary key default gen_random_uuid(), rfq_id uuid not null references public.rfqs(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id), packaging_id uuid references public.packagings(id),
  quantity numeric(12,3) not null check (quantity > 0), requested_price numeric(12,2), notes text
);
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(), rfq_id uuid references public.rfqs(id), company_id uuid not null references public.companies(id),
  quote_number text not null unique, status text not null default 'draft' check (status in ('draft','sent','accepted','expired','rejected','cancelled')),
  currency char(3) not null default 'EUR', subtotal numeric(14,2) not null default 0, delivery_cost numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0, valid_until timestamptz, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(), quote_id uuid not null references public.quotes(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id), packaging_id uuid references public.packagings(id),
  product_name_snapshot text not null, sku_snapshot text, quantity numeric(12,3) not null check (quantity > 0), unit_price numeric(12,2) not null check (unit_price >= 0), line_total numeric(14,2) not null check (line_total >= 0)
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), quote_id uuid references public.quotes(id),
  order_number text not null unique, status text not null default 'pending' check (status in ('pending','confirmed','processing','packed','shipped','delivered','cancelled')),
  currency char(3) not null default 'EUR', subtotal numeric(14,2) not null default 0, delivery_cost numeric(14,2) not null default 0, total numeric(14,2) not null default 0,
  billing_address_snapshot jsonb not null default '{}'::jsonb, shipping_address_snapshot jsonb not null default '{}'::jsonb, payment_terms_snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_variant_id uuid references public.product_variants(id),
  packaging_id uuid references public.packagings(id), batch_id uuid references public.batches(id), product_name_snapshot text not null, sku_snapshot text,
  quantity numeric(12,3) not null check (quantity > 0), unit_price numeric(12,2) not null check (unit_price >= 0), line_total numeric(14,2) not null check (line_total >= 0)
);
create table if not exists public.samples (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), product_variant_id uuid not null references public.product_variants(id),
  quantity numeric(12,3) not null check (quantity > 0), paid_amount numeric(12,2) not null default 0, currency char(3) not null default 'EUR',
  status text not null default 'requested' check (status in ('requested','approved','paid','shipped','delivered','cancelled')), created_at timestamptz not null default now()
);
create table if not exists public.sample_credits (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), sample_id uuid not null unique references public.samples(id),
  amount numeric(12,2) not null check (amount >= 0), currency char(3) not null default 'EUR', status text not null default 'available' check (status in ('available','applied','expired','cancelled')),
  applied_order_id uuid references public.orders(id), expires_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), order_id uuid references public.orders(id),
  payment_provider text, provider_payment_id text, method text not null check (method in ('card','paypal','bank_transfer','invoice')),
  status text not null default 'pending' check (status in ('pending','authorized','paid','failed','refunded','cancelled')), amount numeric(14,2) not null check (amount >= 0),
  currency char(3) not null default 'EUR', idempotency_key text unique, paid_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(), company_id uuid references public.companies(id), order_id uuid references public.orders(id), quote_id uuid references public.quotes(id),
  document_type text not null check (document_type in ('invoice','quote','order','delivery_note','company','other')), storage_bucket text not null, storage_path text not null,
  file_name text not null, mime_type text, created_at timestamptz not null default now()
);
create table if not exists public.audit_log (
  id bigint generated always as identity primary key, actor_user_id uuid references auth.users(id), company_id uuid references public.companies(id), action text not null,
  entity_type text not null, entity_id uuid, old_data jsonb, new_data jsonb, ip_address inet, user_agent text, created_at timestamptz not null default now()
);

create index if not exists idx_company_users_user on public.company_users(user_id);
create index if not exists idx_company_users_company on public.company_users(company_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_variants_product on public.product_variants(product_id);
create index if not exists idx_price_list_items_variant on public.price_list_items(product_variant_id);
create index if not exists idx_customer_overrides_company on public.customer_price_overrides(company_id);
create index if not exists idx_inventory_batch on public.inventory(batch_id);
create index if not exists idx_rfqs_company on public.rfqs(company_id);
create index if not exists idx_quotes_company on public.quotes(company_id);
create index if not exists idx_orders_company on public.orders(company_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_documents_company on public.documents(company_id);
create index if not exists idx_audit_entity on public.audit_log(entity_type,entity_id);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_users enable row level security;
alter table public.company_addresses enable row level security;
alter table public.customer_segments enable row level security;
alter table public.price_lists enable row level security;
alter table public.price_list_items enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.packagings enable row level security;
alter table public.customer_price_overrides enable row level security;
alter table public.moq_rules enable row level security;
alter table public.suppliers enable row level security;
alter table public.supplier_products enable row level security;
alter table public.warehouses enable row level security;
alter table public.batches enable row level security;
alter table public.inventory enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.delivery_rules enable row level security;
alter table public.rfqs enable row level security;
alter table public.rfq_items enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.samples enable row level security;
alter table public.sample_credits enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;
alter table public.audit_log enable row level security;
