export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: number;
  productName: string;
  brand: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderId: number;

  userId: number;
  userName: string;
  userEmail: string;

  items: OrderItem[];

  totalPrice: number;
  totalAmount: number;

  status: OrderStatus;

  createdAt: string;
  updatedAt: string;
}