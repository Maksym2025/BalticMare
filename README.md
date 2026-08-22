# BalticMare

B2B seafood supply platform for professional buyers in Europe.

## Project structure

```text
BalticMare/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DOMAIN.md
│   ├── PRICING.md
│   ├── DESIGN-SYSTEM.md
│   └── PRIVACY.md
├── frontend/
├── backend/
├── admin/
├── supabase/
├── package.json
└── README.md
```

## Architecture direction

Royal Baltic is being built as a platform rather than a simple webshop. The first layer is a clean public catalog; the architecture can grow around reusable business modules:

- B2B customer registration and approval
- buyer types and customer-specific pricing
- MOQ, pack sizes, weights and availability
- recurring supply agreements
- requests for quotation (RFQ)
- cart/order workflows
- Privacy / Consent Layer
- Supabase authentication and database

The architecture is intentionally pragmatic: low coupling, few moving parts, and no infrastructure without a concrete product need.

## Design workflow

Screens will be created in Google Stitch, transferred to Figma, reviewed against `docs/`, and then implemented in the frontend. Figma is the visual source; the documents in `docs/` are the product/technical source of truth.

## Stack

- React + TypeScript + Vite
- Supabase
- GitHub
- Figma

## Current phase

Foundation and design phase. UI implementation starts after the initial architecture and Figma screens are aligned.
