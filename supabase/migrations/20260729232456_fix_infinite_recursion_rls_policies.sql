-- Fix infinite recursion between stores and store_members RLS policies

-- ============ STORES: simplify SELECT policy for authenticated users ============
-- Remove the store_members subquery that causes recursion with store_members policies
DROP POLICY IF EXISTS "staff_select_stores" ON stores;
CREATE POLICY "auth_select_stores" ON stores FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- ============ STORE_MEMBERS: simplify policies to avoid recursion ============
-- A user can read their own membership records (no need to check stores.owner_id)
DROP POLICY IF EXISTS "store_owner_select_members" ON store_members;
CREATE POLICY "select_own_membership" ON store_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- A user can insert their own membership (e.g. accepting an invite)
DROP POLICY IF EXISTS "store_owner_insert_members" ON store_members;
CREATE POLICY "insert_own_membership" ON store_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- A user can delete their own membership (leave a store)
DROP POLICY IF EXISTS "store_owner_delete_members" ON store_members;
CREATE POLICY "delete_own_membership" ON store_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============ PRODUCTS: simplify to only check stores.owner_id (no store_members) ============
DROP POLICY IF EXISTS "staff_select_products" ON products;
CREATE POLICY "auth_select_products" ON products FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "staff_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "staff_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()));

-- ============ BANNERS: simplify ============
DROP POLICY IF EXISTS "staff_select_banners" ON banners;
CREATE POLICY "auth_select_banners" ON banners FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = banners.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "staff_insert_banners" ON banners;
CREATE POLICY "auth_insert_banners" ON banners FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = banners.store_id AND stores.owner_id = auth.uid()));

-- ============ CATEGORIES: simplify ============
DROP POLICY IF EXISTS "staff_select_categories" ON categories;
CREATE POLICY "auth_select_categories" ON categories FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.owner_id = auth.uid()));

-- ============ ORDERS: simplify ============
DROP POLICY IF EXISTS "staff_select_orders" ON orders;
CREATE POLICY "auth_select_orders" ON orders FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()));
