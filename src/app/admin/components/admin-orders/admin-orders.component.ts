import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchOrderId: string = '';
  searchCustomer: string = '';
  searchRestaurant: string = '';
  searchDate: string = '';

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getOrders().subscribe((orders) => {
      this.orders = orders.sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );
      this.filterOrders();
    });
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter((order) => {
      const matchesId = this.searchOrderId
        ? order.orderNumber
            .toLowerCase()
            .includes(this.searchOrderId.toLowerCase()) ||
          order.id.toLowerCase().includes(this.searchOrderId.toLowerCase())
        : true;

      const matchesCustomer = this.searchCustomer
        ? order.userName
            .toLowerCase()
            .includes(this.searchCustomer.toLowerCase())
        : true;

      const matchesRestaurant = this.searchRestaurant
        ? order.restaurantName
            .toLowerCase()
            .includes(this.searchRestaurant.toLowerCase())
        : true;

      const matchesDate = this.searchDate
        ? order.orderDate.includes(this.searchDate)
        : true;

      return matchesId && matchesCustomer && matchesRestaurant && matchesDate;
    });
  }

  viewOrderDetails(order: Order) {
    console.log('Sipariş detayları:', order);
  }

  deleteOrder(order: Order) {
    if (confirm('Bu siparişi silmek istediğinize emin misiniz?')) {
      this.orderService.cancelOrder(order.id).subscribe(() => {
        this.orders = this.orders.filter((o) => o.id !== order.id);
        this.filterOrders();
      });
    }
  }

  onSearchChange() {
    this.filterOrders();
  }
}
