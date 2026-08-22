# Architecture

## Goal

Build BalticMare as a modular B2B seafood platform for professional European buyers, not as a one-off webshop.

## Layers

```text
Figma / Design System
        ↓
Frontend (React + TypeScript)
        ↓
Application / Domain services
        ↓
Supabase (Postgres + Auth + Storage + RLS)
        ↓
External services / integrations
```

## Applications

- `frontend/` — public catalog, buyer area, RFQ/order flows.
- `admin/` — internal catalog, customer, pricing, RFQ and order management.
- `backend/` — only for application logic that should not live in the browser or directly in Supabase.
- `supabase/` — migrations, RLS policies, functions and configuration.

## Principles

1. Keep the architecture simple.
2. Separate business rules from UI.
3. Keep domain concepts stable and infrastructure replaceable.
4. Use Supabase directly where that is sufficient; add a backend service only when there is a real boundary or security/business reason.
5. Never encode customer-specific pricing or permissions only in frontend code.
6. Treat RLS and server-side authorization as security boundaries.
7. Design reusable modules, but do not build a generic framework before it is needed.

## Main modules

- Catalog
- Products / variants / packaging
- Inventory and availability
- B2B organizations and users
- Customer approval
- Customer types
- Pricing
- MOQ / pack rules
- RFQ
- Orders
- Recurring supply
- Privacy / Consent
- Notifications
- Administration

## Request flow

Public catalog → authentication/registration → organization approval → customer-specific catalog/pricing → RFQ/cart/order → fulfillment/integration.

## Decision rule

When a feature can be implemented cleanly with an existing layer, do that first. New services, queues, abstractions or dependencies require a concrete reason documented in this file or the relevant module documentation.
