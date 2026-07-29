/*
# Agregar acceso público (anon) para la vista de clientes + tabla store_members

## Cambios
1. SELECT anon en stores, products, banners, categories — para que la tienda pública sea visible sin sesión
2. INSERT anon en orders — ya existía, se mantiene
3. Nueva tabla store_members — para que múltiples colaboradores gestionen la misma tienda
   - id, store_id, user_id, role ('owner'|'staff'), invite_code (código de 8 dígitos para invitar)
4. RLS en store_members — dueño puede ver/agregar/eliminar miembros; staff puede leer su membresía
*/

-- ============ ACCESO PÚBLICO PARA CLIENTES (anon) ============

-- Stores: clientes anon pueden leer cualquier tienda por id
DROP POLICY IF EXISTS "anon_select_stores" ON stores;
CREATE POLICY "anon_select_stores" ON stores FOR SELECT
  TO anon USING (true);

-- Products: clientes anon pueden leer productos de cualquier tienda
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon USING (true);

-- Banners: clientes anon pueden leer banners
DROP POLICY IF EXISTS "anon_select_banners" ON banners;
CREATE POLICY "anon_select_banners" ON banners FOR SELECT
  TO anon USING (true);

-- Categories: clientes anon pueden leer categorías
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon USING (true);

-- ============ TABLA STORE MEMBERS ============

CREATE TABLE IF NOT EXISTS store_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  invite_code text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, user_id)
);

ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;

-- Dueño de la tienda puede ver todos los miembros de su tienda
DROP POLICY IF EXISTS "store_owner_select_members" ON store_members;
CREATE POLICY "store_owner_select_members" ON store_members FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = store_members.store_id AND stores.owner_id = auth.uid())
         OR auth.uid() = user_id);

-- Solo el dueño puede agregar miembros
DROP POLICY IF EXISTS "store_owner_insert_members" ON store_members;
CREATE POLICY "store_owner_insert_members" ON store_members FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = store_members.store_id AND stores.owner_id = auth.uid())
              OR auth.uid() = user_id);

-- Solo el dueño puede eliminar miembros
DROP POLICY IF EXISTS "store_owner_delete_members" ON store_members;
CREATE POLICY "store_owner_delete_members" ON store_members FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = store_members.store_id AND stores.owner_id = auth.uid()));

-- Índice para búsqueda por user_id (login de staff)
CREATE INDEX IF NOT EXISTS idx_store_members_user_id ON store_members(user_id);
CREATE INDEX IF NOT EXISTS idx_store_members_invite_code ON store_members(invite_code);

-- ============ ACTUALIZAR RLS DE STORES/PRODUCTS/BANNERS/CATEGORIES PARA STAFF ============

-- El staff (store_members) también puede leer la tienda y sus datos

DROP POLICY IF EXISTS "staff_select_stores" ON stores;
CREATE POLICY "staff_select_stores" ON stores FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id
         OR EXISTS (SELECT 1 FROM store_members WHERE store_members.store_id = stores.id AND store_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "staff_select_products" ON products;
CREATE POLICY "staff_select_products" ON products FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id
    AND (stores.owner_id = auth.uid()
         OR EXISTS (SELECT 1 FROM store_members WHERE store_members.store_id = stores.id AND store_members.user_id = auth.uid()))));

DROP POLICY IF EXISTS "staff_insert_products" ON products;
CREATE POLICY "staff_insert_products" ON products FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id
    AND (stores.owner_id = auth.uid()
         OR EXISTS (SELECT 1 FROM store_members WHERE store_members.store_id = stores.id AND store_members.user_id = auth.uid()))));

DROP POLICY IF EXISTS "staff_update_products" ON products;
CREATE POLICY "staff_update_products" ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id
    AND (stores.owner_id = auth.uid()
         OR EXISTS (SELECT 1 FROM store_members WHERE store_members.store_id = stores.id AND store_members.user_id = auth.uid()))));

DROP POLICY IF EXISTS "staff_select_banners" ON banners;
CREATE POLICY "staff_select_banners" ON banners FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = banners.store_id
    AND (stores.owner_id = auth.uid()
         OR EXISTS (SELECT 1 FROM store_members WHERE store_members.store_id = stores.id AND store_members.user_id = auth.uid()))));

DROP POLICY IF EXISTS "staff_insert_banners" ON banners;
CREATE POLICY "staff_insert_banners" ON banners FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = banners.store_id
    AND (stores.owner_id = auth.uid()
         OR EXISTS (SELECT 1 FROM store_members WHERE store_members.store_id = stores.id AND store_members.user_id = auth.uid()))));

DROP POLICY IF EXISTS "staff_select_categories" ON categories;
CREATE POLICY "staff_select_categories" ON categories FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id
    AND (stores.owner_id = auth.uid()
         OR EXISTS (SELECT 1 FROM store_members WHERE store_members.store_id = stores.id AND store_members.user_id = auth.uid()))));

DROP POLICY IF EXISTS "staff_select_orders" ON orders;
CREATE POLICY "staff_select_orders" ON orders FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id
    AND (stores.owner_id = auth.uid()
         OR EXISTS (SELECT 1 FROM store_members WHERE store_members.store_id = stores.id AND store_members.user_id = auth.uid()))));
