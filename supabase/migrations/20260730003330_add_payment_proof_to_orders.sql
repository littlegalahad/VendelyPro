/*
# Add payment proof column to orders

## What this does
Adds a `payment_proof` text column to the `orders` table so that when a customer
uploads a screenshot of their payment (Yape/Plin, bank transfer, card receipt),
that image is saved with the order and the merchant can see it in the orders panel.

WhatsApp links (wa.me) cannot attach images programmatically, so the proof is
stored in the database instead and shown to the merchant in the admin panel.
The customer is instructed to also attach the image in the WhatsApp chat.

## Changes
1. `orders` table — new column `payment_proof` (text, nullable). Stores a base64
   data URL of the payment screenshot uploaded by the customer.

## Security
- No RLS policy changes. Existing policies already allow anon INSERT and
  owner-scoped SELECT/UPDATE/DELETE. The new column is covered by those existing
  policies automatically.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_proof text;
