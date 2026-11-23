# SOLEVA test plan template

Record the actual run date, environment, command, expected result, actual result, and pass/fail for every case. Do not pre-mark tests as passed.

| ID | Test | Expected result | Actual result | Status |
|---|---|---|---|---|
| T01 | Register new customer | 201 and JWT returned | Pending execution | Not run |
| T02 | Register duplicate email | 409 EMAIL_EXISTS | Pending execution | Not run |
| T03 | Login with wrong password | 401 generic error | Pending execution | Not run |
| T04 | Customer opens admin dashboard | 403 FORBIDDEN | Pending execution | Not run |
| T05 | Search catalog | Matching active shoes only | Pending execution | Not run |
| T06 | Request unknown product ID | 404 | Pending execution | Not run |
| T07 | Checkout with invalid size | 422 | Pending execution | Not run |
| T08 | Checkout with unavailable stock | 409 | Pending execution | Not run |
| T09 | Checkout with modified client price | Server uses database price | Pending execution | Not run |
| T10 | Reuse idempotency key | Same order returned | Pending execution | Not run |
| T11 | Apply expired coupon | 422 and total unchanged | Pending execution | Not run |
| T12 | AI returns unknown product ID | Unknown ID discarded | Pending execution | Not run |
| T13 | AI provider unavailable | Catalog fallback | Pending execution | Not run |
| T14 | Invalid webhook signature | 401, order unchanged | Pending execution | Not run |
| T15 | Replay webhook event | No duplicate state change | Pending execution | Not run |
| T16 | Two buyers request last pair concurrently | One reservation succeeds | Pending execution | Not run |

The instructor brief asks for at least six automated integration tests using a test runner such as Jest/Supertest or equivalent, including auth, role enforcement, checkout pricing, stock conflict, webhook signature rejection, and AI fallback. Add automated tests and attach actual test output before submission.
