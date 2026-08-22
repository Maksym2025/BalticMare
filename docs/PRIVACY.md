# Privacy

Privacy is a platform capability and should not be scattered through individual screens.

## Privacy / Consent Layer

The layer is responsible for:

- consent collection;
- consent categories and purposes;
- consent state and versioning;
- withdrawal/change of consent;
- privacy preferences UI;
- records needed to demonstrate consent;
- integration boundaries for analytics and marketing tools.

## Principles

1. Necessary processing must not be blocked by optional marketing consent.
2. Optional analytics/marketing integrations must respect consent state before activation.
3. Consent records need purpose, policy/version, timestamp and subject context.
4. Privacy controls should be reusable across frontend and account settings.
5. Do not place personal data in logs unless there is a justified operational need.
6. Security and data retention decisions must be documented before production launch.

## Germany / EU

The implementation will be designed for GDPR requirements. Legal wording, retention periods and controller/processor details require final business/legal confirmation before production.

## Architecture boundary

The Privacy / Consent Layer should expose a small application API to the frontend rather than forcing every component to know the details of the consent storage implementation.
