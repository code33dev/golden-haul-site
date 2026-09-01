import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const pricing = {
  base: 370,
  includedTons: 1,
  extraWeight: 75,
  extraDay: 20,
  deposit: 150,
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

function App() {
  const config = appConfig();

  useEffect(() => {
    loadAnalytics(config);
  }, []);

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
        `Dumpster size: ${data.size}`,
        `Notes: ${data.notes || 'N/A'}`,
        'Payment required before drop-off.',
      ].join('%0A')
    );

    if (config.STRIPE_PAYMENT_URL) {
      window.location.href = config.STRIPE_PAYMENT_URL;
      return;
    }

    window.location.href = `mailto:${config.BOOKING_EMAIL}?subject=Golden%20Haul%20Booking%20Request&body=${body}`;
  };

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
            <div className="price-total">Due at booking: ${pricing.base + pricing.deposit}</div>
          </article>

          <article className="panel book" id="book">
            <h2>Book &amp; Pay</h2>
            {config.STRIPE_PAYMENT_URL ? (
              <>
                <p className="panel-copy">
                  You'll enter your address, drop-off date, and notes on the secure Stripe payment page.
                  Total due today: ${pricing.base + pricing.deposit} (${pricing.base} rental + ${pricing.deposit} refundable deposit).
                </p>
                <a className="btn btn-primary" href={config.STRIPE_PAYMENT_URL}>Proceed to Payment</a>
              </>
            ) : (
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
                    <span>Dumpster size</span>
                    <select name="size" required>
                      <option value="">Select size</option>
                      <option>10-yard</option>
                    </select>
                  </label>
                  <label>
                    <span>Notes</span>
                    <textarea name="notes" rows="4" placeholder="Access instructions, project details, or special requests" />
                  </label>
                  <button className="btn btn-primary" type="submit">Send Booking Request</button>
                </form>
                <div className="note">Online payment isn't connected yet — requests go to {config.BOOKING_EMAIL} for manual follow-up.</div>
              </>
            )}
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
