# Design patterns and OOP — SOLEVA

## MVC / layered architecture
- Problem: HTTP routing, validation, business logic, and persistence become difficult to maintain when mixed.
- Files: `backend/src/routes/api.js`, `backend/src/controllers/controllers.js`, `backend/src/services/orderService.js`, `backend/src/models/index.js`.
- Flow: route → authentication/authorization middleware → controller → service/model → response.
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
- Files: `backend/src/services/orderService.js`, `backend/src/controllers/controllers.js`.
- Checkout behavior composes persistence and provider services; it is a has-a relationship rather than an is-a relationship.
- Trade-off: collaborators must be passed or imported and configured, but they can be replaced and tested independently.
