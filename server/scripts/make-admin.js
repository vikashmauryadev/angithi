import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/index.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error(
    'Usage: node scripts/set-single-admin.js your-email@example.com'
  );
  process.exit(1);
}

try {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from server/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  // Make every existing user a customer
  await User.updateMany(
    {},
    { $set: { role: 'customer' } }
  );

  // Make only the selected account an admin
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: 'admin' } },
    { new: true, runValidators: true }
  );

  if (!user) {
    console.error(
      'No account found with that email. Check the email and try again.'
    );
    process.exitCode = 1;
  } else {
    console.log('Single-admin setup completed successfully.');
    console.log(`Admin account: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log('All other accounts are customers.');
  }
} catch (error) {
  console.error('Could not set single admin:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}