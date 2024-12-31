import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Restaurant } from '../services/restaurant.service';

@Component({
  selector: 'app-favorite-restaurants',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorite-restaurants.component.html',
  styleUrls: ['./favorite-restaurants.component.css'],
})
export class FavoriteRestaurantsComponent implements OnInit {
  favoriteRestaurants: Restaurant[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const savedFavorites = localStorage.getItem('favoriteRestaurants');
    if (savedFavorites) {
      this.favoriteRestaurants = JSON.parse(savedFavorites);
    }
  }

  toggleFavorite(restaurant: Restaurant) {
    this.removeFavorite(restaurant);
  }

  removeFavorite(restaurant: Restaurant) {
    this.favoriteRestaurants = this.favoriteRestaurants.filter(
      (r) => r.id !== restaurant.id
    );
    localStorage.setItem(
      'favoriteRestaurants',
      JSON.stringify(this.favoriteRestaurants)
    );
  }

  navigateToOrder(restaurant: Restaurant) {
    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
    this.router.navigate(['/order', restaurant.id]);
  }
}
