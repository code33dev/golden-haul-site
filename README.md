# Golden Haul Rentals

Static lead-generation site for Golden Haul Rentals.

## Stack
- React + Vite
- Static hosting friendly
- Stripe-ready booking flow

## Setup
```bash
npm install
npm run dev
```

## Configuration
Set values in `window.APP_CONFIG` inside `index.html`:
- `STRIPE_PAYMENT_URL` — if set, the booking form redirects here instead of opening the email fallback. Note: the form's entered details (date, address, notes) are not passed to Stripe; a form backend or automation step is needed to carry them through.
- `META_PIXEL_ID` — loads the Meta Pixel automatically once set; left blank, no script loads.
- `GOOGLE_TAG_ID` — loads Google tag (gtag.js) automatically once set; left blank, no script loads.
- `BOOKING_EMAIL` — must be a real, monitored inbox; it's currently the only working submission path since `STRIPE_PAYMENT_URL` is blank.

## Launch notes
- Replace `logo.png` with the final logo asset.
- Connect Stripe Checkout or a Stripe Payment Link.
- Hook your booking intake to email, form backend, or CRM.
- Add tracking IDs before launch.
