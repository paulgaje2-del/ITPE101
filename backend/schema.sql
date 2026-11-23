CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  brand text NOT NULL DEFAULT 'SOLEVA',
  category text NOT NULL,
  description text NOT NULL,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  image text NOT NULL,
  sizes integer[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  stock integer NOT NULL CHECK (stock >= 0),
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  material text,
  sport text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_active_created_idx ON products (active, created_at DESC);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);

CREATE TABLE IF NOT EXISTS coupons (
  code text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('percent', 'fixed')),
  value numeric(12,2) NOT NULL CHECK (value >= 0),
  min_spend numeric(12,2) NOT NULL DEFAULT 0,
  expires_at timestamptz,
  usage_limit integer NOT NULL,
  used_count integer NOT NULL DEFAULT 0,
  per_customer_limit integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  items jsonb NOT NULL,
  shipping jsonb NOT NULL,
  subtotal numeric(12,2) NOT NULL,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  shipping_fee numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL,
  coupon_code text,
  status text NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'expired')),
  payment_reference text,
  payment_url text,
  idempotency_key text,
  payment_mismatch jsonb,
  status_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

CREATE TABLE IF NOT EXISTS webhook_events (
  event_id text PRIMARY KEY,
  type text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed boolean NOT NULL DEFAULT false
);
