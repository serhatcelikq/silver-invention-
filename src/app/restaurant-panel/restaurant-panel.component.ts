import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Restaurant } from '../services/restaurant.service';
import { LayoutService } from '../services/layout.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restaurant-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="restaurant-panel">
      <div class="sidebar">
        <div class="restaurant-info">
          <h2>{{ restaurant?.name }}</h2>
          <p>{{ restaurant?.category }}</p>
        </div>
        <nav>
          <a routerLink="./dashboard" routerLinkActive="active">
            <i class="fas fa-chart-line"></i> Restoran Paneli
          </a>
          <a routerLink="./menu" routerLinkActive="active">
            <i class="fas fa-utensils"></i> Menü Yönetimi
          </a>
          <a routerLink="./orders" routerLinkActive="active">
            <i class="fas fa-shopping-bag"></i> Siparişler
          </a>
          <a routerLink="./employees" routerLinkActive="active">
            <i class="fas fa-users"></i> Çalışanlar
          </a>
          <a (click)="logout()" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i> Çıkış
          </a>
        </nav>
      </div>
      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .restaurant-panel {
        display: flex;
        min-height: 100vh;
      }

      .sidebar {
        width: 250px;
        background: #1a237e;
        color: white;
        padding: 2rem;
      }

      .restaurant-info {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .restaurant-info h2 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }

      nav {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      nav a {
        color: white;
        text-decoration: none;
        padding: 0.8rem 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      nav a:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      nav a.active {
        background: rgba(255, 255, 255, 0.2);
      }

      .content {
        flex: 1;
        padding: 2rem;
      }

      .logout-btn {
        margin-top: auto;
        background: #ef5350;
      }

      .logout-btn:hover {
        background: #e53935;
      }
    `,
  ],
})
export class RestaurantPanelComponent implements OnInit, OnDestroy {
  restaurant: Restaurant | null = null;

  constructor(private layoutService: LayoutService, private router: Router) {}

  ngOnInit() {
    this.layoutService.hideHeader();
    const restaurantData = localStorage.getItem('currentRestaurant');
    if (restaurantData) {
      this.restaurant = JSON.parse(restaurantData);
    }
  }

  ngOnDestroy() {
    this.layoutService.showHeader();
  }

  logout() {
    localStorage.removeItem('dashboardInitialized');
    localStorage.removeItem('dashboardStats');
    localStorage.removeItem('currentRestaurant');
    this.router.navigate(['/restaurant-login']);
  }
}
