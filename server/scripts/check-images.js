import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from '../src/models/index.js';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function updateImages() {
  try {
    await mongoose.connect(MONGO_URI);

    await Product.updateOne(
      { slug: 'mutton-dum-biryani' },
      {
        $set: {
          image:
            'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80'
        }
      }
    );

    await Product.updateOne(
      { slug: 'veg-spring-rolls' },
      {
        $set: {
          image:
            'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=900&q=80'
        }
      }
    );

    console.log('Mutton Dum Biryani image updated.');
    console.log('Veg Spring Rolls image updated.');

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

updateImages();