# SOLEVA

A shoe e-commerce capstone (ITPE101): React + Vite storefront, Express REST API, Supabase PostgreSQL, Maya Checkout sandbox, and a Gemini-powered shoe finder.

> **Status:** Runnable scaffold, not deployed or payment-verified. Don't claim a successful Maya transaction until you've tested it in sandbox and captured webhook evidence.

## Features

- **Size- and stock-aware ordering:** validates size and quantity, and reserves stock with a conditional DB update.
- **Shoe Finder (AI):** Gemini recommends from real catalog products only, with a catalog-search fallback.

## Tech Stack

React 18 + Vite · Node/Express (`/api/v1`) · Supabase PostgreSQL · bcrypt + JWT · Maya Checkout (sandbox) · Google Gemini · Swagger UI (`/api-docs`)

## Quick Start

Requires Node.js 20.19+, a Supabase project, and (optionally) Maya sandbox and Gemini keys.

1. Copy `backend/.env.example` → `backend/.env` and `client/.env.example` → `client/.env`.
2. Set `DATABASE_URL` to your Supabase **Session pooler** string.
3. Run:

```bash
npm install
npm run install:all
npm run seed
npm run dev
```

Client: `http://localhost:5173` · API: `http://localhost:5000` · Docs: `http://localhost:5000/api-docs`

## Demo Data

- Admin: `admin@soleva.test` / `Admin12345!` (change before any public deployment)
- Coupons: `WELCOME10`, `SOLEVA200`, `RUN15`
- 20 seeded shoe products (re-seeding resets the catalog, coupons, and admin password)

## Key API Routes

| Access | Endpoints |
|---|---|
| Public | `POST /auth/register`, `POST /auth/login`, `GET /products`, `GET /products/:id`, `POST /ai/shoe-finder` |
| Customer | `POST /checkout`, `GET /orders/me` |
| Admin | `/admin/dashboard`, `/admin/orders`, `/admin/products`, `/admin/coupons` |
| Maya | `POST /payments/webhook` |

Responses use `{ success, data }` or `{ success: false, error }`. Send an `Idempotency-Key` header on checkout.

## Payments & AI Setup

- **Maya:** set `MAYA_PUBLIC_KEY`, `MAYA_SECRET_KEY`, `MAYA_WEBHOOK_SECRET`, and `PAYMENT_PROVIDER=maya` on the backend. Register `https://YOUR_API_HOST/api/v1/payments/webhook` in Maya.
- **Gemini:** set `GEMINI_API_KEY` in `backend/.env` only, never in the client.
- Use sandbox credentials only. Never commit `.env` files.

## Architecture

Layered MVC (routes → controllers → services → repositories), Factory Method (`PaymentProviderFactory`), inheritance/polymorphism (`PaymentProvider` → `MayaProvider`/`PayMongoProvider`), Proxy (`ShoeDiscoveryService`), and composition in checkout.

## Testing

```bash
npm test
```

Runs 19 unit and HTTP contract tests (no live DB). These are **not** the required database-backed integration tests.

## Deployment

Render Blueprint in `render.yaml` (static site + web service) with Supabase and the Maya sandbox webhook. Not yet deployed.

## Outstanding Work

Track in `docs/FINAL_CHECKLIST.md`:

- Webhook signature, amount, and idempotency verification
- Stock release for failed or expired payments
- Per-customer coupon limits
- Database-backed integration tests (6+)
- Full admin UI, complete OpenAPI coverage, Postman/Bruno collection (20+ requests)
- Deployment URLs and Git PR/review evidence
