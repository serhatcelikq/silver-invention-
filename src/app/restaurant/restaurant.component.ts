import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService, Restaurant } from '../services/restaurant.service';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class RestaurantComponent implements OnInit {
  public restaurants: Restaurant[] = [];
  public filteredRestaurants: Restaurant[] = [];
  public recommendedRestaurants: Restaurant[] = [];
  public searchTerm: string = '';
  public isFilterMenuOpen: boolean = false;
  public selectedCuisines: string[] = [];
  public minRating: number = 0;
  public cuisineTypes: string[] = [
    'Türk Mutfağı',
    'Kebap',
    'Deniz Ürünleri',
    'Dünya Mutfağı',
    'Cafe',
  ];

  popularFilters: string[] = [
    'Kebap',
    'Pide',
    'Lahmacun',
    'Döner',
    'Fast Food',
    'Tatlı',
    'Kahvaltı',
    'Ev Yemekleri',
  ];

  showNotification: boolean = false;
  notificationMessage: string = '';

  constructor(
    private restaurantService: RestaurantService,
    private router: Router
  ) {}

  ngOnInit() {
    this.restaurantService.getRestaurants().subscribe(
      (restaurants) => {
        console.log('Gelen restoranlar:', restaurants);
        this.restaurants = restaurants;

        // Önerilen restoranları bir kez hesapla ve sakla
        this.recommendedRestaurants = [...restaurants]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);

        // Filtrelenmiş restoranları başlangıçta tüm restoranlar olarak ayarla
        this.filteredRestaurants = [...restaurants];

        // Favori restoranları kontrol et
        const savedFavorites = localStorage.getItem('favoriteRestaurants');
        if (savedFavorites) {
          const favorites: Restaurant[] = JSON.parse(savedFavorites);
          // Referansı değiştirmeden güncelle
          this.restaurants.forEach((restaurant) => {
            restaurant.isFavorite = favorites.some(
              (fav) => fav.id === restaurant.id
            );
          });
        }
      },
      (error) => {
        console.error('Restoran verisi yüklenirken hata:', error);
      }
    );
  }

  public toggleFavorite(restaurant: Restaurant): void {
    restaurant.isFavorite = !restaurant.isFavorite;

    // Bildirim mesajını ayarla
    this.notificationMessage = restaurant.isFavorite
      ? `${restaurant.name} favorilere eklendi`
      : `${restaurant.name} favorilerden çıkarıldı`;

    // Bildirimi göster
    this.showNotification = true;

    // 3 saniye sonra bildirimi gizle
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);

    // LocalStorage'dan mevcut favorileri al
    let favorites: Restaurant[] = [];
    const savedFavorites = localStorage.getItem('favoriteRestaurants');
    if (savedFavorites) {
      favorites = JSON.parse(savedFavorites);
    }

    if (restaurant.isFavorite) {
      // Favorilere ekle
      favorites.push(restaurant);
      console.log(`${restaurant.name} favorilere eklendi`);
    } else {
      // Favorilerden çıkar
      favorites = favorites.filter((r: Restaurant) => r.id !== restaurant.id);
      console.log(`${restaurant.name} favori restoranlardan çıkartıldı`);
    }

    // Güncel favorileri kaydet
    localStorage.setItem('favoriteRestaurants', JSON.stringify(favorites));

    // Tüm listelerdeki aynı restoranın favori durumunu güncelle
    this.updateFavoriteStatus(restaurant);
  }

  private updateFavoriteStatus(updatedRestaurant: Restaurant): void {
    // Ana listede güncelle
    const mainIndex = this.restaurants.findIndex(
      (r) => r.id === updatedRestaurant.id
    );
    if (mainIndex !== -1) {
      this.restaurants[mainIndex].isFavorite = updatedRestaurant.isFavorite;
    }

    // Önerilen restoranlarda güncelle
    const recommendedIndex = this.recommendedRestaurants.findIndex(
      (r) => r.id === updatedRestaurant.id
    );
    if (recommendedIndex !== -1) {
      this.recommendedRestaurants[recommendedIndex].isFavorite =
        updatedRestaurant.isFavorite;
    }

    // Filtrelenmiş restoranlarda güncelle
    const filteredIndex = this.filteredRestaurants.findIndex(
      (r) => r.id === updatedRestaurant.id
    );
    if (filteredIndex !== -1) {
      this.filteredRestaurants[filteredIndex].isFavorite =
        updatedRestaurant.isFavorite;
    }
  }

  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;

    // Filtre menüsü açıkken scroll'u engelle
    if (this.isFilterMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  toggleCuisine(cuisine: string) {
    const index = this.selectedCuisines.indexOf(cuisine);
    if (index === -1) {
      this.selectedCuisines.push(cuisine);
    } else {
      this.selectedCuisines.splice(index, 1);
    }
    this.applyFilters();
  }

  searchRestaurants() {
    if (!this.searchTerm && !this.hasActiveFilters()) {
      this.filteredRestaurants = [...this.restaurants];
      return;
    }
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.selectedCuisines.length > 0 || this.minRating > 0;
  }

  applyFilters() {
    this.filteredRestaurants = this.restaurants.filter((restaurant) => {
      // Arama filtresi
      const matchesSearch =
        !this.searchTerm ||
        restaurant.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        restaurant.category
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      // Mutfak türü filtresi
      const matchesCuisine =
        this.selectedCuisines.length === 0 ||
        this.selectedCuisines.some((cuisine) =>
          restaurant.category.includes(cuisine)
        );

      // Minimum puan filtresi
      const matchesRating = restaurant.rating >= this.minRating;

      return matchesSearch && matchesCuisine && matchesRating;
    });

    // Filtreleri uyguladıktan sonra menüyü kapat
    this.isFilterMenuOpen = false;
  }

  navigateToOrder(restaurant: Restaurant): void {
    // Restoran verilerini localStorage'a kaydet
    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
    // Sipariş sayfasına yönlendir
    this.router.navigate(['/order', restaurant.id]);
  }

  showAllRestaurants() {
    // Tüm filtreleri sıfırla
    this.searchTerm = '';
    this.selectedCuisines = [];
    this.minRating = 0;

    // RestaurantService'den tüm restoranları al
    this.restaurantService.getRestaurants().subscribe(
      (restaurants) => {
        // Tüm restoranları göster
        this.filteredRestaurants = [...restaurants];
        this.recommendedRestaurants = [...restaurants];

        // Favori durumlarını kontrol et
        const savedFavorites = localStorage.getItem('favoriteRestaurants');
        if (savedFavorites) {
          const favorites: Restaurant[] = JSON.parse(savedFavorites);
          this.filteredRestaurants.forEach((restaurant) => {
            restaurant.isFavorite = favorites.some(
              (fav) => fav.id === restaurant.id
            );
          });
        }
      },
      (error) => {
        console.error('Restoranlar yüklenirken hata:', error);
      }
    );

    // Filtre menüsünü kapat
    this.isFilterMenuOpen = false;
  }

  togglePopularFilter(filter: string) {
    const index = this.selectedCuisines.indexOf(filter);
    if (index === -1) {
      this.selectedCuisines.push(filter);
    } else {
      this.selectedCuisines.splice(index, 1);
    }
    this.applyFilters();
  }
}
