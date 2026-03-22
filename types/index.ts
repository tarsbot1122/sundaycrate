export type UserRole = 'buyer' | 'seller' | 'admin';

export type ProductStatus = 'draft' | 'active' | 'flagged';

export type OrderStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  stripe_account_id: string | null;
  avatar_url: string | null;
  bio: string | null;
  practice_name: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price_cents: number;
  category: string;
  subcategory: string | null;
  preview_images: string[];
  file_url: string;
  file_type: string;
  download_count: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  seller?: User;
}

export interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  seller_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  stripe_payment_intent_id: string | null;
  status: OrderStatus;
  created_at: string;
  // Joined fields
  product?: Product;
  seller?: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface SellerStats {
  total_sales: number;
  total_earnings_cents: number;
  total_products: number;
  total_orders: number;
}
