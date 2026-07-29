export type PlanType = 'free' | 'monthly' | 'yearly';

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slogan: string;
  rubro: string;
  whatsapp: string;
  logo: string;
  currency_symbol: string;
  country: string;
  theme: string;
  font: string;
  plan: PlanType;
  payments: PaymentConfig;
  catalog_layout: string;
  custom_bg_color: string | null;
  custom_text_color: string | null;
  custom_accent_color: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  offer_price: number | null;
  is_offer: boolean;
  category: string;
  subcategory: string | null;
  image: string;
  stock: number;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  subcategories: string[];
  sort_order: number;
}

export interface Banner {
  id: string;
  store_id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_url: string | null;
  sort_order: number;
}

export interface PaymentConfig {
  yapePlinNumber?: string;
  yapePlinHolder?: string;
  bankAccountDetails?: string;
  cardPaymentLink?: string;
  acceptsCash?: boolean;
  acceptsCard?: boolean;
  acceptsYape?: boolean;
  acceptsBankTransfer?: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  store_id: string;
  customer_name: string;
  phone: string | null;
  delivery_method: 'delivery' | 'pickup';
  address: string | null;
  payment_method: 'yape' | 'card' | 'cash' | 'bank';
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'shipped' | 'delivered';
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  offer_price: number | null;
  is_offer: boolean;
  category: string;
  subcategory: string | null;
  image: string;
  stock: number;
  is_featured: boolean;
  quantity: number;
}
