
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { Product, Coupon } from './models/index.js';

// Helper function to create a demo menu item
const d = (name, category, price, veg, desc, extra = {}) => ({
  name,
  category,
  price,
  veg,
  description: desc,
  cuisine: extra.cuisine || 'Indian',
  slug: name.toLowerCase().replace(/\W+/g, '-'),
  demo: true,
  ...extra,
});


const images = {
  pizza:
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',

  burger:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',

  chickenBiryani:
    'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80',

  vegBiryani:
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80',

  thali:
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',

  noodles:
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',

  pasta:
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',

  dessert:
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',

  chaas:
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',
};

// Demo restaurant menu
const items = [
  d(
    'Tandoori Paneer Pizza',
    'Pizza',
    349,
    true,
    'Charred paneer, onion and mint drizzle on a hand-stretched base.',
    {
      cuisine: 'Italian',
      bestseller: true,
      image: images.pizza,
      addons: [{ name: 'Extra cheese', price: 40 }],
    }
  ),

  d(
    'Smoked Chicken Burger',
    'Burgers',
    229,
    false,
    'Grilled chicken, chipotle mayo, pickled onion in a toasted bun.',
    {
      cuisine: 'American',
      image: images.burger,
    }
  ),

  d(
    'Dum Chicken Biryani',
    'Biryani',
    329,
    false,
    'Slow-sealed basmati with saffron and whole spices.',
    {
      bestseller: true,
      image: images.chickenBiryani,
    }
  ),

  d(
    'Veg Dum Biryani',
    'Biryani',
    269,
    true,
    'Seasonal vegetables layered with fragrant rice and fried onion.',
    {
      image: images.vegBiryani,
    }
  ),

  d(
    'Dal Makhani Thali',
    'Indian meals',
    299,
    true,
    'Black dal, paneer, rice, two rotis and a sweet.',
    {
      image: images.thali,
    }
  ),

  d(
    'Hakka Noodles',
    'Chinese',
    199,
    true,
    'Wok-tossed noodles with crisp vegetables.',
    {
      cuisine: 'Chinese',
      image: images.noodles,
    }
  ),

  d(
    'Creamy Alfredo Pasta',
    'Pasta',
    279,
    true,
    'Penne in garlic-parmesan cream.',
    {
      cuisine: 'Italian',
      available: false,
      image: images.pasta,
    }
  ),

  d(
    'Gulab Jamun (2 pc)',
    'Desserts',
    89,
    true,
    'Warm milk dumplings in cardamom syrup.',
    {
      image: images.dessert,
    }
  ),

  d(
    'Masala Chaas',
    'Beverages',
    59,
    true,
    'Spiced buttermilk, served cold.',
    {
      image: images.chaas,
    }
  ),
];

// Seed demo products and the welcome coupon
async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);

    // Replace existing demo products with the updated menu.
    // This does not delete non-demo products or customer orders.
    await Product.deleteMany({ demo: true });
    await Product.insertMany(items);

    await Coupon.updateOne(
      { code: 'WELCOME50' },
      {
        $set: {
          code: 'WELCOME50',
          type: 'flat',
          value: 50,
          minOrder: 300,
          active: true,
        },
      },
      { upsert: true }
    );

    console.log('Seeded demo data with food image URLs.');
    console.log(`Inserted ${items.length} demo products.`);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

await seed();