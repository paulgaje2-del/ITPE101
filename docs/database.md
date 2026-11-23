# Database design

SOLEVA uses Supabase PostgreSQL. The backend applies `backend/schema.sql` at startup and uses the `pg` connection pool with `DATABASE_URL`.

## Tables

- `users`: UUID, name, unique email, bcrypt password hash, and role.
- `products`: UUID, unique slug, category, price, shoe sizes, colors, stock, and active/featured flags.
- `coupons`: code, discount rules, expiry, usage limit, and active state.
- `orders`: customer UUID, purchased item snapshots and shipping as JSONB, calculated totals, payment reference, status history, and idempotency key.
- `webhook_events`: unique provider event ID, event type, receive time, and processed flag.

Checkout uses a PostgreSQL transaction to lock products, reserve stock, update coupon usage, and insert the pending order atomically.

## Supabase setup

1. Copy `backend/.env.example` to `backend/.env`.
2. In Supabase, choose **Connect → Session pooler** and set its PostgreSQL URI as `DATABASE_URL`.
3. Keep the connection string in the backend environment only. Do not expose it or a service-role key in the frontend.
4. Start the backend; it creates the schema from `backend/schema.sql`. Run `npm run seed` to load demo products, coupons, and the admin account.

The seed command replaces the product catalog and coupons. Use a project intended for this demo.
