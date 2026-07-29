import { supabase } from './supabase';
import type { Store, Product, Category, Banner, Order, PlanType, StoreMember } from './types';

// ============ STORE ============
export async function fetchStoreByOwner(ownerId: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error) throw error;
  return data as Store | null;
}

export async function fetchStoreById(storeId: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .maybeSingle();
  if (error) throw error;
  return data as Store | null;
}

export async function updateStore(storeId: string, updates: Partial<Store>): Promise<void> {
  const { error } = await supabase.from('stores').update(updates).eq('id', storeId);
  if (error) throw error;
}

// ============ PRODUCTS ============
export async function fetchProducts(storeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Product[];
}

export async function createProduct(storeId: string, p: Omit<Product, 'id' | 'store_id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...p, store_id: storeId })
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ============ CATEGORIES ============
export async function fetchCategories(storeId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []) as Category[];
}

export async function replaceCategories(storeId: string, categories: { name: string; subcategories: string[]; sort_order: number }[]): Promise<Category[]> {
  await supabase.from('categories').delete().eq('store_id', storeId);
  if (categories.length === 0) return [];
  const rows = categories.map((c, i) => ({ ...c, store_id: storeId, sort_order: i }));
  const { data, error } = await supabase.from('categories').insert(rows).select();
  if (error) throw error;
  return (data || []) as Category[];
}

// ============ BANNERS ============
export async function fetchBanners(storeId: string): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('store_id', storeId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []) as Banner[];
}

export async function addBanner(storeId: string, imageUrl: string): Promise<Banner> {
  const { data, error } = await supabase
    .from('banners')
    .insert({ store_id: storeId, image_url: imageUrl })
    .select()
    .single();
  if (error) throw error;
  return data as Banner;
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}

// ============ ORDERS ============
export async function fetchOrders(storeId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Order[];
}

export async function createOrder(storeId: string, order: Omit<Order, 'id' | 'store_id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('orders').insert({ ...order, store_id: storeId });
  if (error) throw error;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
}

// ============ PLAN ============
export async function updatePlan(storeId: string, plan: PlanType): Promise<void> {
  const { error } = await supabase.from('stores').update({ plan }).eq('id', storeId);
  if (error) throw error;
}

// ============ STORE MEMBERS ============
export async function fetchMembers(storeId: string): Promise<StoreMember[]> {
  const { data, error } = await supabase
    .from('store_members')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as StoreMember[];
}

export async function generateInviteCode(storeId: string): Promise<string> {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const { error } = await supabase
    .from('store_members')
    .insert({ store_id: storeId, user_id: (await supabase.auth.getUser()).data.user?.id, role: 'staff', invite_code: code });
  if (error && !error.message.includes('duplicate')) throw error;
  return code;
}

export async function joinStoreByCode(code: string, userId: string): Promise<{ storeId: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('store_members')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .maybeSingle();
  if (error) return { storeId: null, error: error.message };
  if (!data) return { storeId: null, error: 'Código de invitación no válido.' };
  // Actualizar el member existente con el user_id real
  const { error: updateError } = await supabase
    .from('store_members')
    .update({ user_id: userId })
    .eq('id', data.id);
  if (updateError) return { storeId: null, error: updateError.message };
  return { storeId: data.store_id, error: null };
}

export async function deleteMember(memberId: string): Promise<void> {
  const { error } = await supabase.from('store_members').delete().eq('id', memberId);
  if (error) throw error;
}
