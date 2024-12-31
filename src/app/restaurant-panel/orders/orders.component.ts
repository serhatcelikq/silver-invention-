import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subscription } from 'rxjs';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-page">
      <div class="orders-header">
        <h2>Siparişler</h2>
      </div>

      <div class="orders-grid">
        <div *ngFor="let order of orders" class="order-card">
          <div class="order-header">
            <h3>Sipariş #{{ order.orderNumber }}</h3>
            <span [class]="'status-badge ' + order.status">{{
              order.status
            }}</span>
          </div>

          <div class="order-content">
            <div class="customer-info">
              <p><strong>Müşteri:</strong> {{ order.userName }}</p>
              <p>
                <strong>Tarih:</strong> {{ order.orderDate | date : 'medium' }}
              </p>
            </div>

            <div class="order-items">
              <h4>Sipariş İçeriği</h4>
              <ul>
                <li *ngFor="let item of order.items">
                  {{ item.name }} x {{ item.quantity }} - ₺{{
                    item.price * item.quantity
                  }}
                </li>
              </ul>
              <div class="total">
                <strong>Toplam:</strong> ₺{{ order.totalAmount }}
              </div>
            </div>
          </div>

          <div class="order-actions">
            <button class="edit-btn" (click)="openEditModal(order)">
              Siparişi Düzenle
            </button>
            <button class="delete-btn" (click)="deleteOrder(order)">
              Siparişi Sil
            </button>
          </div>
        </div>
      </div>

      <!-- Düzenleme Modal -->
      <div *ngIf="selectedOrder" class="modal">
        <div class="modal-content">
          <h3>Sipariş Durumunu Güncelle</h3>
          <div class="status-categories">
            <div
              *ngFor="let status of orderStatuses"
              class="status-category"
              [class.active]="selectedOrder.status === status"
              (click)="updateOrderStatus(selectedOrder.id, status)"
            >
              <div class="status-icon" [class]="status"></div>
              <span>{{ status }}</span>
            </div>
          </div>
          <button class="close-btn" (click)="closeModal()">Kapat</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .orders-page {
        padding: 20px;
        background: #f8f9fa;
        min-height: 100vh;
      }

      .orders-header {
        margin-bottom: 20px;
      }

      .orders-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        padding: 20px;
      }

      .order-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .order-header {
        padding: 15px;
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .status-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
      }

      .status-badge.Beklemede {
        background: #fff3cd;
        color: #856404;
      }

      .status-badge.Hazırlanıyor {
        background: #cce5ff;
        color: #004085;
      }

      .status-badge.Yolda {
        background: #d4edda;
        color: #155724;
      }

      .status-badge.TeslimEdildi {
        background: #e2e3e5;
        color: #383d41;
      }

      .order-content {
        padding: 15px;
      }

      .order-items {
        margin-top: 15px;
      }

      .order-items ul {
        list-style: none;
        padding: 0;
      }

      .order-items li {
        padding: 5px 0;
        border-bottom: 1px dashed #e9ecef;
      }

      .total {
        margin-top: 15px;
        padding-top: 10px;
        border-top: 2px solid #e9ecef;
      }

      .order-actions {
        padding: 15px;
        display: flex;
        gap: 10px;
      }

      .edit-btn,
      .delete-btn {
        flex: 1;
        padding: 8px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      }

      .edit-btn {
        background: #007bff;
        color: white;
      }

      .delete-btn {
        background: #dc3545;
        color: white;
      }

      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal-content {
        background: white;
        padding: 20px;
        border-radius: 12px;
        min-width: 300px;
      }

      .status-categories {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin: 20px 0;
      }

      .status-category {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .status-category:hover {
        background: #f8f9fa;
      }

      .status-category.active {
        background: #e3f2fd;
        border-color: #90caf9;
      }

      .status-icon {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .status-icon.Beklemede {
        background: #ffc107;
      }

      .status-icon.Hazırlanıyor {
        background: #2196f3;
      }

      .status-icon.Yolda {
        background: #4caf50;
      }

      .status-icon.TeslimEdildi {
        background: #9e9e9e;
      }

      .close-btn {
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 6px;
        background: #6c757d;
        color: white;
        cursor: pointer;
      }

      button:hover:not(:disabled) {
        opacity: 0.9;
      }
    `,
  ],
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  private subscription: Subscription | undefined;
  currentRestaurantId: string | number = '';
  selectedOrder: Order | null = null;
  orderStatuses: string[] = [
    'Beklemede',
    'Hazırlanıyor',
    'Yolda',
    'Teslim Edildi',
  ];

  constructor(private db: AngularFireDatabase) {}

  ngOnInit() {
    const restaurantData = localStorage.getItem('currentRestaurant');
    if (restaurantData) {
      const restaurant = JSON.parse(restaurantData);

      // ID'yi doğru formatta al
      this.currentRestaurantId = restaurant.id.toString().includes('restaurant')
        ? restaurant.id.replace('restaurant', '')
        : restaurant.id;

      console.log('Restaurant ID:', this.currentRestaurantId);

      // Tüm siparişleri al ve filtreleme yap
      this.subscription = this.db
        .list('orders')
        .snapshotChanges()
        .subscribe({
          next: (snapshots) => {
            this.orders = snapshots
              .map((snap) => ({
                ...(snap.payload.val() as Order),
                firebaseKey: snap.key || undefined,
              }))
              .filter((order) => {
                const orderRestaurantId = order.restaurantId?.toString();
                const currentId = this.currentRestaurantId.toString();

                console.log('Sipariş karşılaştırma:', {
                  orderRestaurantId,
                  currentId,
                  isMatch: orderRestaurantId === currentId,
                });

                return orderRestaurantId === currentId;
              })
              .sort(
                (a, b) =>
                  new Date(b.orderDate).getTime() -
                  new Date(a.orderDate).getTime()
              );

            console.log('Filtrelenmiş siparişler:', this.orders);
          },
          error: (error) => {
            console.error('Siparişler yüklenirken hata:', error);
          },
        });
    } else {
      console.error('Restaurant verisi bulunamadı!');
    }
  }

  async updateOrderStatus(orderId: string, newStatus: string) {
    try {
      if (!this.selectedOrder?.firebaseKey) {
        throw new Error('Firebase key bulunamadı');
      }

      // Sadece ana orders koleksiyonunda güncelle
      await this.db
        .object(`orders/${this.selectedOrder.firebaseKey}`)
        .update({ status: newStatus });

      console.log('Sipariş durumu güncellendi:', {
        firebaseKey: this.selectedOrder.firebaseKey,
        newStatus,
        path: `orders/${this.selectedOrder.firebaseKey}`,
      });

      // Geçmişe kaydet
      await this.db.list(`order_history/${this.currentRestaurantId}`).push({
        orderId,
        previousStatus: this.selectedOrder?.status,
        newStatus,
        updatedAt: new Date().toISOString(),
      });

      this.closeModal();
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
    }
  }

  openEditModal(order: Order) {
    console.log('Düzenlenecek sipariş:', order);
    this.selectedOrder = order;
  }

  closeModal() {
    this.selectedOrder = null;
  }

  async deleteOrder(order: Order) {
    if (confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      try {
        // Ana orders koleksiyonundan sil
        await this.db.object(`orders/${order.id}`).remove();

        // Sipariş geçmişini de sil
        await this.db
          .object(`order_history/${this.currentRestaurantId}/${order.id}`)
          .remove();

        console.log('Sipariş silindi:', order.id);
      } catch (error) {
        console.error('Sipariş silinirken hata:', error);
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
