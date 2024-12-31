import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-container">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon orders">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-details">
            <h3>Toplam Sipariş</h3>
            <p class="stat-value">{{ totalStats?.totalOrders || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue">
            <i class="fas fa-coins"></i>
          </div>
          <div class="stat-details">
            <h3>Toplam Gelir</h3>
            <p class="stat-value">₺{{ totalStats?.totalRevenue || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orders">
            <i class="fas fa-receipt"></i>
          </div>
          <div class="stat-details">
            <h3>Ortalama Sipariş Tutarı</h3>
            <p class="stat-value">₺{{ totalStats?.averageOrderValue || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon items">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-details">
            <h3>Satılan Ürün Sayısı</h3>
            <p class="stat-value">{{ totalStats?.totalItemsSold || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="charts-container">
        <div class="chart-card">
          <h3>En Çok Satan Ürünler</h3>
          <canvas id="popularItemsChart"></canvas>
        </div>
        <div class="chart-card">
          <h3>Aylık Gelir</h3>
          <canvas id="monthlyRevenueChart"></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .stats-container {
        padding: 2rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease;
      }

      .stat-card:hover {
        transform: translateY(-5px);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
      }

      .stat-icon.orders {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }
      .stat-icon.revenue {
        background: linear-gradient(135deg, #22c55e, #16a34a);
      }
      .stat-icon.items {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      .charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }

      .chart-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentRestaurant: any;
  totalStats: any = {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalItemsSold: 0,
  };
  popularItemsChart: any;
  monthlyRevenueChart: any;
  private subscriptions: Subscription[] = [];

  constructor(private db: AngularFireDatabase, private router: Router) {}

  ngOnInit() {
    // Sadece restoran panelinde ve ilk girişte işlem yap
    if (this.router.url.includes('/restaurant-panel/dashboard')) {
      const hasInitialLoad = localStorage.getItem('dashboardInitialized');

      if (!hasInitialLoad) {
        this.loadRestaurantData();
        localStorage.setItem('dashboardInitialized', 'true');
      } else {
        // Daha önce yüklenmiş verileri kullan
        const savedStats = localStorage.getItem('dashboardStats');
        if (savedStats) {
          const stats = JSON.parse(savedStats);
          this.totalStats = stats.totalStats;
          this.updateCharts(stats.popularItems, stats.monthlyRevenue);
        }
      }
    }
  }

  private loadRestaurantData() {
    const restaurantData = localStorage.getItem('currentRestaurant');
    if (restaurantData) {
      const localData = JSON.parse(restaurantData);
      const localId = localData.id;

      const subscription = this.db
        .list('restaurants')
        .valueChanges()
        .subscribe((restaurants: any[]) => {
          const restaurant = restaurants.find(
            (r) =>
              r.id === localId ||
              r.id === Number(localId) ||
              r.id === String(localId) ||
              r.id === `restaurant${localId}` ||
              `restaurant${r.id}` === localId
          );

          if (restaurant) {
            this.currentRestaurant = restaurant;
            this.calculateStats();
          }
        });

      this.subscriptions.push(subscription);
    }
  }

  calculateStats() {
    const subscription = this.db
      .list('orders')
      .valueChanges()
      .subscribe((allOrders: any[]) => {
        console.log('Tüm siparişler:', allOrders);

        const filteredOrders = allOrders.filter((order) => {
          // Her iki ID'yi de normalize et
          const normalizeId = (id: any) => {
            if (typeof id === 'string' && id.startsWith('restaurant')) {
              return Number(id.replace('restaurant', ''));
            }
            return Number(id);
          };

          const normalizedOrderId = normalizeId(order.restaurantId);
          const normalizedCurrentId = normalizeId(this.currentRestaurant.id);

          console.log('Karşılaştırma:', {
            orderRestaurantId: order.restaurantId,
            normalizedOrderId,
            currentRestaurantId: this.currentRestaurant.id,
            normalizedCurrentId,
            isMatch: normalizedOrderId === normalizedCurrentId,
          });

          return normalizedOrderId === normalizedCurrentId;
        });

        console.log('Filtrelenmiş siparişler:', filteredOrders);

        this.totalStats.totalOrders = filteredOrders.length;
        this.totalStats.totalRevenue = filteredOrders.reduce(
          (sum, order) => sum + order.totalAmount,
          0
        );
        this.totalStats.averageOrderValue =
          Math.round(
            (this.totalStats.totalRevenue / (filteredOrders.length || 1)) * 100
          ) / 100;

        const itemSales: { [key: string]: { count: number; revenue: number } } =
          {};
        let totalItems = 0;

        filteredOrders.forEach((order) => {
          if (Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const quantity = item.quantity || 0;
              totalItems += quantity;

              if (!itemSales[item.name]) {
                itemSales[item.name] = {
                  count: 0,
                  revenue: 0,
                };
              }

              itemSales[item.name].count += quantity;
              itemSales[item.name].revenue += item.price * quantity;
            });
          }
        });

        this.totalStats.totalItemsSold = totalItems;

        const popularItems = Object.entries(itemSales)
          .map(([name, stats]) => ({
            name,
            soldCount: stats.count,
            revenue: stats.revenue,
          }))
          .sort((a, b) => b.soldCount - a.soldCount)
          .slice(0, 5);

        console.log('Popüler ürünler:', popularItems);

        const monthlyRevenue = new Array(12).fill(0);
        filteredOrders.forEach((order) => {
          if (order.orderDate) {
            const orderDate = new Date(order.orderDate);
            const month = orderDate.getMonth();
            monthlyRevenue[month] += order.totalAmount;
          }
        });

        // Hesaplanan verileri localStorage'a kaydet
        const statsToSave = {
          totalStats: this.totalStats,
          popularItems,
          monthlyRevenue,
        };
        localStorage.setItem('dashboardStats', JSON.stringify(statsToSave));

        this.updateCharts(popularItems, monthlyRevenue);
      });

    this.subscriptions.push(subscription);
  }

  updateCharts(popularItems: any[], monthlyRevenue: number[]) {
    this.initializePopularItemsChart(popularItems);
    this.initializeMonthlyRevenueChart(monthlyRevenue);
  }

  initializePopularItemsChart(popularItems: any[]) {
    const ctx = document.getElementById(
      'popularItemsChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    if (this.popularItemsChart) {
      this.popularItemsChart.destroy();
    }

    const totalSold = popularItems.reduce(
      (sum, item) => sum + item.soldCount,
      0
    );

    this.popularItemsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: popularItems.map((item) => item.name),
        datasets: [
          {
            data: popularItems.map((item) => item.soldCount),
            backgroundColor: [
              '#667eea',
              '#22c55e',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 12,
              },
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const item = popularItems[context.dataIndex];
                const percentage = Math.round(
                  (item.soldCount / totalSold) * 100
                );
                return `${item.name}: ${item.soldCount} adet (${percentage}%) - ₺${item.revenue}`;
              },
            },
          },
        },
      },
    });
  }

  initializeMonthlyRevenueChart(monthlyRevenue: number[]) {
    const ctx = document.getElementById(
      'monthlyRevenueChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    if (this.monthlyRevenueChart) {
      this.monthlyRevenueChart.destroy();
    }

    const months = [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık',
    ];

    this.monthlyRevenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Aylık Gelir (TL)',
            data: monthlyRevenue,
            fill: true,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    if (this.popularItemsChart) {
      this.popularItemsChart.destroy();
    }
    if (this.monthlyRevenueChart) {
      this.monthlyRevenueChart.destroy();
    }
  }

  // Restoran panelinden çıkış yapıldığında flag'i temizle
  clearDashboardCache() {
    localStorage.removeItem('dashboardInitialized');
    localStorage.removeItem('dashboardStats');
  }
}
