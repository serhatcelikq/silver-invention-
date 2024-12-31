import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService, Restaurant } from '../services/restaurant.service';
import { NotificationService } from '../services/notification.service';
import { firstValueFrom } from 'rxjs';

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
  public showNotification = false;
  public notificationMessage = '';
  public cuisineTypes: string[] = [];
  public popularFilters = ['En Yüksek Puan', 'En Çok Sipariş'];
  public loading: boolean = true;
  public error: string = '';

  constructor(
    private restaurantService: RestaurantService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.loading = true;
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.restaurants = data;
          this.filteredRestaurants = data;
          this.recommendedRestaurants = [...data]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 4);
          this.cuisineTypes = [...new Set(data.map((r) => r.category))];
          this.loading = false;
        } else {
          this.error = 'Restoran bulunamadı';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Restoranlar yüklenirken bir hata oluştu';
        this.loading = false;
        console.error('Veri yükleme hatası:', error);
      },
    });
  }

  showAllRestaurants() {
    this.loading = true;
    this.searchTerm = '';
    this.selectedCuisines = [];
    this.minRating = 0;
    this.isFilterMenuOpen = false;

    // Tüm restoranları yeniden yükle
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.restaurants = data;
          this.filteredRestaurants = data;
          this.loading = false;

          // Başarılı yükleme mesajı
          this.notificationMessage = `${data.length} restoran listelendi`;
          this.showNotification = true;
          setTimeout(() => {
            this.showNotification = false;
          }, 3000);
        } else {
          this.error = 'Restoran bulunamadı';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Restoranlar yüklenirken bir hata oluştu';
        this.loading = false;
        console.error('Veri yükleme hatası:', error);
      },
    });
  }

  applyFilters() {
    this.loading = true;
    this.restaurantService.getRestaurants().subscribe((restaurants) => {
      const filteredData = Object.values(restaurants).filter((restaurant) => {
        const matchesSearch = this.searchTerm
          ? restaurant.name
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase()) ||
            restaurant.category
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase())
          : true;

        const matchesCuisine = this.selectedCuisines.length
          ? this.selectedCuisines.includes(restaurant.category)
          : true;

        const matchesRating = (restaurant.rating || 0) >= this.minRating;

        return matchesSearch && matchesCuisine && matchesRating;
      });

      this.filteredRestaurants = filteredData;
      this.loading = false;

      // Filtre sonuçlarını kontrol et
      if (this.hasActiveFilters() && filteredData.length === 0) {
        this.notificationMessage = 'Filtrelere uygun restoran bulunamadı';
        this.showNotification = true;
        setTimeout(() => {
          this.showNotification = false;
        }, 3000);
      }
    });
  }

  toggleFavorite(restaurant: Restaurant) {
    this.restaurantService.toggleFavorite(restaurant).subscribe({
      next: () => {
        // Başarılı mesajı göster
        this.notificationMessage = restaurant.isFavorite
          ? 'Favorilerden kaldırıldı'
          : 'Favorilere eklendi';
        this.showNotification = true;
        setTimeout(() => {
          this.showNotification = false;
        }, 3000);

        // Yerel listeyi güncelle
        restaurant.isFavorite = !restaurant.isFavorite;
      },
      error: (error) => {
        console.error('Favori durumu güncellenirken hata:', error);
        this.notificationMessage = 'Bir hata oluştu';
        this.showNotification = true;
        setTimeout(() => {
          this.showNotification = false;
        }, 3000);
      },
    });
  }

  searchRestaurants() {
    this.applyFilters();
  }

  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }

  togglePopularFilter(filter: string) {
    switch (filter) {
      case 'En Yüksek Puan':
        this.filteredRestaurants.sort(
          (a, b) => (b.rating || 0) - (a.rating || 0)
        );
        break;
      case 'En Çok Sipariş':
        this.filteredRestaurants.sort(
          (a, b) => (b.reviews || 0) - (a.reviews || 0)
        );
        break;
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

  hasActiveFilters(): boolean {
    return (
      this.searchTerm !== '' ||
      this.selectedCuisines.length > 0 ||
      this.minRating > 0
    );
  }

  navigateToOrder(restaurant: Restaurant) {
    if (!restaurant?.id) {
      console.error('Restaurant ID bulunamadı');
      return;
    }

    // Restoran bilgisini localStorage'a kaydet
    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));

    // Yönlendirme yap
    this.router
      .navigate(['/order', restaurant.id])
      .then(() => {
        console.log('Yönlendirme başarılı');
      })
      .catch((error) => {
        console.error('Yönlendirme hatası:', error);
      });
  }
}
