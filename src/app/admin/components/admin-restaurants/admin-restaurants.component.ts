import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RestaurantService,
  Restaurant,
} from '../../../services/restaurant.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-admin-restaurants',
  templateUrl: './admin-restaurants.component.html',
  styleUrls: ['./admin-restaurants.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AdminRestaurantsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  editingRestaurant: Restaurant | null = null;
  showDeleteConfirm = false;
  restaurantToDelete: Restaurant | null = null;
  showAddModal = false;
  newRestaurant: Restaurant = {
    id: '',
    name: '',
    category: '',
    address: '',
    phone: '',
    rating: 0,
    reviews: 0,
    menu: [],
    isFavorite: false,
    owner: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  };

  constructor(
    private restaurantService: RestaurantService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
      },
      error: (error) => {
        console.error('Restoranlar yüklenirken hata:', error);
        this.notificationService.showError('Restoranlar yüklenemedi');
      },
    });
  }

  editRestaurant(restaurant: Restaurant) {
    this.editingRestaurant = { ...restaurant };
  }

  cancelEdit() {
    this.editingRestaurant = null;
  }

  saveRestaurant() {
    if (this.editingRestaurant) {
      this.restaurantService
        .updateRestaurant(this.editingRestaurant.id, this.editingRestaurant)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess(
              'Restoran başarıyla güncellendi'
            );
            this.loadRestaurants();
            this.editingRestaurant = null;
          },
          error: (error) => {
            console.error('Restoran güncellenirken hata:', error);
            this.notificationService.showError('Restoran güncellenemedi');
          },
        });
    }
  }

  confirmDelete(restaurant: Restaurant) {
    this.restaurantToDelete = restaurant;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.restaurantToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteRestaurant() {
    if (this.restaurantToDelete) {
      this.restaurantService
        .deleteRestaurant(this.restaurantToDelete.id)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Restoran başarıyla silindi');
            this.loadRestaurants();
            this.showDeleteConfirm = false;
            this.restaurantToDelete = null;
          },
          error: (error) => {
            console.error('Restoran silinirken hata:', error);
            this.notificationService.showError('Restoran silinemedi');
          },
        });
    }
  }

  showAddRestaurantModal() {
    this.showAddModal = true;
    this.newRestaurant = {
      id: '',
      name: '',
      category: '',
      address: '',
      phone: '',
      rating: 0,
      reviews: 0,
      menu: [],
      isFavorite: false,
      owner: {
        name: '',
        email: '',
        phone: '',
        password: '',
      },
    };
  }

  cancelAdd() {
    this.showAddModal = false;
  }

  addRestaurant() {
    if (this.newRestaurant.name && this.newRestaurant.category) {
      this.restaurantService.addRestaurant(this.newRestaurant).subscribe({
        next: () => {
          this.notificationService.showSuccess('Restoran başarıyla eklendi');
          this.loadRestaurants();
          this.showAddModal = false;
        },
        error: (error) => {
          console.error('Restoran eklenirken hata:', error);
          this.notificationService.showError('Restoran eklenemedi');
        },
      });
    }
  }
}
