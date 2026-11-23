# SOLEVA business rules

| Rule | Endpoint / layer | Expected behavior |
|---|---|---|
| Only active catalog products can be purchased | `GET /products`, checkout service | Inactive or missing product is rejected |
| Selected size must be offered by that shoe | `POST /checkout` | Invalid size returns 422 |
| Quantity per line is 1–5 | `POST /checkout` | Out-of-range quantity returns 422 |
| Stock cannot be reserved below zero | `createOrder` conditional update | Insufficient stock returns 409 |
| Product price is read from PostgreSQL | `createOrder` | Client-supplied price is ignored |
| Coupon must be active, unexpired, under usage limit, and meet minimum spend | `createOrder` | Ineligible coupon returns 422 |
| Shipping is complimentary at subtotal after discount ≥ ₱2,500; otherwise ₱120 | `createOrder` | Server calculates shipping fee |
| Checkout requires an idempotency key | `POST /checkout` | Same key for same user returns existing order |
| Customer can only see own order list | `GET /orders/me` | Query scoped by authenticated user ID |
| Only administrators can access admin routes | `auth` + `admin` middleware | Customer token receives 403 |
| AI suggestions must map to live product IDs | `ShoeDiscoveryService` + controller | Unknown IDs are discarded; displayed product values come from PostgreSQL |
