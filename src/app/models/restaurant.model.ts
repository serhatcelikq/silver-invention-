export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  category: string;
  address: string;
  rating?: number;
  menu: MenuItem[];
  imageUrl?: string;
}
