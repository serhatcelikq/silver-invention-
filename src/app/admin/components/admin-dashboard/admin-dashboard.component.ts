import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../../../services/restaurant.service';
import { OrderService } from '../../../services/order.service';
import { Restaurant } from '../../../models/restaurant.model';
import { Order } from '../../../models/order.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  totalRestaurants: number = 0;
  activeOrders: number = 0;
  totalRevenue: number = 0;
  totalCategories: number = 0;
  monthlyOrders: number[] = [];
  popularRestaurants: any[] = [];
  private orderSubscription: Subscription;
  private restaurants: Restaurant[] = [];

  constructor(
    private restaurantService: RestaurantService,
    private orderService: OrderService
  ) {
    this.orderSubscription = this.orderService.orders$.subscribe((orders) => {
      this.activeOrders = orders.filter(
        (o) => o.status !== 'Tamamlandı'
      ).length;
      this.totalRevenue = orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      this.calculateMonthlyOrders(orders);
      this.calculatePopularRestaurants(this.restaurants, orders);
    });
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
  }

  loadDashboardData() {
    this.restaurantService.getRestaurants().subscribe((restaurants) => {
      this.restaurants = restaurants;
      this.totalRestaurants = restaurants.length;
      const categories = new Set(restaurants.map((r) => r.category));
      this.totalCategories = categories.size;

      // Mevcut siparişleri al
      const orders = this.orderService.getOrders();
      this.calculatePopularRestaurants(restaurants, orders);
    });
  }

  calculatePopularRestaurants(restaurants: Restaurant[], orders: Order[]) {
    const restaurantOrders = new Map<number, number>();

    // Her restoran için sipariş sayısını hesapla
    orders.forEach((order) => {
      const count = restaurantOrders.get(order.restaurantId) || 0;
      restaurantOrders.set(order.restaurantId, count + 1);
    });

    // Restoranları sipariş sayısına göre sırala
    this.popularRestaurants = restaurants
      .map((restaurant) => ({
        name: restaurant.name,
        popularity:
          ((restaurantOrders.get(restaurant.id) || 0) / orders.length) * 100,
      }))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5);
  }

  calculateMonthlyOrders(orders: Order[]) {
    // Son 12 ayın sipariş sayılarını hesapla
    const monthlyData = new Array(12).fill(0);
    const currentDate = new Date();

    orders.forEach((order) => {
      const orderDate = new Date(order.orderDate);
      const monthDiff =
        (currentDate.getMonth() - orderDate.getMonth() + 12) % 12;
      if (monthDiff < 12) {
        monthlyData[11 - monthDiff]++;
      }
    });

    // Yüzdelik değerlere çevir
    const maxOrders = Math.max(...monthlyData);
    this.monthlyOrders = monthlyData.map((value) =>
      maxOrders > 0 ? (value / maxOrders) * 100 : 0
    );
  }
}
