import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../services/order.service';
import { NotificationService } from '../../../services/notification.service';
import { firstValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-section">
      <div class="orders-header">
        <div class="header-content">
          <div class="title-section">
            <h2>Siparişler</h2>
            <div class="order-count">
              <i class="fas fa-shopping-cart"></i>
              <span>{{ filteredOrders.length }} Sipariş</span>
            </div>
          </div>
        </div>

        <div class="filters-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
              type="text"
              [(ngModel)]="searchOrderId"
              placeholder="Sipariş numarası ile ara..."
              (input)="searchOrders()"
            />
          </div>

          <div class="date-range">
            <div class="date-input">
              <label>Başlangıç</label>
              <div class="input-wrapper">
                <i class="fas fa-calendar"></i>
                <input
                  type="date"
                  [(ngModel)]="startDate"
                  (change)="searchOrders()"
                />
              </div>
            </div>
            <div class="date-input">
              <label>Bitiş</label>
              <div class="input-wrapper">
                <i class="fas fa-calendar"></i>
                <input
                  type="date"
                  [(ngModel)]="endDate"
                  (change)="searchOrders()"
                />
              </div>
            </div>
          </div>

          <div class="status-select">
            <label>Durum</label>
            <div class="select-wrapper">
              <i class="fas fa-filter"></i>
              <select [(ngModel)]="selectedStatus" (change)="searchOrders()">
                <option value="">Tüm Durumlar</option>
                <option value="Beklemede">Beklemede</option>
                <option value="Hazırlanıyor">Hazırlanıyor</option>
                <option value="Yolda">Yolda</option>
                <option value="Tamamlandı">Tamamlandı</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Sipariş No</th>
              <th>Müşteri</th>
              <th>Restoran</th>
              <th>Tutar</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of filteredOrders">
              <td>#{{ order.orderNumber }}</td>
              <td>{{ order.userName }}</td>
              <td>{{ order.restaurantName }}</td>
              <td>{{ order.totalAmount }} ₺</td>
              <td>{{ order.orderDate | date : 'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <select
                  [(ngModel)]="order.status"
                  (change)="onStatusChange(order, $event)"
                  class="status-select"
                >
                  <option value="Beklemede">Beklemede</option>
                  <option value="Hazırlanıyor">Hazırlanıyor</option>
                  <option value="Yolda">Yolda</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                </select>
              </td>
              <td class="actions">
                <button class="view-btn" (click)="viewOrderDetails(order)">
                  <i class="fas fa-eye"></i>
                  Detaylar
                </button>
                <button class="delete-btn" (click)="confirmDelete(order)">
                  <i class="fas fa-trash"></i>
                  Sil
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="no-orders" *ngIf="filteredOrders.length === 0">
        <i class="fas fa-box-open"></i>
        <p>Sipariş bulunamadı</p>
      </div>

      <!-- Detay Modalı -->
      <div
        class="modal"
        *ngIf="selectedOrder"
        (click)="closeModalOnOverlay($event)"
      >
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Sipariş Detayları</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <h4><i class="fas fa-info-circle"></i> Sipariş Bilgileri</h4>
              <div class="detail-row">
                <span class="detail-label">Sipariş No:</span>
                <span class="detail-value"
                  >#{{ selectedOrder.orderNumber }}</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">Tarih:</span>
                <span class="detail-value">{{
                  selectedOrder.orderDate | date : 'dd/MM/yyyy HH:mm'
                }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Durum:</span>
                <span class="detail-value">{{ selectedOrder.status }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4><i class="fas fa-user"></i> Müşteri Bilgileri</h4>
              <div class="detail-row">
                <span class="detail-label">Ad Soyad:</span>
                <span class="detail-value">{{ selectedOrder.userName }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4><i class="fas fa-utensils"></i> Sipariş İçeriği</h4>
              <div class="order-items">
                <div
                  class="order-item"
                  *ngFor="let item of selectedOrder.items"
                >
                  <div class="item-details">
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-price"
                      >{{ item.price }} ₺ x {{ item.quantity }}</span
                    >
                  </div>
                  <span class="item-total"
                    >{{ item.price * item.quantity }} ₺</span
                  >
                </div>
              </div>
              <div class="total-section">
                <span>Toplam Tutar:</span>
                <span>{{ selectedOrder.totalAmount }} ₺</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sonuç mesajları -->
      <div class="search-message" *ngIf="searchPerformed">
        <div class="no-results" *ngIf="filteredOrders.length === 0">
          <i class="fas fa-exclamation-circle"></i>
          <p>"{{ searchOrderId }}" ile eşleşen sipariş bulunamadı.</p>
        </div>
        <div
          class="search-results"
          *ngIf="filteredOrders.length > 0 && searchOrderId"
        >
          <i class="fas fa-check-circle"></i>
          <p>
            "{{ searchOrderId }}" için {{ filteredOrders.length }} sipariş
            bulundu.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-section {
        padding: 2rem;
        background: #f8f9fa;
        min-height: 100vh;
      }

      .orders-header {
        background: white;
        border-radius: 15px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
      }

      .header-content {
        margin-bottom: 1.5rem;
      }

      .title-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .title-section h2 {
        font-size: 1.8rem;
        color: #1a237e;
        margin: 0;
      }

      .order-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #e3f2fd;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        color: #1976d2;
        font-weight: 500;
      }

      .filters-section {
        display: grid;
        grid-template-columns: 1fr 2fr 1fr;
        gap: 1.5rem;
        align-items: end;
        margin: 0 20px;
      }

      .search-box,
      .date-input,
      .status-select {
        position: relative;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #666;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .input-wrapper,
      .select-wrapper {
        position: relative;
      }

      .input-wrapper i,
      .select-wrapper i {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #666;
        z-index: 1;
      }

      input,
      select {
        width: 100%;
        padding: 0.8rem;
        padding-left: 2.5rem;
        border: 2px solid #eee;
        border-radius: 8px;
        font-size: 0.9rem;
        background: white;
        transition: all 0.3s ease;
      }

      input:focus,
      select:focus {
        border-color: #1a237e;
        outline: none;
        box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
      }

      .date-range {
        display: flex;
        gap: 1rem;
      }

      @media (max-width: 1200px) {
        .filters-section {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 768px) {
        .filters-section {
          grid-template-columns: 1fr;
        }

        .date-range {
          flex-direction: column;
          gap: 1rem;
        }
      }

      .table-container {
        background: white;
        border-radius: 15px;
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        margin-top: 2rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        background: #f8f9fa;
        padding: 1rem;
        text-align: left;
        color: #1a237e;
        font-weight: 600;
        border-bottom: 2px solid #eee;
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        vertical-align: middle;
      }

      tr:hover {
        background: #f8f9fa;
      }

      .status-select {
        width: 200px;
        margin: 0 20px;
        padding: 0.8rem;
        border: 2px solid #eee;
        border-radius: 8px;
        font-size: 0.9rem;
        background: white;
        transition: all 0.3s ease;
      }

      .select-wrapper {
        width: 200px;
      }

      .status-select:focus {
        border-color: #1a237e;
        outline: none;
        box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      .view-btn,
      .delete-btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .view-btn {
        background: #1976d2;
        color: white;
      }

      .delete-btn {
        background: #ef5350;
        color: white;
      }

      .view-btn:hover,
      .delete-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .no-orders {
        text-align: center;
        padding: 3rem;
        background: white;
        border-radius: 15px;
        margin-top: 2rem;
        color: #666;
      }

      .no-orders i {
        font-size: 3rem;
        color: #1a237e;
        margin-bottom: 1rem;
      }

      .no-orders p {
        font-size: 1.1rem;
        margin: 0;
      }

      @media (max-width: 1200px) {
        .table-container {
          overflow-x: auto;
        }

        table {
          min-width: 1000px;
        }
      }

      @media (max-width: 768px) {
        .actions {
          flex-direction: column;
        }

        .view-btn,
        .delete-btn {
          width: 100%;
          justify-content: center;
        }
      }

      .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
      }

      .modal-content {
        background: white;
        border-radius: 15px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease;
      }

      .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header h3 {
        margin: 0;
        color: #1a237e;
        font-size: 1.3rem;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .detail-section {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .detail-section h4 {
        color: #1a237e;
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
      }

      .detail-row:last-child {
        border-bottom: none;
      }

      .detail-label {
        color: #666;
        font-weight: 500;
      }

      .detail-value {
        color: #1a237e;
        font-weight: 600;
      }

      .order-items {
        margin-top: 1rem;
      }

      .order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: white;
        border-radius: 8px;
        margin-bottom: 0.5rem;
      }

      .item-details {
        display: flex;
        flex-direction: column;
      }

      .item-name {
        font-weight: 500;
        color: #1a237e;
      }

      .item-price {
        color: #666;
        font-size: 0.9rem;
      }

      .total-section {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 2px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        color: #1a237e;
        font-size: 1.2rem;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .search-message {
        margin: 1rem 0;
        padding: 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .no-results {
        background: #ffebee;
        color: #c62828;
        padding: 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .no-results i {
        font-size: 1.2rem;
      }

      .search-results {
        background: #e8f5e9;
        color: #2e7d32;
        padding: 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .search-results i {
        font-size: 1.2rem;
      }
    `,
  ],
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  searchOrderId = '';
  searchPerformed = false;
  startDate = '';
  endDate = '';
  selectedStatus = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  searchError = '';
  private ordersSubscription?: Subscription;

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  private loadOrders() {
    this.ordersSubscription = this.orderService.getOrders().subscribe({
      next: (orders) => {
        console.log('Gelen siparişler:', orders);
        this.orders = orders;
        this.filteredOrders = [...orders];
        this.searchOrders();
      },
      error: (error) => {
        console.error('Siparişler yüklenirken hata:', error);
        this.notificationService.showError('Siparişler yüklenemedi');
      },
    });
  }

  searchOrders() {
    this.searchPerformed = true;
    this.filteredOrders = this.orders.filter((order) => {
      const matchesOrderId = this.searchOrderId
        ? order.orderNumber
            ?.toLowerCase()
            .includes(this.searchOrderId.toLowerCase()) ||
          order.id
            .toString()
            .toLowerCase()
            .includes(this.searchOrderId.toLowerCase())
        : true;

      const orderDate = new Date(order.orderDate);
      const matchesStartDate = this.startDate
        ? orderDate >= new Date(this.startDate)
        : true;
      const matchesEndDate = this.endDate
        ? orderDate <= new Date(this.endDate)
        : true;

      const matchesStatus = this.selectedStatus
        ? order.status === this.selectedStatus
        : true;

      return (
        matchesOrderId && matchesStartDate && matchesEndDate && matchesStatus
      );
    });

    // Sonuçları sırala
    this.sortOrders();
  }

  sortOrders() {
    this.filteredOrders.sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime();
      const dateB = new Date(b.orderDate).getTime();
      return this.sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  resetFilters() {
    this.searchOrderId = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedStatus = '';
    this.searchPerformed = false;
    this.searchError = '';
    this.loadOrders();
  }

  async onStatusChange(order: Order, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as Order['status'];
    try {
      await firstValueFrom(
        this.orderService.updateOrderStatus(order.id, newStatus)
      );
      order.status = newStatus;
      this.notificationService.showSuccess('Sipariş durumu güncellendi');
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      this.notificationService.showError('Güncelleme başarısız oldu');
    }
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
  }

  closeModal() {
    this.selectedOrder = null;
  }

  closeModalOnOverlay(event: MouseEvent) {
    if ((event.target as HTMLElement).className === 'modal') {
      this.closeModal();
    }
  }

  async cancelOrder(order: Order) {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu siparişi iptal etmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, İptal Et',
      cancelButtonText: 'Vazgeç',
    });

    if (result.isConfirmed) {
      try {
        await firstValueFrom(this.orderService.cancelOrder(order.id));
        this.notificationService.showSuccess('Sipariş iptal edildi');
        this.loadOrders();
      } catch (error) {
        console.error('Sipariş iptal edilirken hata:', error);
        this.notificationService.showError('İptal işlemi başarısız oldu');
      }
    }
  }

  async confirmDelete(order: Order) {
    const result = await Swal.fire({
      title: 'Siparişi Sil',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <div style="margin-bottom: 1rem;">
            <p style="margin: 0.5rem 0;"><strong>Sipariş No:</strong> #${order.orderNumber}</p>
            <p style="margin: 0.5rem 0;"><strong>Müşteri:</strong> ${order.userName}</p>
            <p style="margin: 0.5rem 0;"><strong>Restoran:</strong> ${order.restaurantName}</p>
            <p style="margin: 0.5rem 0;"><strong>Tutar:</strong> ${order.totalAmount} ₺</p>
          </div>
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
            <p style="color: #ef5350; font-weight: 500;">
              Bu siparişi silmek istediğinize emin misiniz?
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef5350',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
    });

    if (result.isConfirmed) {
      try {
        await firstValueFrom(this.orderService.cancelOrder(order.id));

        // Yerel listeden de siparişi kaldır
        this.orders = this.orders.filter((o) => o.id !== order.id);
        this.filteredOrders = this.filteredOrders.filter(
          (o) => o.id !== order.id
        );

        this.notificationService.showSuccess('Sipariş başarıyla silindi');
      } catch (error) {
        console.error('Sipariş silinirken hata:', error);
        this.notificationService.showError('Silme işlemi başarısız oldu');
      }
    }
  }
}
