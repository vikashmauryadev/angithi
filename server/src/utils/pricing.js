import { Product, Coupon } from '../models/index.js';
export const RULES = { taxRate: 0.05, deliveryFee: 40, freeDeliveryAbove: 499 };
const fail = (m, status) => Object.assign(new Error(m), { status });
export async function priceCart(lines, couponCode, mode = 'delivery') {
  if (!lines?.length) throw fail('Cart is empty', 400);
  const items = [];
  for (const l of lines) {
    const p = await Product.findById(l.productId).catch(() => null);
    if (!p || !p.available) throw fail(`${p?.name ?? 'An item'} is unavailable`, 409);
    const addons = (l.addons || []).map(n => p.addons.find(a => a.name === n)).filter(Boolean).map(a => ({ name: a.name, price: a.price }));
    const unit = p.price + addons.reduce((s, a) => s + a.price, 0);
    items.push({ product: p._id, name: p.name, price: unit, qty: Math.min(Math.max(Math.floor(l.qty) || 1, 1), 20), addons });
  }
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  let discount = 0, applied = null;
  if (couponCode) {
    const c = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    const ok = c && (!c.expiresAt || c.expiresAt > new Date()) && subtotal >= c.minOrder && (!c.usageLimit || c.used < c.usageLimit);
    if (!ok) throw fail('Coupon is invalid, expired, or the order is below its minimum', 422);
    discount = Math.min(subtotal, c.type === 'percent' ? Math.round(subtotal * c.value / 100) : c.value); applied = c.code;
  }
  const after = subtotal - discount;
  const delivery = mode === 'pickup' || after >= RULES.freeDeliveryAbove ? 0 : RULES.deliveryFee;
  const tax = Math.round(after * RULES.taxRate);
  return { items, coupon: applied, bill: { subtotal, discount, delivery, tax, total: after + delivery + tax } };
}
