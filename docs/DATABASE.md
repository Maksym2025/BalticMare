# Database

Supabase PostgreSQL is the primary data store.

## Core areas

- `organizations` — B2B customer companies.
- `users / profiles` — authenticated users and application profile data.
- `organization_members` — user membership and roles.
- `customer_types` — buyer segments and commercial rules.
- `products` — sellable seafood products.
- `product_variants` — pack, weight, format and other sellable variants.
- `availability` — stock / supply status and dates.
- `price_lists` — reusable commercial price lists.
- `price_rules` — customer/customer-type specific pricing rules.
- `rfqs` / `rfq_items` — quotation requests.
- `orders` / `order_items` — confirmed purchases.
- `consents` — privacy and consent records.

## Rules

- Foreign keys for real relationships.
- Money stored as numeric values with explicit currency; never floating point.
- Timestamps stored consistently in UTC.
- Business identifiers are separate from display labels.
- Audit-sensitive records should be append-only or versioned where appropriate.
- Row Level Security is enabled for exposed application tables.

## Source of truth

This document describes the intended model. Concrete SQL migrations in `supabase/` become the executable schema.
