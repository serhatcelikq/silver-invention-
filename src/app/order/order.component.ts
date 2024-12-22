import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../services/balance.service';
import { OrderService } from '../services/order.service';

interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  portion: string;
  quantity: number;
}

interface Restaurant {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  image: string;
  isFavorite: boolean;
  menu: MenuItem[];
}

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [BalanceService, OrderService],
})
export class OrderComponent implements OnInit {
  restaurant: Restaurant | null = null;
  selectedItems: MenuItem[] = [];
  orderSuccess = false;
  totalAmount = 0;
  currentBalance: number = 0;
  showBalanceError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private balanceService: BalanceService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    const restaurantId = Number(this.route.snapshot.params['id']);

    // LocalStorage'dan restoran verilerini al
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    if (savedRestaurant) {
      this.restaurant = JSON.parse(savedRestaurant);

      // Veriler alındıktan sonra localStorage'ı temizle
      localStorage.removeItem('selectedRestaurant');
    }

    if (!this.restaurant) {
      this.router.navigate(['/restaurant']);
      return;
    }

    // Mevcut bakiyeyi al
    const savedBalance = localStorage.getItem('userBalance');
    if (savedBalance) {
      this.currentBalance = Number(savedBalance);
    }
  }

  updateQuantity(item: MenuItem, change: number) {
    item.quantity = Math.max(0, (item.quantity || 0) + change);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount =
      this.restaurant?.menu.reduce((total, item) => {
        return total + item.price * (item.quantity || 0);
      }, 0) || 0;
  }

  completeOrder() {
    const orderedItems = this.restaurant?.menu.filter(
      (item) => item.quantity > 0
    );
    if (orderedItems && orderedItems.length > 0) {
      if (this.totalAmount > this.currentBalance) {
        this.showBalanceError = true;
        setTimeout(() => {
          this.showBalanceError = false;
        }, 3000);
        return;
      }

      const orderNumber = Date.now();
      const newBalance = this.currentBalance - this.totalAmount;
      this.balanceService.updateBalance(newBalance);

      const currentUser = JSON.parse(
        localStorage.getItem('currentUser') || '{}'
      );
      const newOrder = {
        id: orderNumber,
        userId: currentUser.id,
        userName: currentUser.name,
        restaurantId: this.restaurant?.id || 0,
        restaurantName: this.restaurant?.name || '',
        items: orderedItems.map((item, index) => ({
          id: index + 1,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: this.totalAmount,
        orderDate: new Date().toISOString(),
        status: 'Beklemede',
      };

      // OrderService üzerinden siparişi ekle
      this.orderService.addOrder(newOrder);

      // Siparişleri yenile
      this.orderService.refreshOrders();

      setTimeout(() => {
        this.router.navigate(['/order-details']);
      }, 100);
    }
  }

  // Benzersiz kategorileri al
  getUniqueCategories(): string[] {
    if (!this.restaurant?.menu) return [];
    return [...new Set(this.restaurant.menu.map((item) => item.category))];
  }

  // Kategoriye göre ürünleri filtrele
  getItemsByCategory(category: string): MenuItem[] {
    if (!this.restaurant?.menu) return [];
    return this.restaurant.menu.filter((item) => item.category === category);
  }
}
