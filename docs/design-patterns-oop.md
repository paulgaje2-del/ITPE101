# Design patterns and OOP — SOLEVA

## MVC / layered architecture
- Problem: HTTP routing, validation, business logic, and persistence become difficult to maintain when mixed.
- Files: `backend/src/routes/*.routes.js`, `backend/src/controllers/*.controller.js`, `backend/src/services/*.service.js`, `backend/src/repositories/*.repository.js`, `backend/src/validators/*.validator.js`.
- Flow: route → authentication/authorization and validation middleware → controller → service → repository/model → response.
- Trade-off: more files and indirection, but business rules are easier to test.
- Alternative rejected: placing database queries directly in route handlers.

## Factory Method + inheritance
- Problem: checkout should not depend on one concrete payment provider.
- Files: `backend/src/services/paymentProvider.js`.
- `PaymentProvider` defines the provider contract; `PayMongoProvider` and `MayaProvider` specialize it; `PaymentProviderFactory.create()` selects the adapter.
- Trade-off: provider substitution is clearer, but each adapter must correctly map its provider's API and webhook semantics.
- Alternative rejected: scattering provider-specific conditionals throughout controllers.

## Proxy
- Problem: AI retrieval, provider calls, output validation, and fallback should not be repeated in controllers.
- File: `backend/src/services/aiService.js`.
- `ShoeDiscoveryService` retrieves catalog candidates, calls Gemini when configured, validates returned IDs, and falls back to catalog matches.
- Trade-off: the proxy adds a layer but protects the application from malformed or unavailable AI responses.
- Alternative rejected: calling Gemini directly from React.

## Composition
- Problem: checkout needs product, coupon, order, and payment collaborators without a deep inheritance tree.
- Files: `backend/src/services/checkout.service.js`, `backend/src/services/orderService.js`, `backend/src/controllers/order.controller.js`.
- Checkout behavior composes persistence and provider services; it is a has-a relationship rather than an is-a relationship.
- Trade-off: collaborators must be passed or imported and configured, but they can be replaced and tested independently.

## Automated tests
- `npm test` runs Node's test runner over `backend/test`.
- HTTP contract tests exercise success envelopes, request validation, authentication, role authorization, and webhook signature rejection through the Express application.
- Order transition and payment-provider behavior are covered by unit tests. The HTTP tests intentionally use validation/authentication paths that do not require a live Supabase database; database-backed integration tests still require a dedicated test database.
