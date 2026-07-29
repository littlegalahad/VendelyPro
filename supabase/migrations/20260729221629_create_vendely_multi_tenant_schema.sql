/*
# Vendely Pro - Esquema multi-tenant para comerciantes

## Resumen
Crea el esquema completo de la app Vendely Pro: cada comerciante (dueño de tienda)
tiene su propia tienda con productos, categorías, banners y pedidos. Los clientes
hacen pedidos sin necesidad de cuenta (vía enlace/QR) y el pedido se envía por WhatsApp.

## Tablas nuevas

1. `stores` — Una tienda por comerciante.
   - `id` (uuid, PK)
   - `owner_id` (uuid, FK a auth.users, dueño de la tienda)
   - `name`, `slogan`, `rubro`, `whatsapp`, `logo`, `currency_symbol`, `country`
   - `theme`, `font`, `plan` (configuración visual y plan de suscripción)
   - `payments` (jsonb, configuración de métodos de pago)
   - `created_at`, `updated_at`

2. `categories` — Categorías y subcategorías de productos de una tienda.
   - `id` (uuid, PK)
   - `store_id` (uuid, FK a stores)
   - `name`, `subcategories` (text[])
   - `sort_order` (int, orden de visualización)

3. `products` — Productos del catálogo de una tienda.
   - `id` (uuid, PK)
   - `store_id` (uuid, FK a stores)
   - `name`, `description`, `price`, `offer_price`, `is_offer`
   - `category`, `subcategory`, `image`, `stock`, `is_featured`
   - `created_at`, `updated_at`

4. `banners` — Banners promocionales de una tienda.
   - `id` (uuid, PK)
   - `store_id` (uuid, FK a stores)
   - `image_url`, `title`, `subtitle`, `link_url`, `sort_order`

5. `orders` — Pedidos realizados por clientes.
   - `id` (uuid, PK)
   - `store_id` (uuid, FK a stores)
   - `customer_name`, `phone`, `delivery_method`, `address`, `payment_method`
   - `items` (jsonb, lista de productos del pedido)
   - `total` (numeric)
   - `status` (text: pending/preparing/shipped/delivered)
   - `created_at`

## Seguridad (RLS)

- `stores`: el dueño autenticado puede hacer CRUD solo en su tienda.
- `categories`, `products`, `banners`: CRUD por el dueño autenticado de la tienda dueña.
- `orders`: 
  - INSERT por anon (clientes sin cuenta pueden crear pedidos).
  - SELECT y UPDATE por el dueño autenticado de la tienda.

## Notas
1. `owner_id` tiene DEFAULT auth.uid() para que los inserts del frontend funcionen.
2. Índices en store_id para optimizar consultas por tienda.
3. Cascade delete: si se borra una tienda, se borran sus datos asociados.
*/

-- ============ STORES ============
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Mi Tienda',
  slogan text DEFAULT '',
  rubro text DEFAULT '',
  whatsapp text DEFAULT '',
  logo text DEFAULT '',
  currency_symbol text NOT NULL DEFAULT 'S/',
  country text DEFAULT 'PE',
  theme text NOT NULL DEFAULT 'proDark',
  font text NOT NULL DEFAULT 'Inter',
  plan text NOT NULL DEFAULT 'free',
  payments jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_stores" ON stores;
CREATE POLICY "select_own_stores" ON stores FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_stores" ON stores;
CREATE POLICY "insert_own_stores" ON stores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_stores" ON stores;
CREATE POLICY "update_own_stores" ON stores FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_stores" ON stores;
CREATE POLICY "delete_own_stores" ON stores FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  subcategories text[] DEFAULT '{}'::text[],
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_categories" ON categories;
CREATE POLICY "select_own_categories" ON categories FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_categories" ON categories;
CREATE POLICY "insert_own_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_categories" ON categories;
CREATE POLICY "update_own_categories" ON categories FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_categories" ON categories;
CREATE POLICY "delete_own_categories" ON categories FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.owner_id = auth.uid()));

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  offer_price numeric(10,2),
  is_offer boolean DEFAULT false,
  category text NOT NULL DEFAULT 'General',
  subcategory text,
  image text DEFAULT '',
  stock int DEFAULT 10,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_products" ON products;
CREATE POLICY "select_own_products" ON products FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()));

-- ============ BANNERS ============
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  title text,
  subtitle text,
  link_url text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_banners" ON banners;
CREATE POLICY "select_own_banners" ON banners FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = banners.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_banners" ON banners;
CREATE POLICY "insert_own_banners" ON banners FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = banners.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_banners" ON banners;
CREATE POLICY "update_own_banners" ON banners FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = banners.store_id AND stores.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = banners.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_banners" ON banners;
CREATE POLICY "delete_own_banners" ON banners FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = banners.store_id AND stores.owner_id = auth.uid()));

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name text DEFAULT 'Cliente WhatsApp',
  phone text,
  delivery_method text DEFAULT 'delivery',
  address text,
  payment_method text DEFAULT 'yape',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- El dueño de la tienda puede ver y actualizar sus pedidos
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()));

-- Clientes anónimos pueden crear pedidos (no necesitan cuenta)
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_banners_store_id ON banners(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_stores_updated_at ON stores;
CREATE TRIGGER trigger_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
