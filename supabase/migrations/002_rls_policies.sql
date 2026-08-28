-- Royal Baltic Seafood / BalticMare
-- 002_rls_policies.sql
-- Security boundary for public Data API

create schema if not exists private;

-- Membership helpers avoid recursive RLS evaluation on company_users.
create or replace function private.user_company_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select cu.company_id
  from public.company_users cu
  where cu.user_id = (select auth.uid())
    and cu.is_active = true;
$$;

create or replace function private.is_company_member(target_company_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_users cu
    where cu.company_id = target_company_id
      and cu.user_id = (select auth.uid())
      and cu.is_active = true
  );
$$;

revoke all on function private.user_company_ids() from public;
revoke all on function private.is_company_member(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.user_company_ids() to authenticated;
grant execute on function private.is_company_member(uuid) to authenticated;

-- Least-privilege Data API grants.
revoke all on all tables in schema public from anon, authenticated;

-- Public catalog: products only, never prices.
grant select on public.products to anon, authenticated;
grant select on public.product_variants to anon, authenticated;
grant select on public.packagings to anon, authenticated;

-- Authenticated customer account access.
grant select, update on public.profiles to authenticated;
grant select on public.companies to authenticated;
grant select on public.company_users to authenticated;
grant select, insert, update, delete on public.company_addresses to authenticated;
grant select on public.rfqs to authenticated;
grant insert, update, delete on public.rfqs to authenticated;
grant select on public.rfq_items to authenticated;
grant insert, update, delete on public.rfq_items to authenticated;
grant select on public.quotes to authenticated;
grant select on public.quote_items to authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select on public.samples to authenticated;
grant insert on public.samples to authenticated;
grant select on public.sample_credits to authenticated;
grant select on public.payments to authenticated;
grant select on public.documents to authenticated;

-- Do not expose pricing, inventory, suppliers, delivery rules, audit data or payment writes directly.

-- Profiles: user sees/updates only own profile.
create policy profiles_select_own on public.profiles
for select to authenticated
using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Companies: members can read only their company.
create policy companies_select_member on public.companies
for select to authenticated
using (id in (select private.user_company_ids()));

-- Company users: member can see membership of their company.
create policy company_users_select_member on public.company_users
for select to authenticated
using (company_id in (select private.user_company_ids()));

-- Addresses: company members can read; owner/admin can write.
create policy company_addresses_select_member on public.company_addresses
for select to authenticated
using (company_id in (select private.user_company_ids()));
create policy company_addresses_insert_admin on public.company_addresses
for insert to authenticated
with check (
  company_id in (select private.user_company_ids())
  and exists (
    select 1 from public.company_users cu
    where cu.company_id = company_addresses.company_id
      and cu.user_id = (select auth.uid())
      and cu.is_active = true
      and cu.role in ('owner','admin')
  )
);
create policy company_addresses_update_admin on public.company_addresses
for update to authenticated
using (
  company_id in (select private.user_company_ids())
  and exists (
    select 1 from public.company_users cu
    where cu.company_id = company_addresses.company_id
      and cu.user_id = (select auth.uid())
      and cu.is_active = true
      and cu.role in ('owner','admin')
  )
)
with check (company_id in (select private.user_company_ids()));
create policy company_addresses_delete_admin on public.company_addresses
for delete to authenticated
using (
  company_id in (select private.user_company_ids())
  and exists (
    select 1 from public.company_users cu
    where cu.company_id = company_addresses.company_id
      and cu.user_id = (select auth.uid())
      and cu.is_active = true
      and cu.role in ('owner','admin')
  )
);

-- Public catalog: active products only; variants only for active products.
create policy products_public_active on public.products
for select to anon, authenticated
using (status = 'active');
create policy variants_public_active on public.product_variants
for select to anon, authenticated
using (exists (select 1 from public.products p where p.id = product_variants.product_id and p.status = 'active'));
create policy packagings_public on public.packagings
for select to anon, authenticated
using (true);

-- RFQs: only members of the owning company.
create policy rfqs_select_member on public.rfqs
for select to authenticated
using (company_id in (select private.user_company_ids()));
create policy rfqs_insert_member on public.rfqs
for insert to authenticated
with check (company_id in (select private.user_company_ids()) and requested_by = (select auth.uid()));
create policy rfqs_update_member on public.rfqs
for update to authenticated
using (company_id in (select private.user_company_ids()))
with check (company_id in (select private.user_company_ids()));
create policy rfqs_delete_member on public.rfqs
for delete to authenticated
using (company_id in (select private.user_company_ids()));

-- RFQ items follow the parent RFQ company.
create policy rfq_items_select_member on public.rfq_items
for select to authenticated
using (exists (select 1 from public.rfqs r where r.id = rfq_items.rfq_id and r.company_id in (select private.user_company_ids())));
create policy rfq_items_insert_member on public.rfq_items
for insert to authenticated
with check (exists (select 1 from public.rfqs r where r.id = rfq_items.rfq_id and r.company_id in (select private.user_company_ids())));
create policy rfq_items_update_member on public.rfq_items
for update to authenticated
using (exists (select 1 from public.rfqs r where r.id = rfq_items.rfq_id and r.company_id in (select private.user_company_ids())))
with check (exists (select 1 from public.rfqs r where r.id = rfq_items.rfq_id and r.company_id in (select private.user_company_ids())));
create policy rfq_items_delete_member on public.rfq_items
for delete to authenticated
using (exists (select 1 from public.rfqs r where r.id = rfq_items.rfq_id and r.company_id in (select private.user_company_ids())));

-- Quotes and quote items are read-only for customers; creation/modification is backend/admin work.
create policy quotes_select_member on public.quotes
for select to authenticated
using (company_id in (select private.user_company_ids()));
create policy quote_items_select_member on public.quote_items
for select to authenticated
using (exists (select 1 from public.quotes q where q.id = quote_items.quote_id and q.company_id in (select private.user_company_ids())));

-- Orders and items are read-only for customers; creation is a protected server operation.
create policy orders_select_member on public.orders
for select to authenticated
using (company_id in (select private.user_company_ids()));
create policy order_items_select_member on public.order_items
for select to authenticated
using (exists (select 1 from public.orders o where o.id = order_items.order_id and o.company_id in (select private.user_company_ids())));

-- Samples and credits belong to the customer's company.
create policy samples_select_member on public.samples
for select to authenticated
using (company_id in (select private.user_company_ids()));
create policy samples_insert_member on public.samples
for insert to authenticated
with check (company_id in (select private.user_company_ids()));
create policy sample_credits_select_member on public.sample_credits
for select to authenticated
using (company_id in (select private.user_company_ids()));

-- Payment records are read-only to customers.
create policy payments_select_member on public.payments
for select to authenticated
using (company_id in (select private.user_company_ids()));

-- Documents: only documents belonging to the customer's company.
create policy documents_select_member on public.documents
for select to authenticated
using (company_id in (select private.user_company_ids()));

-- Explicitly no anon access to customer, pricing, payment, inventory, supplier or audit tables.
-- No direct customer writes to pricing, inventory, payments, quotes, orders or audit_log.
