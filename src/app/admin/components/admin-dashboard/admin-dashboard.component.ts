import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { RestaurantService } from '../../../services/restaurant.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild('orderChart') orderChart!: ElementRef;
  @ViewChild('revenueChart') revenueChart!: ElementRef;

  userCount: number = 0;
  restaurantCount: number = 0;
  orderCount: number = 0;
  totalRevenue: number = 0;
  recentOrders: any[] = [];

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Kullanıcı sayısını al
    this.userService.getUsers().subscribe((users) => {
      this.userCount = users.length;
    });

    // Restoran sayısını al
    this.restaurantService.getRestaurants().subscribe((restaurants) => {
      this.restaurantCount = restaurants.length;
    });

    // Sipariş verilerini al
    this.orderService.getOrders().subscribe((orders) => {
      this.orderCount = orders.length;
      this.totalRevenue = orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      this.recentOrders = orders.slice(-5); // Son 5 sipariş

      // Grafikleri oluştur
      this.createOrderChart(orders);
      this.createRevenueChart(orders);
    });
  }

  createOrderChart(orders: any[]) {
    const monthlyData = new Array(12).fill(0);
    orders.forEach((order) => {
      const month = new Date(order.orderDate).getMonth();
      monthlyData[month]++;
    });

    const ctx = this.orderChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [
          'Oca',
          'Şub',
          'Mar',
          'Nis',
          'May',
          'Haz',
          'Tem',
          'Ağu',
          'Eyl',
          'Eki',
          'Kas',
          'Ara',
        ],
        datasets: [
          {
            label: 'Aylık Sipariş Sayısı',
            data: monthlyData,
            borderColor: '#2196F3',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
  }

  createRevenueChart(orders: any[]) {
    const monthlyRevenue = new Array(12).fill(0);
    orders.forEach((order) => {
      const month = new Date(order.orderDate).getMonth();
      monthlyRevenue[month] += order.totalAmount;
    });

    const ctx = this.revenueChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Oca',
          'Şub',
          'Mar',
          'Nis',
          'May',
          'Haz',
          'Tem',
          'Ağu',
          'Eyl',
          'Eki',
          'Kas',
          'Ara',
        ],
        datasets: [
          {
            label: 'Aylık Gelir (TL)',
            data: monthlyRevenue,
            backgroundColor: '#4CAF50',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
  }
}
