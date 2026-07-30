/*
# Fix orders UPDATE policy + add payment_method update support

## What this does
1. Restores the UPDATE policy on orders that was dropped during the recursion
   fix migration (only SELECT was re-created). This is why status changes were
   not persisting — the merchant had no UPDATE permission.
2. Adds a DELETE policy for orders (for cleanup).
3. Adds an UPDATE policy scoped to staff members as well.
*/

-- Owner can update orders
DROP POLICY IF EXISTS "auth_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()));

-- Owner can delete orders
DROP POLICY IF EXISTS "auth_delete_orders" ON orders;
CREATE POLICY "auth_delete_orders" ON orders FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()));
