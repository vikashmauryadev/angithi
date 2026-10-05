import mongoose from 'mongoose';
const { Schema, model } = mongoose;
export const Product = model('Product', new Schema({
  name: { type: String, required: true, trim: true }, slug: { type: String, unique: true },
  description: String, category: { type: String, index: true }, cuisine: String,
  price: { type: Number, required: true, min: 0 }, veg: { type: Boolean, default: true },
  image: String, available: { type: Boolean, default: true }, bestseller: { type: Boolean, default: false },
  addons: [{ name: String, price: Number }], demo: { type: Boolean, default: false }
}, { timestamps: true }));
export const Coupon = model('Coupon', new Schema({
  code: { type: String, unique: true, uppercase: true }, type: { type: String, enum: ['percent', 'flat'] },
  value: Number, minOrder: { type: Number, default: 0 }, expiresAt: Date, usageLimit: Number, used: { type: Number, default: 0 }, active: { type: Boolean, default: true }
}));
export const Order = model('Order', new Schema({
  user: {
  type: Schema.Types.ObjectId,
  ref: 'User',
  index: true
},
  key: { type: String, unique: true, sparse: true },
  customer: { name: String, phone: String, address: String, notes: String }, mode: { type: String, enum: ['delivery', 'pickup'] },
  items: [{ product: Schema.Types.ObjectId, name: String, price: Number, qty: Number, addons: [{ name: String, price: Number }] }],
  bill: { subtotal: Number, discount: Number, delivery: Number, tax: Number, total: Number }, coupon: String,
  payment: { type: String, default: 'cod' }, status: { type: String, default: 'placed', enum: ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'] }
}, { timestamps: true }));
export const User = model('User', new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254
  },

  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
    required: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  resetPasswordToken: {
  type: String,
  default: null,
  select: false
},

resetPasswordExpires: {
  type: Date,
  default: null,
  select: false
},
  
}, { timestamps: true }));