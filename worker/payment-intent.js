// Golden Haul Rentals — booking payment backend (Cloudflare Worker)
//
// Deploy this as a Cloudflare Worker. Add one secret in the Worker's
// Settings -> Variables: STRIPE_SECRET_KEY (your Stripe secret key,
// starts with sk_live_...). Never put that key anywhere in this repo
// or in client-side code.
//
// Optionally add ALLOWED_ORIGIN (e.g. https://goldenhaulrentals.com)
// to restrict which site can call this Worker. Defaults to allowing
// any origin, which is fine to start with.

const PRICING = {
  base: 37000, // $370.00, in cents
  extraTon: 7500, // $75.00
  extraDay: 2000, // $20.00
  deposit: 15000, // $150.00
  maxExtraTons: 2,
  maxExtraDays: 30,
};

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    if (!env.STRIPE_SECRET_KEY) {
      return json({ error: 'Server is not configured yet' }, 500, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid request' }, 400, cors);
    }

    const required = ['name', 'phone', 'email', 'address', 'date'];
    for (const field of required) {
      if (typeof body[field] !== 'string' || !body[field].trim()) {
        return json({ error: `Missing ${field}` }, 400, cors);
      }
    }

    const extraTons = clampInt(body.extraTons, 0, PRICING.maxExtraTons);
    const extraDays = clampInt(body.extraDays, 0, PRICING.maxExtraDays);
    const amount =
      PRICING.base + extraTons * PRICING.extraTon + extraDays * PRICING.extraDay + PRICING.deposit;

    const params = new URLSearchParams();
    params.set('amount', String(amount));
    params.set('currency', 'usd');
    params.set('automatic_payment_methods[enabled]', 'true');
    params.set('receipt_email', body.email.slice(0, 200));
    params.set('description', '10-Yard Dumpster Rental + $150 Security Deposit');
    params.set('metadata[name]', body.name.slice(0, 200));
    params.set('metadata[phone]', body.phone.slice(0, 60));
    params.set('metadata[email]', body.email.slice(0, 200));
    params.set('metadata[address]', body.address.slice(0, 300));
    params.set('metadata[drop_off_date]', body.date.slice(0, 40));
    params.set('metadata[notes]', String(body.notes || '').slice(0, 500));
    params.set('metadata[extra_tons]', String(extraTons));
    params.set('metadata[extra_days]', String(extraDays));
    params.set('metadata[deposit_cents]', String(PRICING.deposit));

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await stripeRes.json();
    if (!stripeRes.ok) {
      return json({ error: data.error?.message || 'Payment setup failed' }, 502, cors);
    }

    return json({ clientSecret: data.client_secret, amount }, 200, cors);
  },
};

function clampInt(value, min, max) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
