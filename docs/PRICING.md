# Pricing

Pricing is a domain capability, not a frontend calculation.

## Requirements

The platform may support:

- public indicative pricing;
- approved B2B customer pricing;
- customer-type pricing;
- organization-specific price lists;
- negotiated quotation prices;
- currency and VAT presentation rules;
- MOQ and pack-size constraints;
- validity periods for prices.

## Priority

When several prices could apply, the system needs an explicit deterministic priority. Initial direction:

1. accepted RFQ / negotiated price;
2. organization-specific price;
3. customer-type price;
4. applicable standard price;
5. public/indicative price.

The exact rule is subject to validation before implementation.

## Security

The browser may display a calculated price but must never be trusted to decide what a customer is entitled to pay. Authoritative pricing decisions occur in trusted server/database logic.

## Money

Use decimal/numeric storage and explicit ISO currency codes. Avoid binary floating-point arithmetic for monetary values.
