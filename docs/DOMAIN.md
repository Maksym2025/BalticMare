# Domain

## Business model

BalticMare connects seafood supply with professional buyers. The platform must support both transparent catalog browsing and negotiated B2B commerce.

## Core concepts

**Organization** — the legal/commercial buyer account.

**User** — an authenticated person acting for an organization.

**Customer type** — a commercial segment such as restaurant, distributor or other professional buyer.

**Product** — the commercial seafood item.

**Variant** — a concrete sellable form of a product, including pack/weight/format.

**Availability** — whether and when a variant can be supplied.

**Price list** — a set of prices applicable to a defined commercial context.

**MOQ** — minimum order quantity/rule for a product or variant.

**RFQ** — request for quotation when standard catalog pricing is insufficient.

**Order** — accepted commercial purchase.

**Recurring supply** — an agreement or workflow for regular deliveries.

## Important distinction

Product data, commercial rules and presentation are different concerns. A product card must not become the source of truth for pricing, availability or permissions.

## State examples

Customer: `pending → approved → suspended`

RFQ: `draft → submitted → quoted → accepted | rejected | expired`

Order: `draft → placed → confirmed → fulfilled | cancelled`

These are domain starting points, not final database enums. Workflows should remain extensible.
