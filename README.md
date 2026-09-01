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
- `STRIPE_PAYMENT_URL`
- `META_PIXEL_ID`
- `GOOGLE_TAG_ID`
- `BOOKING_EMAIL`

## Launch notes
- Replace `logo.png` with the final logo asset.
- Connect Stripe Checkout or a Stripe Payment Link.
- Hook your booking intake to email, form backend, or CRM.
- Add tracking IDs before launch.
