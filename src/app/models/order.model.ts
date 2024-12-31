export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  category?: string;
  description?: string;
  portion?: string;
}

export interface Order {
  id: string;
  firebaseKey?: string;
  restaurantId: number;
  restaurantName: string;
  userId: string;
  userName: string;
  status: string;
  totalAmount: number;
  orderDate: string;
  items: OrderItem[];
  orderNumber: string;
}
