# Maya Sandbox Payment Integration

## Provider

SOLEVA uses Maya Checkout in sandbox mode. Maya is configured through `PAYMENT_PROVIDER=maya`.

Required server environment variables:

- `MAYA_PUBLIC_KEY`
- `MAYA_SECRET_KEY`
- `MAYA_WEBHOOK_SECRET`
- `MAYA_ENVIRONMENT=sandbox`
- `CLIENT_URL`

Never place Maya keys in the React frontend or in repository files.

## Checkout flow

1. The client sends the cart and `Idempotency-Key` to `POST /api/v1/checkout`.
2. The backend recomputes the order, creates the pending order, and calls the Maya Checkout API.
3. Maya returns a `checkoutId` and hosted `redirectUrl`.
4. The backend stores both the payment reference and URL on the order.
5. Maya redirects the browser to the configured success, failure, or cancel URL.
6. Browser redirects are informational only.

Create Checkout uses the Maya public key as the Basic Auth username with an empty password. Payment verification uses the secret key the same way. The request represents each monetary amount with a `value` (and `currency: "PHP"` for the checkout total). Item `amount` is the unit price; item `totalAmount` is the quantity-adjusted line total. Keep these fields in the Maya money-object format rather than sending flat formatted strings.

## Webhook and verification

The public endpoint is `POST /api/v1/payments/webhook`. It requires the raw JSON request body and the Maya signature header. The selected header and exact signature format must be verified against the Maya sandbox account configuration.

Before an order is marked paid, the backend:

- verifies the webhook signature,
- stores the event ID uniquely,
- retrieves the checkout from Maya,
- confirms the payment status,
- confirms the PHP amount and currency against the stored order.

A replay is acknowledged once and does not duplicate a status transition. A mismatch is stored on the order and is not marked paid.

## Reconciliation

An order with `pending_payment` status can be checked through the payment provider before a paid transition is applied. Configure the current gateway's retrieve endpoint and run a missed-webhook test during the defense.
