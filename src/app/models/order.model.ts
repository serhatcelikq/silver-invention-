export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  restaurantId: number;
  restaurantName: string;
  userId: number;
  userName: string;
  status: string;
  totalAmount: number;
  orderDate: string;
  items: OrderItem[];
}
