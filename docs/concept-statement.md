# SOLEVA — Shoe Store Business Concept

## Business overview
SOLEVA is a contemporary footwear e-commerce store offering shoes for everyday lifestyle, running, basketball, outdoor activities, training, and kids. The store is designed for customers who want to compare styles, confirm size availability, understand product details, and purchase footwear through a convenient online experience.

## Intended customers
The primary customers are students, working adults, fitness enthusiasts, and families shopping for practical footwear. They need clear product information, available sizes, current stock, fair pricing, and a secure checkout process.

## Administrator
The administrator manages the shoe catalog, product details, prices, size options, stock, coupons, and orders. Protected administrator endpoints prevent customer accounts from performing store-management actions.

## Why SOLEVA needs business-specific rules
Shoes are not generic inventory. A product may be available in one size but unavailable in another. The checkout must validate that the selected size is offered and reserve available stock so the store does not sell more pairs than it has. Customers also often shop based on intended activity, comfort needs, and budget, so a shoe-specific discovery assistant can help them navigate the catalog.

## Differentiated features
1. **Size-aware inventory and checkout:** products store size options and total available stock; the checkout validates selected sizes and quantities and reserves stock using a conditional database update.
2. **AI Shoe Finder:** the customer describes their activity, preferred feel, or budget. The backend retrieves matching shoes from the database, asks the AI provider to rank/explain only those candidates, validates returned IDs, and displays product information from the database. If AI is unavailable, the system uses catalog search as a fallback.

## Revenue and operations
SOLEVA earns revenue from footwear sales. Promotional coupon codes support customer acquisition while server-side rules enforce expiry, minimum spend, and usage limits. The administrator monitors paid orders, gross sales, pending orders, and low-stock items.

## System boundary
The React storefront and admin view consume the Express REST API. Supabase PostgreSQL stores users, products, coupons, orders, and webhook events. Maya Checkout hosts the payment page in sandbox mode and sends webhook events to the backend. Gemini is called only by the backend for shoe discovery.
