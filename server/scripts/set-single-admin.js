import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';

const ADMIN_EMAIL = 'vikashmaurya273310@gmail.com';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // First make ALL users customers
    await User.updateMany(
      {},
      { $set: { role: 'customer' } }
    );

    // Then make ONLY the selected email admin
    const admin = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL.toLowerCase().trim() },
      { $set: { role: 'admin' } },
      { new: true }
    );

    if (!admin) {
      console.log('User with this email was not found.');
    } else {
      console.log(`Admin set successfully: ${admin.email}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

run();