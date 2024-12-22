import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
  ],
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchOrderId: string = '';
  searchPerformed: boolean = false;
  startDate: string = '';
  endDate: string = '';
  selectedStatus: string = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  searchError: string = '';
  selectedOrder: Order | null = null;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.orders = this.orderService.getOrders();
    this.filteredOrders = [];
  }

  // Tüm kriterlere göre arama
  searchOrders() {
    this.searchPerformed = true;
    this.searchError = '';

    this.filteredOrders = this.orders.filter((order) => {
      const matchesOrderId = this.searchOrderId
        ? order.id.toString().includes(this.searchOrderId)
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

    if (this.filteredOrders.length === 0) {
      this.searchError = 'Arama kriterlerine uygun sipariş bulunamadı';
    }

    this.sortOrders();
  }

  sortOrders() {
    this.filteredOrders.sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime();
      const dateB = new Date(b.orderDate).getTime();
      return this.sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    this.sortOrders();
  }

  resetFilters() {
    this.searchOrderId = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedStatus = '';
    this.filteredOrders = [];
    this.searchPerformed = false;
    this.searchError = '';
  }

  updateStatus(order: Order) {
    this.orderService.updateOrderStatus(order.id, order.status);
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
  }

  closeModal() {
    this.selectedOrder = null;
  }

  cancelOrder(order: Order) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Sipariş İptali',
          message: 'Bu siparişi iptal etmek istediğinizden emin misiniz?',
        },
      })
      .afterClosed()
      .subscribe((result: boolean) => {
        if (result) {
          this.orderService.cancelOrder(order.id).subscribe({
            next: () => {
              // Siparişi listelerden kaldır
              this.orders = this.orders.filter((o) => o.id !== order.id);
              this.filteredOrders = this.filteredOrders.filter(
                (o) => o.id !== order.id
              );

              // Modalı kapat
              this.closeModal();

              // Siparişleri yenile
              this.orderService.refreshOrders();

              // Başarılı mesajı göster
              this.showSuccessMessage('Sipariş başarıyla iptal edildi');

              // Sayfayı yenile
              setTimeout(() => {
                this.orders = this.orderService.getOrders();
                this.searchOrders(); // Mevcut filtreleri uygula
              }, 500);
            },
            error: (error) => {
              console.error('Sipariş iptal hatası:', error);
              this.showErrorMessage('Sipariş iptal edilirken bir hata oluştu');
            },
          });
        }
      });
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Kapat', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Kapat', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
