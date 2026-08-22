# Design System

Figma is the visual design source. This document is the implementation contract between Figma and the frontend.

## Direction

Royal Baltic should feel premium, maritime and trustworthy without becoming decorative or luxury-fashion-like. B2B usability comes first.

## Principles

- Clear hierarchy.
- Strong product imagery.
- Fast scanning of price, pack, weight, MOQ and availability.
- Responsive by default.
- Accessible contrast and keyboard navigation.
- Components should map cleanly between Figma and React.

## Tokens

The final colors, typography, spacing, radii, shadows and component states will be extracted from the approved Figma design rather than invented separately in code.

## Component families

- Header / navigation
- Product card
- Product detail
- Price / price state
- Availability badge
- MOQ / pack selector
- Filters
- Search
- Cart
- RFQ form
- B2B registration
- Account navigation
- Tables
- Forms
- Modal / drawer
- Toast / notification

## Figma workflow

Stitch → Figma → design review against this document → frontend implementation → visual QA.

If a Figma screen conflicts with a business rule in `docs/DOMAIN.md`, `docs/PRICING.md` or `docs/ARCHITECTURE.md`, stop and resolve the conflict instead of silently coding around it.
