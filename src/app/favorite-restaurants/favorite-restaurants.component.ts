import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Restaurant } from '../services/restaurant.service';

@Component({
  selector: 'app-favorite-restaurants',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="favorites-container">
      <h2>Favori Restoranlarım</h2>

      <div class="restaurant-list" *ngIf="favoriteRestaurants.length > 0">
        <div
          class="restaurant-card"
          *ngFor="let restaurant of favoriteRestaurants"
        >
          <div class="favorite-icon" (click)="removeFavorite(restaurant)">
            <i class="fas fa-star favorite-active"></i>
          </div>
          <img
            [src]="restaurant.url"
            [alt]="restaurant.name"
            onerror="this.src='https://via.placeholder.com/300x200?text=Restaurant'"
          />
          <div class="restaurant-info">
            <h3>{{ restaurant.name }}</h3>
            <p class="cuisine">{{ restaurant.category }}</p>
            <div class="rating">
              <span class="stars">
                <i
                  class="fas fa-star"
                  *ngFor="
                    let star of [1, 2, 3, 4, 5].slice(0, restaurant.rating)
                  "
                ></i>
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

      <div class="no-favorites" *ngIf="favoriteRestaurants.length === 0">
        <i class="fas fa-heart-broken"></i>
        <p>Henüz favori restoranınız bulunmamaktadır.</p>
        <button routerLink="/restaurant" class="browse-btn">
          Restoranları Keşfet
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./favorite-restaurants.component.css'],
})
export class FavoriteRestaurantsComponent implements OnInit {
  favoriteRestaurants: Restaurant[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Favori restoranları localStorage'dan al
    const savedFavorites = localStorage.getItem('favoriteRestaurants');
    if (savedFavorites) {
      this.favoriteRestaurants = JSON.parse(savedFavorites);
    }
  }

  removeFavorite(restaurant: Restaurant) {
    // Favorilerden kaldır
    this.favoriteRestaurants = this.favoriteRestaurants.filter(
      (r) => r.id !== restaurant.id
    );
    // LocalStorage'ı güncelle
    localStorage.setItem(
      'favoriteRestaurants',
      JSON.stringify(this.favoriteRestaurants)
    );
  }

  navigateToOrder(restaurant: Restaurant) {
    // Restoran verilerini localStorage'a kaydet
    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
    // Sipariş sayfasına yönlendir
    this.router.navigate(['/order', restaurant.id]);
  }
}
