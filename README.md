# Royal Baltic

B2B seafood supply platform for professional buyers in Europe.

## Direction

Royal Baltic is being built as a platform rather than a simple webshop. The first layer is a clean public catalog; the architecture will grow around reusable business modules:

- B2B customer registration and approval
- buyer types and customer-specific pricing
- MOQ, pack sizes, weights and availability
- recurring supply agreements
- requests for quotation (RFQ)
- cart/order workflows
- Privacy / Consent Layer
- Supabase backend and authentication

## Stack

- React + TypeScript
- Vite
- Supabase (planned)
- GitHub / Codex workflow
- Vercel deployment / CDN-ready media

## Run locally

```bash
npm install
npm run dev
```

## Hero video delivery

The Hero reads these Vite environment variables:

- `VITE_HERO_VIDEO_URL` — production MP4 URL, preferably from Vercel Blob or another CDN
- `VITE_HERO_POSTER_URL` — poster/fallback image URL

If the variables are not set, the app falls back to:

- `/hero/royal-baltic-hero.mp4`
- `/hero/royal-baltic-hero.jpg`

Recommended production setup:

1. Upload the final MP4 and poster image to Vercel Blob (or another CDN).
2. Set `VITE_HERO_VIDEO_URL` and `VITE_HERO_POSTER_URL` in the Vercel project environment for Production and Preview.
3. Redeploy and verify that the MP4 is served from the CDN, the poster appears before playback, and the reduced-motion fallback still works.
4. Keep the binary video out of Git once the CDN URLs are active.
