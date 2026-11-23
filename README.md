# SOLEVA — Professional Shoe Store E-commerce Capstone

SOLEVA is a shoe-focused e-commerce application prepared for the ITPE101 final project brief. It uses a React + Vite storefront, an Express REST API, Supabase PostgreSQL, Maya Checkout sandbox integration, and a backend-only Gemini shoe discovery assistant.

> **Important project status:** this is a complete runnable project scaffold with a polished storefront and working application modules, but it is not a deployed or payment-verified production service. To demonstrate real checkout, webhook verification, and Gemini AI, configure your own sandbox/provider credentials and test them end-to-end. Do not claim a successful gateway transaction until you have run it in Maya sandbox mode and captured the webhook evidence.

## Business concept

**SOLEVA — Contemporary Footwear Store.** SOLEVA sells running, lifestyle, basketball, outdoor, training, and kids' shoes. Its customers need reliable product details, size selection, stock visibility, secure checkout, and help choosing footwear for their intended activity.

### Level 3 business-specific features

1. **Shoe-size and stock-aware ordering.** Every catalog product has a supported size list and stock count. The checkout service validates the selected size, limits quantity, reserves stock with a conditional database update, and rejects unavailable pairs. A size-specific order line records the selected size and color.
2. **Shoe Finder / AI Product Discovery.** A shopper describes intended use, comfort needs, activity, or budget. The backend searches real active catalog records, sends only candidate product data to Gemini, validates returned product IDs against PostgreSQL, and returns database product records. If Gemini is not configured or fails, the feature falls back to matching catalog records.

## Technology

- Frontend: React 18 + Vite
- Backend: Node.js + Express, REST API under `/api/v1`
- Database: Supabase PostgreSQL via `pg`
- Authentication: bcrypt password hashing + 2-hour JWT + role middleware
- Payment: Maya Checkout hosted checkout (sandbox mode only; server-side keys)
- AI: Google Gemini (server-side key only)
- API docs: Swagger UI at `/api-docs`

## Requirements

- Node.js 20 or later
- Supabase project with PostgreSQL connection string
- Maya sandbox public/secret keys and webhook secret for real sandbox checkout
- Gemini API key for live AI recommendations

## Setup

1. Install Node.js and create a Supabase project.
2. Copy `backend/.env.example` to `backend/.env` and fill in the values.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Set `DATABASE_URL` in `backend/.env` to the PostgreSQL connection string from Supabase **Connect → Session pooler**. Keep it secret; the backend creates tables from `backend/schema.sql` on startup.
5. From the project root, run:

```bash
npm install
npm run install:all
npm run seed
npm run dev
```

6. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The API is normally `http://localhost:5000`; Swagger UI is `http://localhost:5000/api-docs`.

If you prefer separate terminals:

```bash
cd backend && npm install && npm run seed && npm run dev
cd frontend && npm install && npm run dev
```

## Seed accounts and coupons

The seed command creates 20 shoe products, three coupons, and one administrator:

- Admin email: `admin@soleva.test`
- Admin password: `Admin12345!`
- Coupons: `WELCOME10`, `SOLEVA200`, `RUN15`

Change the demo admin password before any public deployment. Seed data is for coursework only. Re-running the seed replaces the shoe catalog and coupons and resets the demo admin password.

## API routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register customer |
| POST | `/auth/login` | Public | Sign in |
| GET | `/products` | Public | Search/filter/sort/paginate catalog |
| GET | `/products/:id` | Public | Product detail |
| POST | `/ai/shoe-finder` | Public, rate limited | Database-grounded shoe discovery |
| POST | `/checkout` | Customer | Recalculate order and create hosted payment session |
| GET | `/orders/me` | Customer | Customer's own orders |
| GET | `/admin/dashboard` | Admin | Sales, pending orders, low-stock overview |
| GET | `/admin/orders` | Admin | View all orders |
| PATCH | `/admin/orders/:id/status` | Admin | Validated order lifecycle transition |
| POST | `/admin/products` | Admin | Create shoe |
| PATCH | `/admin/products/:id` | Admin | Update shoe |
| DELETE | `/admin/products/:id` | Admin | Deactivate shoe (soft delete) |
| POST | `/admin/coupons` | Admin | Create coupon |
| POST | `/payments/webhook` | Maya | Webhook receiver; configure public HTTPS URL in Maya |

All success responses use `{ success: true, data }`; error responses use `{ success: false, error }`. Use the `Idempotency-Key` request header for checkout.

## Payment setup checklist

1. Put the Maya sandbox public and secret keys in `MAYA_PUBLIC_KEY` and `MAYA_SECRET_KEY` on the backend only.
2. Configure `MAYA_WEBHOOK_SECRET` from the Maya webhook endpoint.
3. Set `PAYMENT_PROVIDER=maya` and deploy the backend to a public HTTPS host.
4. Register `https://YOUR_API_HOST/api/v1/payments/webhook` with Maya.
5. Complete a test checkout using Maya sandbox credentials.
6. Capture the event ID, webhook response, order status history, and a replay test for your defense.
7. Verify the payment amount and currency against the stored order before marking paid. Review and adapt the provider response mapping to the exact Maya sandbox API version enabled in your account.

Never use live keys or real customer payment details for this coursework project. A checkout redirect alone is not proof of payment.

## AI setup

Set `GEMINI_API_KEY` in `backend/.env`. The frontend calls only `/ai/shoe-finder`; the provider key must never be placed in `frontend/.env`, frontend code, screenshots, or Git. AI output is constrained to product IDs retrieved from the catalog. If the provider is unavailable, a catalog fallback is returned.

## Design patterns and OOP map

- **MVC / layered architecture:** `routes/api.js` → `controllers/controllers.js` → services → PostgreSQL repository.
- **Factory Method:** `PaymentProviderFactory` selects a concrete payment adapter.
- **Inheritance and polymorphism:** abstract-like `PaymentProvider` base class with `PayMongoProvider` and `MayaProvider` subclasses.
- **Proxy:** `ShoeDiscoveryService` wraps Gemini calls, retrieval, validation, and fallback behavior.
- **Composition:** checkout logic composes product, coupon, order, and payment services rather than using deep inheritance.

Maya is the selected provider for this project. The PayMongo adapter remains available as an explicit alternative provider.

## Important implementation checks before defense

The project brief expects verified raw-body webhook signatures, payment amount/currency reconciliation, duplicate-event idempotency, stock restoration after failed/expired payments, coupon per-customer limits, concurrent last-unit tests, a complete admin interface, OpenAPI coverage of every endpoint, at least 20 Postman/Bruno requests with assertions, at least six automated integration tests, deployment URLs, and Git pull-request/code-review evidence. Use `docs/FINAL_CHECKLIST.md` to track the remaining verification work. Do not mark any item complete until it is demonstrated.

## Deployment topology

- Frontend: Vercel or Netlify
- API: Render or Railway
- Database: Supabase PostgreSQL
- Payment: Maya Sandbox webhook to deployed HTTPS API

Set `VITE_API_URL` to the deployed API's `/api/v1` URL and configure all backend environment variables in the hosting provider dashboard. Never upload `.env` files.

## Current verification status

The frontend JSX and backend JavaScript syntax have been checked. The Node.js unit tests cover the payment-provider abstraction/factory. These are **not** the six required HTTP integration tests. Configure a Supabase `DATABASE_URL`, apply the SQL schema, and run the database-backed workflows before claiming the migration or Maya sandbox webhook integration is verified. Stock release/reconciliation for failed or expired payments, server-persistent cart endpoints, coupon per-customer usage enforcement, and a full admin workflow test remain outstanding. Deployment has not been performed. See the checklist before submitting or defending.
