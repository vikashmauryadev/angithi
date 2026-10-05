import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import api from './routes/api.js';
const app = express();
app.use(helmet(), cors({ origin: env.CLIENT_ORIGIN }), express.json({ limit: '20kb' }), rateLimit({ windowMs: 60000, limit: 200 }));
app.use('/api', api);
app.use((_q, s) => s.status(404).json({ error: 'Not found' }));
app.use((e, _q, s, _n) => {
  if (e instanceof ZodError) return s.status(422).json({ error: e.issues[0].message });
  const status = e.status || 500; if (status === 500) console.error(e);
  s.status(status).json({ error: status === 500 ? 'Something went wrong' : e.message });
});
export default app;
