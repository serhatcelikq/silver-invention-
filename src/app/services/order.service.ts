import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AuthService } from './auth.service';
import { Observable, from, firstValueFrom, take } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { Order } from '../models/order.model';

// Order'ı type olarak re-export ediyoruz
export type { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService,
    private userService: UserService
  ) {}

  // createOrder metodunu ekleyelim
  createOrder(orderData: Partial<Order>): Observable<void> {
    return new Observable((subscriber) => {
      this.authService.user$.pipe(take(1)).subscribe(async (user) => {
        if (!user) {
          subscriber.error(new Error('Kullanıcı bulunamadı'));
          return;
        }

        try {
          const orderId = this.db.createPushId();
          const order: Order = {
            id: orderId,
            orderNumber: this.generateOrderNumber(),
            orderDate: new Date().toISOString(),
            status: 'Beklemede',
            userId: user.uid,
            userName:
              user.displayName || user.email?.split('@')[0] || 'Misafir',
            ...orderData,
          } as Order;

          await this.db.object(`orders/${orderId}`).set(order);
          subscriber.next();
          subscriber.complete();
        } catch (error) {
          console.error('Sipariş oluşturma hatası:', error);
          subscriber.error(error);
        }
      });
    });
  }

  getOrders(): Observable<Order[]> {
    return this.db
      .list<Order>('orders', (ref) => ref.orderByChild('orderDate'))
      .snapshotChanges()
      .pipe(
        map((changes: any[]) =>
          changes.map((c: any) => {
            const data = c.payload.val() as Order;
            const id = c.payload.key as string;
            return { ...data, id };
          })
        )
      );
  }

  getUserOrders(userId: string): Observable<Order[]> {
    return this.db
      .list<Order>('orders', (ref) =>
        ref.orderByChild('userId').equalTo(userId)
      )
      .snapshotChanges()
      .pipe(
        map((changes: any[]) =>
          changes
            .map((c: any) => ({
              ...(c.payload.val() as Order),
              key: c.payload.key,
            }))
            .sort(
              (a: Order, b: Order) =>
                new Date(b.orderDate).getTime() -
                new Date(a.orderDate).getTime()
            )
        )
      );
  }

  getRestaurantOrders(restaurantId: number): Observable<Order[]> {
    return this.db
      .list<Order>('orders', (ref) =>
        ref.orderByChild('restaurantId').equalTo(restaurantId)
      )
      .valueChanges();
  }

  updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Observable<void> {
    return new Observable((subscriber) => {
      this.db
        .object(`orders/${orderId}`)
        .update({ status })
        .then(() => {
          subscriber.next();
          subscriber.complete();
        })
        .catch((error) => subscriber.error(error));
    });
  }

  cancelOrder(orderId: string): Observable<void> {
    return from(
      this.db
        .object(`orders/${orderId}`)
        .remove()
        .then(() => {
          console.log('Sipariş başarıyla silindi:', orderId);
        })
        .catch((error: Error) => {
          console.error('Sipariş silinirken hata:', error);
          throw error;
        })
    );
  }

  refreshOrders(): void {
    // Firebase Realtime Database otomatik güncelleniyor
    // Bu metod sadece interface uyumluluğu için var
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `SP${timestamp.slice(-6)}${random}`;
  }

  getOrderById(orderId: string): Observable<Order | null> {
    return this.db.object<Order>(`orders/${orderId}`).valueChanges();
  }
}
