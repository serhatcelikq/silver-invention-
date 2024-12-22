import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orders: Order[] = [];
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor() {
    this.loadOrders();
  }

  private loadOrders() {
    try {
      const allOrders: Order[] = [];
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // Kullanıcıları ve siparişlerini yükle
      users.forEach((user: any) => {
        const userOrders = localStorage.getItem(`orders_${user.id}`);
        if (userOrders) {
          // Siparişleri yüklerken güncel kullanıcı adını kullan
          const orders = JSON.parse(userOrders).map((order: Order) => ({
            ...order,
            userName: user.name, // Güncel kullanıcı adını kullan
          }));
          allOrders.push(...orders);
        }
      });

      this.orders = allOrders;
      this.ordersSubject.next(this.orders);
    } catch (error) {
      console.error('Siparişleri yükleme hatası:', error);
    }
  }

  getOrders(): Order[] {
    return this.orders;
  }

  addOrder(order: Order) {
    // Yeni siparişi orders dizisine ekle
    this.orders.push(order);

    // Kullanıcının siparişlerini güncelle
    const userOrders = localStorage.getItem(`orders_${order.userId}`) || '[]';
    const updatedUserOrders = [...JSON.parse(userOrders), order];
    localStorage.setItem(
      `orders_${order.userId}`,
      JSON.stringify(updatedUserOrders)
    );

    // BehaviorSubject'i güncelle
    this.ordersSubject.next(this.orders);
  }

  updateOrderStatus(orderId: number, status: string): void {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;

      // Kullanıcının siparişlerini güncelle
      const userOrders = JSON.parse(
        localStorage.getItem(`orders_${order.userId}`) || '[]'
      );
      const updatedUserOrders = userOrders.map((o: Order) =>
        o.id === orderId ? { ...o, status } : o
      );
      localStorage.setItem(
        `orders_${order.userId}`,
        JSON.stringify(updatedUserOrders)
      );

      // BehaviorSubject'i güncelle
      this.ordersSubject.next(this.orders);
    }
  }

  // Yeni sipariş eklendiğinde tüm siparişleri yeniden yükle
  refreshOrders() {
    console.log('Siparişler yenileniyor...');
    this.loadOrders();
  }

  cancelOrder(orderId: number): Observable<boolean> {
    return new Observable((observer) => {
      try {
        // Önce siparişi bul
        const orderToDelete = this.orders.find((order) => order.id === orderId);

        if (!orderToDelete) {
          observer.error(new Error('Sipariş bulunamadı'));
          return;
        }

        // Siparişi ana listeden kaldır
        this.orders = this.orders.filter((order) => order.id !== orderId);

        // Kullanıcının siparişlerini güncelle
        const userId = orderToDelete.userId;
        let userOrders = JSON.parse(
          localStorage.getItem(`orders_${userId}`) || '[]'
        );
        userOrders = userOrders.filter((order: Order) => order.id !== orderId);

        // LocalStorage'ı güncelle
        localStorage.setItem(`orders_${userId}`, JSON.stringify(userOrders));

        // Tüm siparişleri içeren listeyi güncelle
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        allUsers.forEach((user: any) => {
          const orders = JSON.parse(
            localStorage.getItem(`orders_${user.id}`) || '[]'
          );
          if (orders.some((o: Order) => o.id === orderId)) {
            const updatedOrders = orders.filter((o: Order) => o.id !== orderId);
            localStorage.setItem(
              `orders_${user.id}`,
              JSON.stringify(updatedOrders)
            );
          }
        });

        // BehaviorSubject'i güncelle
        this.ordersSubject.next(this.orders);

        console.log('Sipariş silindi:', {
          orderId,
          userId,
          remainingOrders: this.orders,
          userOrders,
        });

        observer.next(true);
        observer.complete();
      } catch (error) {
        console.error('Sipariş silme hatası:', error);
        observer.error(error);
      }
    });
  }

  // Yardımcı metod: Belirli bir kullanıcının siparişlerini getir
  getUserOrders(userId: number): Order[] {
    const userOrders = localStorage.getItem(`orders_${userId}`);
    return userOrders ? JSON.parse(userOrders) : [];
  }

  // Kullanıcı adı güncellendiğinde siparişlerdeki kullanıcı adını güncelle
  updateOrdersUserName(userId: number, newUserName: string) {
    // Bellek üzerindeki siparişleri güncelle
    this.orders = this.orders.map((order) => {
      if (order.userId === userId) {
        return { ...order, userName: newUserName };
      }
      return order;
    });

    // LocalStorage'daki siparişleri güncelle
    const userOrders = JSON.parse(
      localStorage.getItem(`orders_${userId}`) || '[]'
    );
    const updatedUserOrders = userOrders.map((order: Order) => ({
      ...order,
      userName: newUserName,
    }));
    localStorage.setItem(`orders_${userId}`, JSON.stringify(updatedUserOrders));

    // BehaviorSubject'i güncelle
    this.ordersSubject.next(this.orders);

    console.log('Siparişlerdeki kullanıcı adı güncellendi:', {
      userId,
      newUserName,
      updatedOrders: this.orders,
    });
  }
}
