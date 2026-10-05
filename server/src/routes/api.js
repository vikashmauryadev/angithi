import { Router } from 'express';
import { z } from 'zod';
import auth from './auth.js';
import { Product, Order, Coupon } from '../models/index.js';
import { priceCart } from '../utils/pricing.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
const r = Router();
r.use('/auth', auth);
const wrap = f => (q, s, n) => f(q, s, n).catch(n);
r.get('/health', (_q, s) => s.json({ ok: true }));
r.get('/categories', wrap(async (_q, s) => s.json(await Product.distinct('category'))));
r.get('/products', wrap(async (q, s) => {
  const { search, category, veg, max, available, sort = 'popular', page = 1, limit = 12 } = q.query;
  const f = {};
  if (search) f.name = { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (category) f.category = String(category);
  if (veg === 'true') f.veg = true;
  if (available === 'true') f.available = true;
  if (max) f.price = { $lte: +max };
  const order = { price_asc: { price: 1 }, price_desc: { price: -1 }, name: { name: 1 }, popular: { bestseller: -1, name: 1 } }[sort] || {};
  const lim = Math.min(+limit || 12, 50), skip = (Math.max(+page, 1) - 1) * lim;
  const [items, total] = await Promise.all([Product.find(f).sort(order).skip(skip).limit(lim), Product.countDocuments(f)]);
  s.json({ items, total, pages: Math.ceil(total / lim) });
}));
r.get('/products/:id', wrap(async (q, s) => { const p = await Product.findById(q.params.id).catch(() => null); p ? s.json(p) : s.status(404).json({ error: 'Dish not found' }); }));
const cartSchema = z.object({ lines: z.array(z.object({ productId: z.string(), qty: z.number(), addons: z.array(z.string()).optional() })), coupon: z.string().optional(), mode: z.enum(['delivery', 'pickup']).default('delivery') });
r.post('/cart/price', wrap(async (q, s) => { const b = cartSchema.parse(q.body); const { bill, coupon } = await priceCart(b.lines, b.coupon, b.mode); s.json({ bill, coupon }); }));
r.post('/orders', optionalAuth, wrap(async (q, s) => {
  const b = cartSchema.extend({ customer: z.object({ name: z.string().min(2), phone: z.string().regex(/^\d{10}$/, 'Enter a 10-digit phone number'), address: z.string().min(8).optional(), notes: z.string().max(200).optional() }) }).parse(q.body);
  if (b.mode === 'delivery' && !b.customer.address) return s.status(422).json({ error: 'Delivery address is required' });
  const key = q.get('Idempotency-Key');
  if (key) { const ex = await Order.findOne({ key }); if (ex) return s.json(ex); }
  const { items, bill, coupon } = await priceCart(b.lines, b.coupon, b.mode);
  if (coupon) await Coupon.updateOne({ code: coupon }, { $inc: { used: 1 } });
  s.status(201).json(await Order.create({
  key,
  user: q.user?.id,
  customer: b.customer,
  mode: b.mode,
  items,
  bill,
  coupon,
  payment: 'cod'
}));
}));
r.get('/orders/me', requireAuth, wrap(async (q, s) => {
  const orders = await Order.find({
    user: q.user.id
  }).sort({ createdAt: -1 });

  s.json({ orders });
}));
r.get('/orders/:id', requireAuth, wrap(async (q, s) => {
  const o = await Order.findOne({
    _id: q.params.id,
    user: q.user.id
  });

  if (!o) {
    return s.status(404).json({ error: 'Order not found' });
  }

  s.json(o);
}));
export default r;


/* ===========================
   ADMIN DASHBOARD API
=========================== */

// Dashboard statistics and recent orders
r.get(
  '/admin/overview',
  requireAuth,
  requireAdmin,
  wrap(async (_q, s) => {
    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      revenueResult,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({
        status: {
          $in: ['placed', 'confirmed', 'preparing']
        }
      }),
      Product.countDocuments(),
      Order.aggregate([
        {
          $match: {
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$bill.total' }
          }
        }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .lean()
    ]);

    s.json({
      stats: {
        totalOrders,
        pendingOrders,
        totalProducts,
        totalRevenue: revenueResult[0]?.total || 0
      },
      recentOrders
    });
  })
);

// View all customer orders
r.get(
  '/admin/orders',
  requireAuth,
  requireAdmin,
  wrap(async (q, s) => {
    const filter = {};

    if (q.query.status) {
      const allowedStatuses = [
        'placed',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ];

      if (!allowedStatuses.includes(q.query.status)) {
        return s.status(400).json({
          error: 'Invalid order status.'
        });
      }

      filter.status = q.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    s.json({ orders });
  })
);

// Update an order's status
r.patch(
  '/admin/orders/:id/status',
  requireAuth,
  requireAdmin,
  wrap(async (q, s) => {
    const schema = z.object({
      status: z.enum([
        'placed',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ])
    });

    const parsed = schema.safeParse(q.body);

    if (!parsed.success) {
      return s.status(400).json({
        error: 'Invalid order status.'
      });
    }

    const order = await Order.findByIdAndUpdate(
      q.params.id,
      { status: parsed.data.status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return s.status(404).json({
        error: 'Order not found.'
      });
    }

    s.json({ order });
  })
);
