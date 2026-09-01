import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const pricing = {
  base: 370,
  includedTons: 1,
  extraWeight: 75,
  extraDay: 20,
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
  { name: 'date', label: 'Desired drop-off date', type: 'date', required: true },
];

function appConfig() {
  return window.APP_CONFIG || {};
}

function App() {
  const config = appConfig();

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
          <h1>2 Ten-Yard Dumpsters. Ready to Roll.</h1>
          <p className="lead">
            Fast same-week delivery in your area. Fill out the form below or call/text us to lock in your rental
            before the next customer does. No hidden fees. Payment before drop-off keeps everything simple.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#book">Book Now</a>
            <a className="btn btn-secondary" href="tel:+13135057607">Call +1 (313) 505-7607</a>
          </div>
          <div className="fleet">⚠ Only 2 units available — book before they're gone</div>
        </section>

        <section className="grid">
          <article className="panel pricing">
            <h2>Rental Pricing</h2>
            <div className="price">10-Yard Dumpster Rental: ${pricing.base}</div>
            <ul>
              <li>{pricing.includedTons} ton included</li>
              <li>Delivery &amp; pick-up included</li>
              <li>3-day rental</li>
              <li>No hidden fees</li>
              <li>Extra weight: ${pricing.extraWeight} per ton</li>
              <li>After 3-day rental period: ${pricing.extraDay} per additional day</li>
            </ul>
          </article>

          <article className="panel book" id="book">
            <h2>Get a Quote &amp; Lock In Your Dumpster</h2>
            <p className="panel-copy">We have <strong style={{color:'var(--gold)'}}>2 units available right now.</strong> Submit the form and we'll confirm your date within the hour. Payment is required before drop-off.</p>
            <form className="booking-form" onSubmit={handleSubmit}>
              {fields.map((field) => (
                <label key={field.name}>
                  <span>{field.label}</span>
                  <input name={field.name} type={field.type} required={field.required} />
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
              <button className="btn btn-primary" type="submit">Request My Dumpster →</button>
            </form>
            <div className="note">We'll reach out to confirm availability and send your payment link. 2 units — first come, first served.</div>
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
        <div>Golden Haul Rentals • 2 Ten-Yard Dumpsters Available Now • Fast Local Delivery</div>
        <div className="phones">
          <a href="tel:+13135057607">+1 (313) 505-7607</a>
          <a href="tel:+17343340268">+1 (734) 334-0268</a>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
