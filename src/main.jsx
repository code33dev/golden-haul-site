import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadStripe } from '@stripe/stripe-js';
import './styles.css';

const pricing = {
  base: 370,
  includedTons: 1,
  extraWeight: 75,
  extraDay: 20,
  deposit: 150,
  maxExtraTons: 2,
  maxExtraDays: 30,
};

const accepted = [
  { title: 'Household', items: 'Furniture, appliances, mattresses, general debris.' },
  { title: 'Construction', items: 'Drywall, wood, siding, concrete, brick, stone, asphalt, etc.' },
  { title: 'Yard Waste', items: 'Brush, branches, grass, leaves.' },
];

const restricted = [
  { title: 'Hazardous/Chemicals', items: 'Paint, pesticides, solvents, oils.' },
  { title: 'Automotive', items: 'Tires, batteries, antifreeze, fluids.' },
  { title: 'Flammable', items: 'Propane tanks, fuel, gasoline.' },
  { title: 'Prohibited', items: 'Medical waste, asbestos, electronics, etc.' },
];

const fields = [
  { name: 'name', label: 'Full name', type: 'text', required: true },
  { name: 'phone', label: 'Phone number', type: 'tel', required: true },
  { name: 'email', label: 'Email address', type: 'email', required: true },
  { name: 'address', label: 'Service address or ZIP code', type: 'text', required: true },
  { name: 'date', label: 'Desired drop-off date', type: 'date', required: true, min: true },
];

function appConfig() {
  return window.APP_CONFIG || {};
}

function loadAnalytics(config) {
  if (config.GOOGLE_TAG_ID && !window.gtag) {
    const loader = document.createElement('script');
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${config.GOOGLE_TAG_ID}`;
    document.head.appendChild(loader);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', config.GOOGLE_TAG_ID);
  }

  if (config.META_PIXEL_ID && !window.fbq) {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', config.META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
}

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function totalDue(extraTons, extraDays) {
  return pricing.base + extraTons * pricing.extraWeight + extraDays * pricing.extraDay + pricing.deposit;
}

// Custom on-page checkout: collects booking details, asks our backend
// (Worker) to create a Stripe PaymentIntent for the correct amount, then
// mounts Stripe's Payment Element right on this page — no redirect.
function CustomCheckout({ config }) {
  const [phase, setPhase] = useState('details'); // details -> payment -> success
  const [extraTons, setExtraTons] = useState(0);
  const [extraDays, setExtraDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [details, setDetails] = useState(null);

  const stripeRef = useRef(null);
  const elementsRef = useRef(null);
  const paymentElRef = useRef(null);

  const total = totalDue(extraTons, extraDays);

  const handleDetailsSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    setDetails(data);
    setLoading(true);

    try {
      const res = await fetch(config.PAYMENT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, extraTons, extraDays }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Could not start payment. Please try again.');
      }

      if (!stripeRef.current) {
        stripeRef.current = await loadStripe(config.STRIPE_PUBLISHABLE_KEY);
      }
      const elements = stripeRef.current.elements({
        clientSecret: result.clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#f2b705',
            colorBackground: '#090909',
            colorText: '#f7f4ea',
            colorDanger: '#ff6b6b',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '14px',
          },
        },
      });
      elementsRef.current = elements;
      setPhase('payment');
    } catch (err) {
      const friendly = err instanceof TypeError ? "Couldn't reach the payment server. Please try again in a moment." : err.message;
      setErrorMsg(friendly || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phase === 'payment' && elementsRef.current && paymentElRef.current) {
      const paymentElement = elementsRef.current.create('payment');
      paymentElement.mount(paymentElRef.current);
      return () => paymentElement.unmount();
    }
  }, [phase]);

  const handlePaySubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { error } = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      redirect: 'if_required',
      confirmParams: {
        receipt_email: details?.email,
      },
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message || 'Payment failed. Please check your card details and try again.');
      return;
    }
    setPhase('success');
  };

  if (phase === 'success') {
    return (
      <div className="note success">
        Booking confirmed and paid — thank you, {details?.name?.split(' ')[0] || 'friend'}! We'll text or call{' '}
        {details?.phone} to confirm the drop-off window for {details?.date}.
      </div>
    );
  }

  if (phase === 'payment') {
    return (
      <>
        <p className="panel-copy">Total due: ${total}. Enter payment details below to complete your booking.</p>
        <form className="booking-form" onSubmit={handlePaySubmit}>
          <div ref={paymentElRef} />
          {errorMsg && <div className="note error">{errorMsg}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Processing…' : `Pay $${total} Now`}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => setPhase('details')} disabled={loading}>
            Back
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <p className="panel-copy">Fill in your booking details, then pay securely — right here, no redirect.</p>
      <form className="booking-form" onSubmit={handleDetailsSubmit}>
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            <input
              name={field.name}
              type={field.type}
              required={field.required}
              min={field.min ? todayISO() : undefined}
            />
          </label>
        ))}
        <label>
          <span>Extra tons beyond the {pricing.includedTons} included (${pricing.extraWeight}/ton)</span>
          <select name="extraTonsSelect" value={extraTons} onChange={(e) => setExtraTons(Number(e.target.value))}>
            {Array.from({ length: pricing.maxExtraTons + 1 }, (_, n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Extra days beyond the 3-day rental (${pricing.extraDay}/day)</span>
          <select name="extraDaysSelect" value={extraDays} onChange={(e) => setExtraDays(Number(e.target.value))}>
            {Array.from({ length: pricing.maxExtraDays + 1 }, (_, n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Notes</span>
          <textarea name="notes" rows="4" placeholder="Access instructions, project details, or special requests" />
        </label>
        <div className="price-total">Total due today: ${total} (includes ${pricing.deposit} refundable deposit)</div>
        {errorMsg && <div className="note error">{errorMsg}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Loading payment…' : 'Continue to Payment'}
        </button>
      </form>
    </>
  );
}

function EmailFallbackForm({ config }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const body = encodeURIComponent(
      [
        'Booking request:',
        `Name: ${data.name}`,
        `Phone: ${data.phone}`,
        `Email: ${data.email}`,
        `Address: ${data.address}`,
        `Desired date: ${data.date}`,
        `Notes: ${data.notes || 'N/A'}`,
        'Payment required before drop-off.',
      ].join('%0A')
    );
    window.location.href = `mailto:${config.BOOKING_EMAIL}?subject=Golden%20Haul%20Booking%20Request&body=${body}`;
  };

  return (
    <>
      <p className="panel-copy">Submit the request and we'll follow up to collect payment. Payment is required before drop-off.</p>
      <form className="booking-form" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            <input
              name={field.name}
              type={field.type}
              required={field.required}
              min={field.min ? todayISO() : undefined}
            />
          </label>
        ))}
        <label>
          <span>Notes</span>
          <textarea name="notes" rows="4" placeholder="Access instructions, project details, or special requests" />
        </label>
        <button className="btn btn-primary" type="submit">Send Booking Request</button>
      </form>
      <div className="note">Online payment isn't connected yet — requests go to {config.BOOKING_EMAIL} for manual follow-up.</div>
    </>
  );
}

function App() {
  const config = appConfig();
  const paymentReady = Boolean(config.STRIPE_PUBLISHABLE_KEY && config.PAYMENT_API_URL);

  useEffect(() => {
    loadAnalytics(config);
  }, []);

  return (
    <>
      <main className="shell">
        <section className="hero">
          <div className="logo-mark">
            <div className="logo-trailer">▣</div>
            <div>
              <div className="brand">Golden Haul Rentals</div>
              <div className="tagline">Book online • Pay before drop-off • Fast local service</div>
            </div>
          </div>
          <h1>Dumpster rental booking that keeps the customer flow simple.</h1>
          <p className="lead">
            A premium black-and-gold experience for fast calls, quick quoting, and secure payment before drop-off.
            Built for Porkbun-hosted static deployment and ad traffic.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#book">Book Now</a>
            <a className="btn btn-secondary" href="tel:+13135057607">Call +1 (313) 505-7607</a>
          </div>
          <div className="fleet">Current fleet: 2 dumpsters available</div>
        </section>

        <section className="grid">
          <article className="panel pricing">
            <h2>Rental Pricing</h2>
            <div className="price">10-Yard Dumpster Rental: ${pricing.base}</div>
            <ul>
              <li>{pricing.includedTons} ton included</li>
              <li>Delivery &amp; pick-up included</li>
              <li>3-day rental</li>
              <li>Extra weight: ${pricing.extraWeight} per ton</li>
              <li>After 3-day rental period: ${pricing.extraDay} per additional day</li>
              <li>${pricing.deposit} refundable security deposit, charged at booking — refunded after a clean, on-time return; forfeited for prohibited materials or damage</li>
            </ul>
            <div className="price-total">Due at booking: ${pricing.base + pricing.deposit}+</div>
          </article>

          <article className="panel book" id="book">
            <h2>Book &amp; Pay</h2>
            {paymentReady ? <CustomCheckout config={config} /> : <EmailFallbackForm config={config} />}
          </article>

          <article className="panel materials">
            <div className="two-up">
              <div>
                <h3>Accepted Materials</h3>
                {accepted.map((item) => (
                  <div className="material" key={item.title}>
                    <strong>{item.title}:</strong> {item.items}
                  </div>
                ))}
              </div>
              <div>
                <h3>Restricted Materials</h3>
                {restricted.map((item) => (
                  <div className="material" key={item.title}>
                    <strong>{item.title}:</strong> {item.items}
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>
      </main>

      <footer className="footer">
        <div>Golden Haul Rentals • Black and gold dumpster rentals • Ready for Porkbun hosting</div>
        <div className="phones">
          <a href="tel:+13135057607">+1 (313) 505-7607</a>
          <a href="tel:+17343340268">+1 (734) 334-0268</a>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
