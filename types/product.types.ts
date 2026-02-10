// TypeScript types for Products and Orders

export type ProductCategory = 'plan' | 'consultation' | 'supplement' | 'recipe' | 'other';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'ARS' | 'USD';
  category: ProductCategory;
  image?: string;
  active: boolean;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: CartItem[];
  total: number;
  currency: 'ARS' | 'USD';
  status: OrderStatus;
  mercadoPagoId?: string;
  mercadoPagoStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderData {
  items: CartItem[];
  total: number;
  currency: 'ARS' | 'USD';
}
