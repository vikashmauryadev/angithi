# Angithi – full-stack restaurant app (Phase 1)
Stack: React + Vite, Express, MongoDB Atlas (Mongoose). Currently built: menu API with search/filter/pagination, server-side pricing and coupons,
guest orders with idempotency key, cash on delivery, cart drawer, menu, dish page, checkout. Not yet built: auth, accounts, tracking page, admin, tests.

## Run (Windows PowerShell)
```
cd server; copy .env.example .env   # put your MongoDB Atlas URI in .env
npm install; npm run seed; npm run dev
# new terminal
cd client; npm install; npm run dev   # http://localhost:5173
```
Edit brand, hours, developer links in `client/src/config/siteConfig.js`. Seed data is marked `demo: true`; add image URLs to products to show photos.
Deploy: backend on Render/Railway (set MONGODB_URI, CLIENT_ORIGIN), frontend on Vercel (set VITE_API_URL to the backend URL, root dir `client`).
