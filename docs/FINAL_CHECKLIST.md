# ITPE101 final submission checklist — SOLEVA

This follows the uploaded 27-page ITPE101 instructional document. Treat every item as incomplete until it has real test evidence.

## Required evidence
- [ ] Public deployed React frontend URL and API URL (HTTPS)
- [ ] Git repository with incremental commits from all group members
- [ ] ERD and architecture diagram reviewed against actual database schema
- [ ] OpenAPI 3 file covers every route, schema, auth scheme, and error
- [ ] Swagger UI works at `/api-docs`
- [ ] Postman or Bruno collection has 20+ requests, environment variables, assertions, and negative cases
- [ ] At least six automated integration tests run against a test database
- [ ] Test plan lists expected and actual results with execution date
- [ ] Code review record contains three substantive findings and fixes
- [ ] Refactor note describes before/after and confirms tests still pass
- [ ] Design-pattern document includes exact files, request flow, trade-offs, and rejected alternatives
- [ ] AI integration note documents model, prompt, retrieval, validation, fallback, privacy, and cost controls
- [ ] Payment evidence includes test checkout, signed webhook, replay, invalid signature, amount/currency verification, and missed-webhook recovery
- [ ] Demo recording is available as a network-failure backup
- [ ] Individual contribution statement matches Git history

## Minimum live defense flow
1. Customer registration and sign-in
2. Browse/search/filter shoes; open product; choose size
3. Add to cart; demonstrate server-calculated total and coupon behavior
4. Create order and complete a Maya sandbox checkout
5. Show webhook event moves pending order to paid; replay event safely
6. Show admin catalog, stock, coupon, order, and dashboard tools
7. Ask the AI Shoe Finder a natural-language question and explain database grounding/fallback
8. Walk through architecture, patterns, abstract base class, subclasses, composition, and tests

## Project-specific Level 3 features
- [ ] Demonstrate size validation and stock reservation for a shoe size
- [ ] Demonstrate AI shoe discovery using real catalog product records
- [ ] Document the server-side rules and negative tests for both features
