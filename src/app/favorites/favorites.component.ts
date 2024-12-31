import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RestaurantService, Restaurant } from '../services/restaurant.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="favorites-container">
      <h2>Favori Restoranlarım</h2>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        Favoriler yükleniyor...
      </div>

      <div class="restaurant-list" *ngIf="!loading">
        <div class="restaurant-card" *ngFor="let restaurant of favorites">
          <div class="favorite-icon" (click)="toggleFavorite(restaurant)">
            <i
              class="fas fa-star favorite-active"
              title="Favorilerden kaldır"
            ></i>
          </div>
          <div class="restaurant-info">
            <h3>{{ restaurant.name }}</h3>
            <p class="cuisine">{{ restaurant.category }}</p>
            <div class="rating">
              <span class="stars">
                <i class="fas fa-star"></i>
                {{ restaurant.rating }}
              </span>
              <span class="review-count"
                >({{ restaurant.reviews }} değerlendirme)</span
              >
            </div>
            <p class="address">{{ restaurant.address }}</p>
            <button class="order-btn" (click)="navigateToOrder(restaurant)">
              Sipariş Ver
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="favorites.length === 0 && !loading" class="no-favorites">
        <p>Henüz favori restoranınız bulunmuyor.</p>
        <button class="browse-btn" routerLink="/restaurant">
          Restoranları Keşfet
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .favorites-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
        padding-top: 100px;
      }

      h2 {
        color: #333;
        margin-bottom: 30px;
        text-align: center;
        font-size: 24px;
        font-weight: 600;
      }

      .restaurant-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .restaurant-card {
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        position: relative;
        transition: transform 0.2s;
        padding: 20px;
      }

      .restaurant-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .restaurant-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .restaurant-info h3 {
        margin: 0;
        font-size: 20px;
        color: #333;
        font-weight: 600;
      }

      .cuisine {
        color: #666;
        font-size: 14px;
        margin: 0;
      }

      .rating {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .stars {
        color: #ffd700;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .stars i {
        font-size: 16px;
      }

      .review-count {
        color: #666;
        font-size: 14px;
      }

      .address {
        color: #666;
        font-size: 14px;
        margin: 0;
      }

      .order-btn {
        margin-top: auto;
        padding: 10px 20px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        align-self: flex-start;
        font-weight: 500;
      }

      .order-btn:hover {
        background-color: #45a049;
        transform: translateY(-2px);
      }

      .favorite-icon {
        position: absolute;
        top: 15px;
        right: 15px;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.9);
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .favorite-icon:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .favorite-icon i {
        color: #ffd700;
        font-size: 20px;
      }

      .no-favorites {
        text-align: center;
        padding: 60px 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .no-favorites p {
        color: #666;
        font-size: 16px;
        margin-bottom: 20px;
      }

      .browse-btn {
        padding: 12px 24px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .browse-btn:hover {
        background-color: #45a049;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .loading {
        text-align: center;
        padding: 40px;
      }

      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4caf50;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 768px) {
        .favorites-container {
          padding: 15px;
          padding-top: 80px;
        }

        .restaurant-card {
          padding: 15px;
        }

        .restaurant-info h3 {
          font-size: 18px;
        }
      }
    `,
  ],
})
export class FavoritesComponent implements OnInit {
  favorites: Restaurant[] = [];
  loading = true;

  constructor(
    private restaurantService: RestaurantService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading = true;
    this.restaurantService.getFavorites().subscribe({
      next: (favorites) => {
        this.favorites = favorites;
        this.loading = false;
      },
      error: (error) => {
        console.error('Favoriler yüklenirken hata:', error);
        this.loading = false;
      },
    });
  }

  toggleFavorite(restaurant: Restaurant) {
    this.restaurantService.toggleFavorite(restaurant).subscribe({
      next: () => {
        // Favori kaldırıldıktan sonra listeyi güncelle
        this.favorites = this.favorites.filter((r) => r.id !== restaurant.id);
      },
      error: (error) => {
        console.error('Favori durumu güncellenirken hata:', error);
      },
    });
  }

  navigateToOrder(restaurant: Restaurant) {
    this.router.navigate(['/order', restaurant.id]);
  }
}
