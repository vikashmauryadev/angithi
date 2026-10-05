
import 'dotenv/config';
import { z } from 'zod';

const r = z.object({
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  CLIENT_ORIGIN: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.string().default('development')
}).safeParse(process.env);

if (!r.success) {
  console.error('Invalid environment:', r.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = r.data;