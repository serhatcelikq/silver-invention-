export interface Order {
  id: string;
  firebaseKey?: string;
  userId: string;
  userName: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  orderNumber: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
}
