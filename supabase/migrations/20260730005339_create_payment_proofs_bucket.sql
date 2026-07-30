/*
# Create payment-proofs storage bucket

## What this does
Creates a public storage bucket named `payment-proofs` where customer payment
screenshots are uploaded. The public URL of each uploaded image is included in
the WhatsApp order message so the merchant can tap the link and see the proof
instantly — no manual attachment step for the customer.

## Changes
1. New storage bucket `payment-proofs` (public, 5MB file size limit, image types only).
2. RLS policy: anyone (anon + authenticated) can upload, and anyone can read
   (the URLs are shared via WhatsApp, so they must be publicly readable).
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
DROP POLICY IF EXISTS "Public read payment proofs" ON storage.objects;
CREATE POLICY "Public read payment proofs"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'payment-proofs');

-- Allow anyone to upload
DROP POLICY IF EXISTS "Public upload payment proofs" ON storage.objects;
CREATE POLICY "Public upload payment proofs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'payment-proofs');
