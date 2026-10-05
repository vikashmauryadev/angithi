
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useBill } from '../components/CartDrawer.jsx';
import { api } from '../api.js';
import { money } from '../config/siteConfig.js';

export default function Checkout() {
  const { lines, clear } = useCart();

  const [mode, setMode] = useState('delivery');
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [f, setF] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [err, setErr] = useState('');
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);

  const idem = useRef(crypto.randomUUID());
  const { bill, error } = useBill(lines, applied, mode);

  const on = (k) => (e) =>
    setF((previous) => ({ ...previous, [k]: e.target.value }));

  const place = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');

    try {
      const o = await api('/orders', {
        method: 'POST',
        headers: { 'Idempotency-Key': idem.current },
        body: {
          lines: lines.map((l) => ({
            productId: l.id,
            qty: l.qty,
            addons: l.addons,
          })),
          coupon: applied || undefined,
          mode,
          customer: {
            ...f,
            address: mode === 'delivery' ? f.address : undefined,
          },
        },
      });

      setOrder(o);
      clear();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  if (order) {
    return (
      <main className="wrap sec checkout-state">
        <div className="checkout-state-icon">✓</div>
        <p className="checkout-eyebrow">THANK YOU FOR YOUR ORDER</p>
        <h1>Order confirmed!</h1>
        <p>
          Order #{order._id.slice(-6)} has been placed successfully.
        </p>
        <div className="checkout-confirmation-total">
          <span>Amount to pay</span>
          <strong>{money(order.bill.total)}</strong>
        </div>
        <p>
          Pay by cash on{' '}
          {order.mode === 'delivery' ? 'delivery' : 'pickup'}.
        </p>
        <Link className="btn checkout-submit" to="/menu">
          Order more
        </Link>
      </main>
    );
  }

  if (!lines.length) {
    return (
      <main className="wrap sec checkout-state">
        <div className="checkout-state-icon">＋</div>
        <h1>Your cart is waiting</h1>
        <p>Add something delicious from our menu to continue.</p>
        <Link className="btn checkout-submit" to="/menu">
          Explore the menu
        </Link>
      </main>
    );
  }

  return (
    <main className="wrap sec checkout checkout-page">
      <div className="checkout-main">
        <div className="checkout-heading">
          <p className="checkout-eyebrow">ANGITHI · FRESHLY PREPARED</p>
          <h1>Complete your order</h1>
          <p>Just a few details, and your meal will be on its way.</p>
        </div>

        <form className="checkout-form" onSubmit={place}>
          <section className="checkout-section">
            <div className="checkout-section-heading">
              <span className="checkout-step">01</span>
              <div>
                <h2>How would you like your order?</h2>
                <p>Choose delivery or pickup.</p>
              </div>
            </div>

            <div className="fulfillment-options">
              <label
                className={`fulfillment-option ${
                  mode === 'delivery' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value="delivery"
                  checked={mode === 'delivery'}
                  onChange={() => setMode('delivery')}
                />
                <span className="fulfillment-icon">↗</span>
                <span className="fulfillment-copy">
                  <strong>Delivery</strong>
                  <small>Delivered to your door</small>
                </span>
                <span className="fulfillment-check">
                  {mode === 'delivery' ? '✓' : ''}
                </span>
              </label>

              <label
                className={`fulfillment-option ${
                  mode === 'pickup' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value="pickup"
                  checked={mode === 'pickup'}
                  onChange={() => setMode('pickup')}
                />
                <span className="fulfillment-icon">⌂</span>
                <span className="fulfillment-copy">
                  <strong>Pickup</strong>
                  <small>Collect your order yourself</small>
                </span>
                <span className="fulfillment-check">
                  {mode === 'pickup' ? '✓' : ''}
                </span>
              </label>
            </div>
          </section>

          <section className="checkout-section">
            <div className="checkout-section-heading">
              <span className="checkout-step">02</span>
              <div>
                <h2>Your details</h2>
                <p>We need these details to prepare your order.</p>
              </div>
            </div>

            <div className="checkout-fields">
              <label className="checkout-field">
                <span>Full name</span>
                <input
                  type="text"
                  required
                  minLength={2}
                  placeholder="Enter your full name"
                  value={f.name}
                  onChange={on('name')}
                  autoComplete="name"
                />
              </label>

              <label className="checkout-field">
                <span>Phone number</span>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={f.phone}
                  onChange={on('phone')}
                  autoComplete="tel"
                />
              </label>

              {mode === 'delivery' && (
                <label className="checkout-field">
                  <span>Delivery address</span>
                  <textarea
                    required
                    minLength={8}
                    rows={3}
                    placeholder="House number, street, area and landmark"
                    value={f.address}
                    onChange={on('address')}
                    autoComplete="street-address"
                  />
                </label>
              )}

              <label className="checkout-field">
                <span>
                  Notes for the kitchen <small>(optional)</small>
                </span>
                <textarea
                  maxLength={200}
                  rows={2}
                  placeholder="Any special instructions?"
                  value={f.notes}
                  onChange={on('notes')}
                />
              </label>
            </div>
          </section>

          <div className="checkout-payment-note">
            <span className="checkout-payment-icon">₹</span>
            <div>
              <strong>Cash on {mode === 'delivery' ? 'delivery' : 'pickup'}</strong>
              <p>No online payment is taken.</p>
            </div>
          </div>

          {(err || error) && (
            <p className="err checkout-error" role="alert">
              {err || error}
            </p>
          )}

          <button
            className="btn full checkout-submit"
            type="submit"
            disabled={busy || !bill || Boolean(error)}
          >
            {busy
              ? 'Placing your order…'
              : `Place order${bill ? ` · ${money(bill.total)}` : ''}`}
          </button>

          <p className="checkout-secure-note">
            Please check your details before placing your order.
          </p>
        </form>
      </div>

      <aside className="checkout-summary">
        <div className="summary-heading">
          <div>
            <p className="checkout-eyebrow">YOUR SELECTION</p>
            <h2>Order summary</h2>
          </div>
          <span className="summary-count">
            {lines.reduce((total, line) => total + line.qty, 0)} items
          </span>
        </div>

        <div className="summary-items">
          {lines.map((l) => (
            <div className="summary-item" key={`${l.id}-${l.addons.join(',')}`}>
              <div className="summary-item-icon">✦</div>
              <div className="summary-item-info">
                <strong>{l.name}</strong>
                <span>Qty: {l.qty}</span>
                {l.addons.length > 0 && (
                  <small>{l.addons.join(', ')}</small>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="coupon checkout-coupon">
          <label htmlFor="checkout-coupon-code">Have a coupon?</label>
          <div className="coupon-controls">
            <input
              id="checkout-coupon-code"
              aria-label="Coupon code"
              placeholder="Enter coupon code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => setApplied(code.trim())}
              disabled={!code.trim()}
            >
              Apply
            </button>
          </div>
          {applied && (
            <p className="coupon-applied">
              Coupon entered: <strong>{applied}</strong>
              <button
                type="button"
                onClick={() => {
                  setApplied('');
                  setCode('');
                }}
              >
                Remove
              </button>
            </p>
          )}
        </div>

        {bill && (
          <dl className="bill checkout-bill">
            <dt>Subtotal</dt>
            <dd>{money(bill.subtotal)}</dd>

            {bill.discount > 0 && (
              <>
                <dt>Discount</dt>
                <dd className="checkout-discount">
                  −{money(bill.discount)}
                </dd>
              </>
            )}

            <dt>Delivery</dt>
            <dd>{bill.delivery ? money(bill.delivery) : 'Free'}</dd>

            <dt>Tax (5%)</dt>
            <dd>{money(bill.tax)}</dd>

            <dt className="checkout-total-label">Total to pay</dt>
            <dd className="checkout-total-value">
              <strong>{money(bill.total)}</strong>
            </dd>
          </dl>
        )}

        <div className="checkout-summary-foot">
          <span className="checkout-summary-check">✓</span>
          <p>Freshly prepared with care, just for you.</p>
        </div>
      </aside>
    </main>
  );
}