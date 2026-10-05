import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../api.js';
import { money } from '../config/siteConfig.js';
export function useBill(lines, coupon, mode = 'delivery') {
  const [state, set] = useState({ bill: null, error: '' });
  useEffect(() => {
    if (!lines.length) return set({ bill: null, error: '' });
    api('/cart/price', { method: 'POST', body: { lines: lines.map(l => ({ productId: l.id, qty: l.qty, addons: l.addons })), coupon: coupon || undefined, mode } })
      .then(r => set({ bill: r.bill, error: '' })).catch(e => set({ bill: null, error: e.message }));
  }, [lines, coupon, mode]);
  return state;
}
export default function CartDrawer() {
  const { lines, open, setOpen, change, key, clear } = useCart();
  const { bill, error } = useBill(lines, '');
  useEffect(() => { const f = e => e.key === 'Escape' && setOpen(false); addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, [setOpen]);
  return (<>
    <div className={`scrim ${open ? 'on' : ''}`} onClick={() => setOpen(false)} />
    <aside className={`drawer ${open ? 'on' : ''}`} role="dialog" aria-label="Your order" aria-hidden={!open}>
      <div className="dh"><h2>Your order</h2><button onClick={() => setOpen(false)} aria-label="Close cart"><X /></button></div>
      
{!lines.length ? (
  <div className="empty">
    <ShoppingBag size={42} strokeWidth={1.5} />

    <h3>Your next favorite meal awaits</h3>

    <p>
      Your cart is empty. Discover something delicious from our menu.
    </p>

    <Link
      to="/menu"
      onClick={() => setOpen(false)}
    >
      Explore Menu
    </Link>
  </div>
) : (<>
        <ul>{lines.map(l => (<li key={key(l)}><div><b>{l.name}</b><small>{l.addons.join(', ')}</small></div>
          <div className="qty"><button onClick={() => change(key(l), -1)} aria-label="Decrease"><Minus size={14} /></button><span>{l.qty}</span><button onClick={() => change(key(l), 1)} aria-label="Increase"><Plus size={14} /></button></div></li>))}</ul>
        <div className="cart-summary">
  {error && <p className="err" role="alert">{error}</p>}

  {bill && (
    <dl className="bill">
      <dt>Subtotal</dt>
      <dd>{money(bill.subtotal)}</dd>

      <dt>Delivery</dt>
      <dd>{bill.delivery ? money(bill.delivery) : 'Free'}</dd>

      <dt>Tax</dt>
      <dd>{money(bill.tax)}</dd>

      <dt>Total</dt>
      <dd><b>{money(bill.total)}</b></dd>
    </dl>
  )}

  <Link
    className="btn full cart-checkout"
    to="/checkout"
    onClick={() => setOpen(false)}
  >
    Proceed to Checkout
  </Link>

  <button
    type="button"
    className="clear-cart-btn"
    onClick={clear}
  >
    Clear cart
  </button>
</div></>)}
    </aside></>);
}
