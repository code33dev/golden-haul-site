# Golden Haul Rentals

Lead-generation and booking site for Golden Haul Rentals, with a fully embedded
(no-redirect) card payment flow.

## Stack
- React + Vite, static frontend (Porkbun-hosted)
- `worker/payment-intent.js`: a small Cloudflare Worker backend that creates
  the Stripe charge server-side — required because card payments can never
  be created with a secret key in browser code
- Stripe Payment Element, embedded directly in the page

## Setup
```bash
npm install
npm run dev
```

## Configuration
Set values in `window.APP_CONFIG` inside `index.html`:
- `STRIPE_PUBLISHABLE_KEY` — your Stripe publishable key (`pk_live_...`). Safe to put here; it's meant to be public.
- `PAYMENT_API_URL` — the deployed Cloudflare Worker's URL (see below).
- `META_PIXEL_ID` — loads the Meta Pixel automatically once set; left blank, no script loads.
- `GOOGLE_TAG_ID` — loads Google tag (gtag.js) automatically once set; left blank, no script loads.
- `BOOKING_EMAIL` — fallback inbox. Used only if `STRIPE_PUBLISHABLE_KEY`/`PAYMENT_API_URL` aren't set yet.

## Deploying the payment backend (Worker)
The frontend cannot create a Stripe charge on its own — that requires a secret
key, which must never appear in browser code or in this repo. `worker/payment-intent.js`
is a standalone Cloudflare Worker that does this safely:

1. Create a free Cloudflare account, then **Workers & Pages → Create → Create Worker**.
2. Paste the contents of `worker/payment-intent.js` into the editor and deploy.
3. In the Worker's **Settings → Variables**, add a secret named `STRIPE_SECRET_KEY`
   with your Stripe secret key (`sk_live_...`). Never commit this key anywhere.
4. Optionally add `ALLOWED_ORIGIN` set to your site's URL, to restrict which
   site can call the Worker.
5. Copy the Worker's URL into `PAYMENT_API_URL` in `index.html`.

## Launch notes
- Replace `logo.png` with the final logo asset (currently a placeholder, and not yet wired into the page).
- Add tracking IDs before spending on ads.
