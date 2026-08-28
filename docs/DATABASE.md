# Royal Baltic Seafood — Backend / Database Architecture

**Status:** APPROVED FOUNDATION — 2026-08-28

This document is the backend source of truth for the Royal Baltic Seafood B2B platform. The implementation uses a **modular monolith** architecture with **Supabase/PostgreSQL** as the backend foundation. We do not split the MVP into microservices.

## 1. Core business flow

`Supabase → Catalog → B2B Customer → Customer Segment → Price List → Customer Override → Cart → RFQ/Quote or Order → Payment → Logistics → Documents`

Public visitors can browse the catalog, but **prices are not exposed before B2B registration/approval**. Approved B2B customers receive their applicable personalized pricing.

## 2. Identity and companies

- `auth.users` — Supabase Auth identity.
- `profiles` — user profile linked to `auth.users`.
- `companies` — B2B customer companies.
- `company_users` — users belonging to companies, with company roles.
- `company_addresses` — billing and delivery addresses.
- Customer approval is an explicit workflow; only approved companies receive protected B2B pricing and ordering capabilities.

## 3. Customer segmentation and pricing

The pricing hierarchy is intentionally preserved:

**Company → Segment → Price List → Customer Override**

Tables/domains:
- `customer_segments`
- `price_lists`
- `price_list_items`
- `customer_price_overrides`
- `moq_rules`
- delivery/pricing rules as separate domain data

Pricing must be calculated server-side. Never trust a price sent by the browser.

Primary protected operations:
- `calculate_price`
- customer eligibility checks
- MOQ validation
- delivery calculation

## 4. Catalog

- `products`
- `product_variants`
- `packagings`

The catalog must support frozen seafood, variants, packaging, logistics data and product status. Product and order snapshots are required so historical orders do not change when catalog data changes.

## 5. RFQ → Quote → Order

B2B sales may follow either direct checkout or negotiated flow:

`RFQ → RFQ items → Quote → Quote items → Order → Order items`

Orders must store immutable snapshots of:
- product information
- variant/packaging
- agreed unit price
- quantity
- delivery/billing address
- relevant commercial terms

Protected server operations include:
- `accept_quote`
- `create_order`

## 6. Samples and credits

Support the sample workflow:
- `samples`
- `sample_credits`

A paid sample may later generate a credit that is applied to a qualifying B2B order through a server-side operation such as `apply_sample_credit`.

## 7. Inventory and supply

Inventory is a separate domain and must be batch-aware:
- `suppliers`
- supplier/product relationships
- `warehouses`
- `batches`
- `inventory`

Reservation is server-side through `reserve_inventory`. The system must not allow browser-side quantity manipulation or overselling.

## 8. Delivery / logistics

Dedicated logistics data:
- `delivery_zones`
- `delivery_rules`
- customer logistics information

Server-side `calculate_delivery` determines applicable delivery rules/costs. Frozen-product logistics and destination constraints belong to this layer, not hard-coded into frontend components.

## 9. Payments and accounting integration

Payment is a separate **Payment Layer**.

Supported business paths:
- card payment
- PayPal
- B2B invoice/payment terms
- bank transfer for pallet/large wholesale orders where applicable

Database domain:
- `payments` / transactions
- payment status and provider references
- idempotency/reference data

Accounting/invoicing integration is represented by document/reference data for **sevDesk**. The payment layer must remain decoupled from the frontend and from accounting implementation details.

## 10. Documents

Documents are stored in **Supabase Storage**, with PostgreSQL metadata in a documents table.

Examples:
- invoices
- quotes
- order documents
- delivery documents
- customer/company documents

Storage access must be protected by authorization policies; public URLs must not expose private customer documents.

## 11. Security / RLS

**Row Level Security is mandatory.**

Rules:
- anonymous visitors: public catalog content only; no prices, customer data, orders or private documents
- authenticated customer users: only their own profile/company/account data and authorized company data
- customer users: only prices calculated for their authorized company/segment/overrides
- customer users: only their company's RFQs, quotes, orders, payments and documents
- admin/staff: explicit privileged access according to role

Pricing protection is reinforced with server-side RPCs/functions. Do not rely on hiding UI elements as a security mechanism.

## 12. Auditability

Include:
- created/updated timestamps
- update triggers where appropriate
- audit trail for sensitive business actions
- approval history
- payment/order status transitions where needed

The backend must be able to answer who changed important commercial/customer data and when.

## 13. Initial Supabase schema domains

```text
AUTH
  auth.users
  profiles
  company_users
  companies
  company_addresses

CUSTOMER / PRICING
  customer_segments
  price_lists
  price_list_items
  customer_price_overrides
  moq_rules

CATALOG
  products
  product_variants
  packagings

SUPPLY / INVENTORY
  suppliers
  supplier_products
  warehouses
  batches
  inventory

SALES
  rfqs
  rfq_items
  quotes
  quote_items
  orders
  order_items

SAMPLES
  samples
  sample_credits

LOGISTICS
  delivery_zones
  delivery_rules

PAYMENTS / DOCUMENTS
  payments
  documents

AUDIT / CONSENT
  audit_log
  optional consent audit records
```

## 14. Server-side operations

The first protected business API/RPC surface should include:

```text
calculate_price
calculate_delivery
create_order
accept_quote
apply_sample_credit
reserve_inventory
approve_company
```

These operations are the business boundary between Next.js/frontend and Supabase data. Direct client writes to sensitive commercial tables should be minimized or prohibited by RLS.

## 15. Frontend contract

The frontend is **Next.js + TypeScript** and consumes this backend contract. UI components must not invent business rules.

The website flow is:

`Public Home → Catalog (no prices) → B2B Registration → Approval/Auth → Personal Account → Personalized Catalog/Pricing → Cart → Checkout/RFQ → Payment/Invoice → Order → Delivery`

## 16. Implementation rule

This document is the approved foundation. Changes to the schema must be made deliberately through migrations and reflected back into this document. Before production, run migration, RLS/security, constraint/index and performance checks.
