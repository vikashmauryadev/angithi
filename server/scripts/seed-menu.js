import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from '../src/models/index.js';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const products = [
  // =========================
  // STARTERS — 6
  // =========================

  {
    name: 'Paneer Tikka',
    slug: 'paneer-tikka',
    description: 'Smoky grilled paneer cubes marinated with yogurt and Indian spices.',
    category: 'Starters',
    cuisine: 'Indian',
    price: 229,
    veg: true,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: [{ name: 'Extra paneer', price: 50 }]
  },
  {
    name: 'Crispy Corn',
    slug: 'crispy-corn',
    description: 'Golden crispy corn tossed with herbs, onion and mild spices.',
    category: 'Starters',
    cuisine: 'Indian',
    price: 169,
    veg: true,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Chicken 65',
    slug: 'chicken-65',
    description: 'Crispy South Indian style chicken bites with curry leaves.',
    category: 'Starters',
    cuisine: 'Indian',
    price: 249,
    veg: false,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Veg Spring Rolls',
    slug: 'veg-spring-rolls',
    description: 'Crispy rolls filled with seasoned vegetables and served with dip.',
    category: 'Starters',
    cuisine: 'Chinese',
    price: 159,
    veg: true,
    image: 'https://images.unsplash.com/photo-1548507200-3c2f3b1d6a34?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Chicken Seekh Kebab',
    slug: 'chicken-seekh-kebab',
    description: 'Juicy minced chicken kebabs grilled with aromatic spices.',
    category: 'Starters',
    cuisine: 'Indian',
    price: 279,
    veg: false,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Chilli Paneer',
    slug: 'chilli-paneer',
    description: 'Crispy paneer tossed with peppers, onion and Indo-Chinese sauce.',
    category: 'Starters',
    cuisine: 'Chinese',
    price: 219,
    veg: true,
    image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },

  // =========================
  // TANDOOR — 6
  // =========================

  {
    name: 'Tandoori Chicken',
    slug: 'tandoori-chicken',
    description: 'Classic chicken marinated overnight and roasted in a clay tandoor.',
    category: 'Tandoor',
    cuisine: 'Indian',
    price: 299,
    veg: false,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Malai Tikka',
    slug: 'malai-tikka',
    description: 'Tender chicken pieces marinated in creamy cheese and mild spices.',
    category: 'Tandoor',
    cuisine: 'Indian',
    price: 289,
    veg: false,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Tandoori Mushroom',
    slug: 'tandoori-mushroom',
    description: 'Fresh mushrooms marinated in Indian spices and char-grilled.',
    category: 'Tandoor',
    cuisine: 'Indian',
    price: 199,
    veg: true,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Tandoori Momos',
    slug: 'tandoori-momos',
    description: 'Steamed momos finished in a smoky tandoori marinade.',
    category: 'Tandoor',
    cuisine: 'Indian',
    price: 219,
    veg: true,
    image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Afghani Chicken',
    slug: 'afghani-chicken',
    description: 'Creamy grilled chicken with a rich and mildly spiced marinade.',
    category: 'Tandoor',
    cuisine: 'Indian',
    price: 319,
    veg: false,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Tandoori Prawns',
    slug: 'tandoori-prawns',
    description: 'Juicy prawns marinated with herbs and roasted to perfection.',
    category: 'Tandoor',
    cuisine: 'Indian',
    price: 379,
    veg: false,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },

  // =========================
  // BIRYANI — 4
  // =========================

  {
    name: 'Mutton Dum Biryani',
    slug: 'mutton-dum-biryani',
    description: 'Slow-cooked mutton layered with fragrant basmati rice and whole spices.',
    category: 'Biryani',
    cuisine: 'Indian',
    price: 399,
    veg: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Chicken Tikka Biryani',
    slug: 'chicken-tikka-biryani',
    description: 'Fragrant biryani layered with smoky chicken tikka pieces.',
    category: 'Biryani',
    cuisine: 'Indian',
    price: 359,
    veg: false,
    image: 'https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Egg Biryani',
    slug: 'egg-biryani',
    description: 'Aromatic basmati rice cooked with boiled eggs and Indian spices.',
    category: 'Biryani',
    cuisine: 'Indian',
    price: 239,
    veg: false,
    image: 'https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Paneer Biryani',
    slug: 'paneer-biryani',
    description: 'Fragrant rice layered with spiced paneer, herbs and fried onion.',
    category: 'Biryani',
    cuisine: 'Indian',
    price: 289,
    veg: true,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },

  // =========================
  // MAIN COURSE — 8
  // =========================

  {
    name: 'Paneer Butter Masala',
    slug: 'paneer-butter-masala',
    description: 'Soft paneer in a rich tomato, butter and cream gravy.',
    category: 'Main Course',
    cuisine: 'Indian',
    price: 249,
    veg: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Kadai Paneer',
    slug: 'kadai-paneer',
    description: 'Paneer cooked with peppers, onion and freshly ground kadai spices.',
    category: 'Main Course',
    cuisine: 'Indian',
    price: 239,
    veg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Dal Tadka',
    slug: 'dal-tadka',
    description: 'Yellow lentils finished with garlic, cumin and aromatic tempering.',
    category: 'Main Course',
    cuisine: 'Indian',
    price: 169,
    veg: true,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Shahi Paneer',
    slug: 'shahi-paneer',
    description: 'Paneer cooked in a creamy royal gravy with nuts and mild spices.',
    category: 'Main Course',
    cuisine: 'Indian',
    price: 259,
    veg: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Butter Chicken',
    slug: 'butter-chicken',
    description: 'Tender chicken simmered in a buttery tomato cream gravy.',
    category: 'Main Course',
    cuisine: 'Indian',
    price: 329,
    veg: false,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Chicken Curry',
    slug: 'chicken-curry',
    description: 'Homestyle chicken curry prepared with onion, tomato and spices.',
    category: 'Main Course',
    cuisine: 'Indian',
    price: 299,
    veg: false,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Mutton Rogan Josh',
    slug: 'mutton-rogan-josh',
    description: 'Slow-cooked mutton in a fragrant Kashmiri-style gravy.',
    category: 'Main Course',
    cuisine: 'Indian',
    price: 379,
    veg: false,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Mix Veg Curry',
    slug: 'mix-veg-curry',
    description: 'Seasonal vegetables cooked in a flavorful Indian masala.',
    category: 'Main Course',
    cuisine: 'Indian',
    price: 189,
    veg: true,
    image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },

  // =========================
  // BREADS — 6
  // =========================

  {
    name: 'Butter Naan',
    slug: 'butter-naan',
    description: 'Soft tandoor-baked naan brushed with melted butter.',
    category: 'Breads',
    cuisine: 'Indian',
    price: 59,
    veg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Garlic Naan',
    slug: 'garlic-naan',
    description: 'Tandoor-baked naan topped with garlic, coriander and butter.',
    category: 'Breads',
    cuisine: 'Indian',
    price: 79,
    veg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Cheese Naan',
    slug: 'cheese-naan',
    description: 'Soft naan stuffed with melted cheese and herbs.',
    category: 'Breads',
    cuisine: 'Indian',
    price: 109,
    veg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Tandoori Roti',
    slug: 'tandoori-roti',
    description: 'Traditional whole-wheat roti baked in a hot tandoor.',
    category: 'Breads',
    cuisine: 'Indian',
    price: 39,
    veg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Lachha Paratha',
    slug: 'lachha-paratha',
    description: 'Flaky layered paratha cooked with butter.',
    category: 'Breads',
    cuisine: 'Indian',
    price: 69,
    veg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Stuffed Paneer Kulcha',
    slug: 'stuffed-paneer-kulcha',
    description: 'Tandoor-baked kulcha stuffed with spiced paneer.',
    category: 'Breads',
    cuisine: 'Indian',
    price: 119,
    veg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },

  // =========================
  // RICE — 4
  // =========================

  {
    name: 'Jeera Rice',
    slug: 'jeera-rice',
    description: 'Fragrant basmati rice tempered with cumin and herbs.',
    category: 'Rice',
    cuisine: 'Indian',
    price: 139,
    veg: true,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Veg Pulao',
    slug: 'veg-pulao',
    description: 'Basmati rice cooked with fresh vegetables and aromatic spices.',
    category: 'Rice',
    cuisine: 'Indian',
    price: 169,
    veg: true,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Chicken Fried Rice',
    slug: 'chicken-fried-rice',
    description: 'Wok-tossed rice with chicken, vegetables and Asian sauces.',
    category: 'Rice',
    cuisine: 'Chinese',
    price: 229,
    veg: false,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Veg Fried Rice',
    slug: 'veg-fried-rice',
    description: 'Wok-tossed rice with fresh vegetables and light soy seasoning.',
    category: 'Rice',
    cuisine: 'Chinese',
    price: 189,
    veg: true,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },

  // =========================
  // CHINESE — 5
  // =========================

  {
    name: 'Veg Manchurian',
    slug: 'veg-manchurian',
    description: 'Crispy vegetable balls tossed in a tangy Indo-Chinese sauce.',
    category: 'Chinese',
    cuisine: 'Chinese',
    price: 189,
    veg: true,
    image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Chicken Manchurian',
    slug: 'chicken-manchurian',
    description: 'Tender chicken tossed in a spicy Manchurian sauce.',
    category: 'Chinese',
    cuisine: 'Chinese',
    price: 239,
    veg: false,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Chilli Chicken',
    slug: 'chilli-chicken',
    description: 'Crispy chicken with peppers, onion and spicy chilli sauce.',
    category: 'Chinese',
    cuisine: 'Chinese',
    price: 249,
    veg: false,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Schezwan Noodles',
    slug: 'schezwan-noodles',
    description: 'Spicy wok-tossed noodles with vegetables and Schezwan sauce.',
    category: 'Chinese',
    cuisine: 'Chinese',
    price: 209,
    veg: true,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Honey Chilli Potato',
    slug: 'honey-chilli-potato',
    description: 'Crispy potato strips glazed with honey and chilli sauce.',
    category: 'Chinese',
    cuisine: 'Chinese',
    price: 179,
    veg: true,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },

  // =========================
  // BURGERS & WRAPS — 4
  // =========================

  {
    name: 'Classic Veg Burger',
    slug: 'classic-veg-burger',
    description: 'Crispy veg patty, lettuce, tomato and signature sauce.',
    category: 'Burgers & Wraps',
    cuisine: 'American',
    price: 159,
    veg: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: [{ name: 'Extra cheese', price: 30 }]
  },
  {
    name: 'Paneer Tikka Wrap',
    slug: 'paneer-tikka-wrap',
    description: 'Spiced paneer tikka wrapped with fresh vegetables and mint sauce.',
    category: 'Burgers & Wraps',
    cuisine: 'Indian',
    price: 179,
    veg: true,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Chicken Shawarma Wrap',
    slug: 'chicken-shawarma-wrap',
    description: 'Juicy seasoned chicken wrapped with salad and creamy garlic sauce.',
    category: 'Burgers & Wraps',
    cuisine: 'Middle Eastern',
    price: 219,
    veg: false,
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Chicken Cheese Burger',
    slug: 'chicken-cheese-burger',
    description: 'Grilled chicken patty, melted cheese, lettuce and house sauce.',
    category: 'Burgers & Wraps',
    cuisine: 'American',
    price: 249,
    veg: false,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: [{ name: 'Extra cheese', price: 40 }]
  },

  // =========================
  // PIZZA — 3
  // =========================

  {
    name: 'Margherita Pizza',
    slug: 'margherita-pizza',
    description: 'Classic pizza with tomato sauce, mozzarella and fresh basil.',
    category: 'Pizza',
    cuisine: 'Italian',
    price: 249,
    veg: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: [{ name: 'Extra cheese', price: 40 }]
  },
  {
    name: 'Farmhouse Pizza',
    slug: 'farmhouse-pizza',
    description: 'Loaded with onion, capsicum, tomato, corn and mozzarella.',
    category: 'Pizza',
    cuisine: 'Italian',
    price: 329,
    veg: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: [{ name: 'Extra cheese', price: 40 }]
  },
  {
    name: 'Chicken Pepperoni Pizza',
    slug: 'chicken-pepperoni-pizza',
    description: 'Loaded pizza with chicken pepperoni, mozzarella and tomato sauce.',
    category: 'Pizza',
    cuisine: 'Italian',
    price: 379,
    veg: false,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: [{ name: 'Extra cheese', price: 40 }]
  },

  // =========================
  // BEVERAGES — 3
  // =========================

  {
    name: 'Fresh Lime Soda',
    slug: 'fresh-lime-soda',
    description: 'Refreshing lime soda served chilled.',
    category: 'Beverages',
    cuisine: 'Indian',
    price: 79,
    veg: true,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Mango Lassi',
    slug: 'mango-lassi',
    description: 'Creamy yogurt drink blended with ripe mango.',
    category: 'Beverages',
    cuisine: 'Indian',
    price: 99,
    veg: true,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },
  {
    name: 'Cold Coffee',
    slug: 'cold-coffee',
    description: 'Chilled creamy coffee topped with a light foam.',
    category: 'Beverages',
    cuisine: 'Indian',
    price: 129,
    veg: true,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  },

  // =========================
  // DESSERTS — 2
  // =========================

  {
    name: 'Rasmalai (2 pc)',
    slug: 'rasmalai-2-pc',
    description: 'Soft cottage cheese dumplings soaked in chilled saffron milk.',
    category: 'Desserts',
    cuisine: 'Indian',
    price: 119,
    veg: true,
    image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    demo: false,
    addons: []
  },
  {
    name: 'Chocolate Brownie',
    slug: 'chocolate-brownie',
    description: 'Warm, rich chocolate brownie with a soft fudgy centre.',
    category: 'Desserts',
    cuisine: 'International',
    price: 139,
    veg: true,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    demo: false,
    addons: []
  }
];

async function seedMenu() {
  try {
    if (!MONGO_URI) {
      throw new Error('MongoDB URI is missing from server/.env');
    }

    await mongoose.connect(MONGO_URI);

    console.log('MongoDB connected.');

    const existingSlugs = new Set(
      (await Product.find({}, { slug: 1, _id: 0 }).lean()).map(
        (product) => product.slug
      )
    );

    const newProducts = products.filter(
      (product) => !existingSlugs.has(product.slug)
    );

    if (newProducts.length === 0) {
      console.log('No new products to add.');
      await mongoose.disconnect();
      return;
    }

    await Product.insertMany(newProducts);

    console.log(`Added ${newProducts.length} new menu items.`);
    console.log(`Skipped ${products.length - newProducts.length} duplicates.`);
    console.log(`Total menu items should now be around ${existingSlugs.size + newProducts.length}.`);

    await mongoose.disconnect();
    console.log('Done.');
  } catch (error) {
    console.error('Menu seed failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedMenu();