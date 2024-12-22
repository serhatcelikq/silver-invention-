export interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  portion: string;
  quantity: number;
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  address: string;
  image: string;
  isFavorite: boolean;
  menu: MenuItem[];
} 