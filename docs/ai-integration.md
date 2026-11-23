# AI integration — SOLEVA Shoe Finder

- Provider: Google Gemini API (`GEMINI_API_KEY`, backend only)
- Backend endpoint: `POST /api/v1/ai/shoe-finder`
- Retrieval: search active Supabase PostgreSQL shoe records with available stock, limited to eight candidates
- Prompt: shopper request is serialized as data; only catalog IDs are allowed
- Validation: parse JSON, check returned IDs against the retrieved catalog, discard unknown IDs, and render product name/price/stock from PostgreSQL
- Fallback: return keyword-matched database products when no API key exists or the provider returns an error/invalid output
- Controls: 8 requests per minute per IP, 240-character query maximum, no customer secrets or payment details sent to the model
- UI disclosure: Shoe Finder is identified as AI-assisted

Before defense, run successful and failure-path tests using your own Gemini key and record actual results. The code fallback is not evidence of a live provider response.
