import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, from, map, switchMap, take, of } from 'rxjs';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  portion?: string;
  quantity?: number;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  phone: string;
  email: string;
  startDate: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  rating?: number;
  reviews?: number;
  menu: MenuItem[];
  employees?: Employee[];
  url?: string;
  image?: string;
  isFavorite?: boolean;
  owner?: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
  };
}

export interface Order {
  id?: string;
  userId: string;
  userName?: string;
  restaurantId: string;
  restaurantName: string;
  items: MenuItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  orderNumber: string;
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  constructor(private db: AngularFireDatabase) {}

  getRestaurants(): Observable<Restaurant[]> {
    return this.db
      .list<Restaurant>('restaurants')
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            ...(c.payload.val() as Restaurant),
            id: c.payload.key as string,
          }))
        )
      );
  }

  getRestaurantById(id: string): Observable<Restaurant | null> {
    return this.db.object<Restaurant>(`restaurants/${id}`).valueChanges();
  }

  addRestaurant(restaurant: Restaurant): Observable<void> {
    const newId = this.db.createPushId();
    restaurant.id = newId;
    return from(this.db.object(`restaurants/${newId}`).set(restaurant));
  }

  updateRestaurant(
    restaurantId: string,
    updateData: Partial<Restaurant>
  ): Observable<void> {
    return from(
      this.db.object(`restaurants/${restaurantId}`).update(updateData)
    );
  }

  deleteRestaurant(restaurantId: string): Observable<void> {
    return from(this.db.object(`restaurants/${restaurantId}`).remove());
  }

  // Menü işlemleri
  addMenuItem(restaurantId: string, menuItem: MenuItem): Observable<void> {
    return this.getRestaurantById(restaurantId).pipe(
      switchMap((restaurant) => {
        if (!restaurant) throw new Error('Restoran bulunamadı');
        const menu = restaurant.menu || [];
        menu.push({ ...menuItem, id: Date.now() });
        return from(
          this.db.object(`restaurants/${restaurantId}/menu`).set(menu)
        );
      })
    );
  }

  // Çalışan işlemleri
  addEmployee(restaurantId: string, employee: Employee): Observable<void> {
    return this.getRestaurantById(restaurantId).pipe(
      switchMap((restaurant) => {
        if (!restaurant) throw new Error('Restoran bulunamadı');
        const employees = restaurant.employees || [];
        employees.push({ ...employee, id: Date.now() });
        return from(
          this.db.object(`restaurants/${restaurantId}/employees`).set(employees)
        );
      })
    );
  }

  updateEmployee(restaurantId: string, employee: Employee): Observable<void> {
    return from(
      this.db
        .object(`restaurants/${restaurantId}/employees/${employee.id}`)
        .update(employee)
    );
  }

  deleteEmployee(restaurantId: string, employeeId: number): Observable<void> {
    return from(
      this.db
        .object(`restaurants/${restaurantId}/employees/${employeeId}`)
        .remove()
    );
  }

  // Favori işlemleri
  getFavorites(): Observable<Restaurant[]> {
    return this.getRestaurants().pipe(
      map((restaurants) => restaurants.filter((r) => r.isFavorite))
    );
  }

  toggleFavorite(restaurant: Restaurant): Observable<void> {
    return from(
      this.db
        .object(`restaurants/${restaurant.id}`)
        .update({ isFavorite: !restaurant.isFavorite })
    );
  }

  // Sipariş işlemleri
  getAllOrders(): Observable<Order[]> {
    return this.db.list<Order>('orders').valueChanges();
  }

  getRestaurantOrders(restaurantId: string): Observable<Order[]> {
    return this.db
      .list<Order>('orders', (ref) =>
        ref.orderByChild('restaurantId').equalTo(restaurantId)
      )
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            ...(c.payload.val() as Order),
            key: c.payload.key,
          }))
        )
      );
  }

  getUserOrders(userId: string): Observable<Order[]> {
    return this.db.list<Order>(`user-orders/${userId}`).valueChanges();
  }

  createOrder(order: Order): Observable<void> {
    const orderId = this.db.createPushId();
    const orderWithId = { ...order, id: orderId };

    return from(
      Promise.all([
        this.db.object(`orders/${orderId}`).set(orderWithId),
        this.db
          .object(`restaurant-orders/${order.restaurantId}/${orderId}`)
          .set(orderWithId),
        this.db
          .object(`user-orders/${order.userId}/${orderId}`)
          .set(orderWithId),
      ]).then(() => void 0)
    );
  }

  updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Observable<void> {
    return from(
      Promise.all([
        this.db.object(`orders/${orderId}`).update({ status }),
        this.db.object(`restaurant-orders/${orderId}`).update({ status }),
        this.db.object(`user-orders/${orderId}`).update({ status }),
      ]).then(() => void 0)
    );
  }

  deleteOrder(orderId: string): Observable<void> {
    return from(
      Promise.all([
        this.db.object(`orders/${orderId}`).remove(),
        this.db.object(`restaurant-orders/${orderId}`).remove(),
        this.db.object(`user-orders/${orderId}`).remove(),
      ]).then(() => void 0)
    );
  }

  getMyRestaurant(): Observable<Restaurant | null> {
    const restaurantId = localStorage.getItem('currentRestaurantId');
    if (!restaurantId) return of(null);
    return this.getRestaurantById(restaurantId);
  }

  // Menü güncelleme metodu
  updateMenu(restaurantId: string, menu: MenuItem[]): Observable<void> {
    return from(this.db.object(`restaurants/${restaurantId}/menu`).set(menu));
  }

  // Çalışan listesi getirme metodu
  getEmployees(restaurantId: string): Observable<Employee[]> {
    return this.db
      .object<Restaurant>(`restaurants/${restaurantId}`)
      .valueChanges()
      .pipe(map((restaurant) => restaurant?.employees || []));
  }

  // Restoran sahibi girişi
  loginRestaurantOwner(
    email: string,
    password: string
  ): Promise<Restaurant | null> {
    return this.db
      .list<Restaurant>('restaurants', (ref) =>
        ref.orderByChild('owner/email').equalTo(email)
      )
      .valueChanges()
      .pipe(
        take(1),
        map((restaurants) => {
          const restaurant = restaurants?.[0];
          if (restaurant?.owner?.password === password) {
            return restaurant;
          }
          return null;
        })
      )
      .toPromise()
      .then((result) => result || null);
  }
}
