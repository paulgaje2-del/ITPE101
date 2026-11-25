# Database design

SOLEVA uses Supabase PostgreSQL. The backend applies `backend/schema.sql` at startup and uses the `pg` connection pool with `DATABASE_URL`.

## Tables

- `users`: UUID, name, unique email, bcrypt password hash, and role.
- `products`: UUID, unique slug, category, price, shoe sizes, colors, stock, and active/featured flags.
- `coupons`: code, discount rules, expiry, usage limit, and active state.
- `orders`: customer UUID, purchased item snapshots and shipping as JSONB, calculated totals, payment reference, status history, and idempotency key.
- `coupon_redemptions`: coupon, customer, and order for each applied coupon; the order transaction checks the customer's configured redemption limit and records the use atomically. Schema initialization backfills existing coupon orders for coupons that still exist.
- `webhook_events`: unique provider event ID, event type, receive time, and processed flag.

Checkout uses a PostgreSQL transaction to lock products and coupons, reserve stock, enforce global and per-customer coupon limits, update usage counts, record the redemption, and insert the pending order atomically. Deleting a coupon removes its redemption records; rerunning the demo seed resets the coupon catalog and its usage history.

## Supabase setup

1. Copy `backend/.env.example` to `backend/.env`.
2. In Supabase, choose **Connect → Session pooler** and set its PostgreSQL URI as `DATABASE_URL`.
3. Keep the connection string in the backend environment only; the application connects through PostgreSQL and does not need `SUPABASE_URL` or a Supabase service-role key.
4. Start the backend; it creates the schema from `backend/schema.sql`. Run `npm run seed` to load demo products, coupons, and the admin account.

The seed command replaces the product catalog and coupons. Use a project intended for this demo.
