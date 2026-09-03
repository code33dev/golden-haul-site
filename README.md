# Golden Haul Rentals — Website

The entire website is **one file: `index.html`**.

No build step. No `npm install`. Edit the file, push, it's live.

---

## Deploying to Porkbun

Porkbun static hosting serves files exactly as you upload them — it does not
build anything. That's why this site is a single self-contained HTML file.

**Option A — GitHub Connect (recommended, auto-deploys):**

1. Porkbun → your domain → **Static Hosting**
2. Scroll to **GitHub Connect** → **Connect**
3. Choose "Only select repositories" → pick `code33dev/golden-haul-site`
4. Done. Every push to `main` goes live automatically.

**Option B — FTP:**

Porkbun → Static Hosting → **FTP Credentials**. Upload `index.html`,
`robots.txt`, and `sitemap.xml` to the root folder (`/`).

Upload limit is 40MB. This site is about 25KB.

---

## Changing things

Open `index.html`. Everything you'd normally want to change lives in the
`APP_CONFIG` block near the top:

| Setting | What it does |
|---|---|
| `STRIPE_PAYMENT_URL` | Your Stripe Payment Link. Leave `''` and the site collects bookings by email only. |
| `BOOKING_EMAIL` | Where booking requests get emailed. |
| `WEB3FORMS_KEY` | Free key from [web3forms.com](https://web3forms.com). **Set this.** See below. |
| `PHONE_PRIMARY` / `PHONE_SECONDARY` | Phone numbers shown on the page. |
| `META_PIXEL_ID` | Facebook/Instagram ads pixel. Leave `''` to keep it off. |
| `GOOGLE_TAG_ID` | Google Analytics / Ads tag. Leave `''` to keep it off. |
| `PRICE_BASE` | Flat rental price. |
| `INCLUDED_TONS`, `RENTAL_DAYS` | What's included. |
| `EXTRA_TON`, `EXTRA_DAY` | Overage charges. |
| `FLEET_COUNT` | Number in the gold "dumpsters available" pill. |

The pricing list, phone links, and fleet pill all read from these values —
change the number in one place and the page updates itself.

---

## How booking works

There is no server. Bookings are delivered by Web3Forms, a free form relay.

**Set `WEB3FORMS_KEY` before running any ads.** Go to
[web3forms.com](https://web3forms.com), enter your email, and they send you an
access key. Paste it into `APP_CONFIG`. That's the whole setup — no account,
no dashboard.

**With a key set:**

1. Customer submits → sees a confirmation panel with their details
2. The booking is POSTed to Web3Forms and lands in `BOOKING_EMAIL` inbox
3. **Pay Now** (appears once `STRIPE_PAYMENT_URL` is set) sends them to Stripe,
   carrying `prefilled_email` and a `client_reference_id` so you can match the
   payment to the booking
4. If the send fails, the page falls back to opening their email app and says
   so — the booking is never silently dropped

**Without a key**, the site only opens the customer's email app. Many phones
have no mail app configured, and those bookings vanish with no error on either
end. This is the single most expensive thing to leave unset.

---

## SEO / ranking

Already in the code:

- `LocalBusiness` structured data (JSON-LD) — service area, hours, the offer
- `robots.txt` and `sitemap.xml`
- Fast single-file page, mobile-clean

**Not in the code, and more important than all of the above:** a
**Google Business Profile**. For a local dumpster rental, that is the single
biggest ranking factor. Set it up, verify the address, collect reviews.

### Before running ads

Fill in the two commented-out tags near the top of `index.html`:

```html
<meta property="og:url" content="https://YOURDOMAIN.com/" />
<meta property="og:image" content="https://YOURDOMAIN.com/social-preview.jpg" />
```

Without `og:image`, Facebook and Instagram ad links show no preview picture.
Upload a 1200x630 JPG next to `index.html`.

### Domain check

These files currently assume **goldenhaulrentals.com**. If that's not the
real domain, search and replace it in `robots.txt`, `sitemap.xml`, and the
JSON-LD block in `index.html`.
