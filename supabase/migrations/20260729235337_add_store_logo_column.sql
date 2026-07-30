/*
# Add logo column and country/currency support to stores

1. New Columns
- `stores.logo` (text, nullable) — base64-encoded store logo image
- `stores.rubro` already exists in the type but let's ensure it's in the table
2. Modified Tables
- `stores`: add `logo` column
3. Security
- No RLS policy changes needed — existing policies cover the new column
4. Notes
- The `rubro` column already exists from a prior migration
- `country` and `currency_symbol` already exist
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'logo') THEN
    ALTER TABLE stores ADD COLUMN logo text;
  END IF;
END $$;

-- Enable Google OAuth provider settings (this is configured in Supabase dashboard, not via SQL)
-- But we need to make sure the auth.users table supports Google provider
-- Google OAuth is configured in the Supabase Dashboard under Authentication > Providers
