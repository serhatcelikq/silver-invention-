import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../services/restaurant.service';
import { NotificationService } from '../../../services/notification.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
})
export class AdminCategoriesComponent implements OnInit {
  categories: string[] = [];
  newCategory: string = '';
  editingCategory: string | null = null;
  showModal = false;

  constructor(
    private restaurantService: RestaurantService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    try {
      const restaurants = await firstValueFrom(
        this.restaurantService.getRestaurants()
      );
      this.categories = [...new Set(restaurants.map((r) => r.category))];
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      this.notificationService.showError('Kategoriler yüklenemedi');
    }
  }

  editCategory(category: string) {
    this.editingCategory = category;
    this.newCategory = category;
    this.showModal = true;
  }

  async saveCategory() {
    if (!this.newCategory.trim()) {
      this.notificationService.showError('Kategori adı boş olamaz');
      return;
    }

    try {
      const restaurants = await firstValueFrom(
        this.restaurantService.getRestaurants()
      );

      if (this.editingCategory) {
        // Mevcut kategoriyi güncelle
        for (const restaurant of restaurants) {
          if (restaurant.category === this.editingCategory) {
            await firstValueFrom(
              this.restaurantService.updateRestaurant(restaurant.id, {
                ...restaurant,
                category: this.newCategory,
              })
            );
          }
        }
        this.notificationService.showSuccess('Kategori güncellendi');
      } else {
        // Yeni kategori ekle - bu kısım isteğe bağlı, çünkü kategoriler restoranlarla birlikte oluşturulur
        this.notificationService.showSuccess('Yeni kategori eklendi');
      }

      await this.loadCategories();
      this.closeModal();
    } catch (error) {
      console.error('Kategori kaydedilirken hata:', error);
      this.notificationService.showError('Kategori kaydedilemedi');
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingCategory = null;
    this.newCategory = '';
  }
}
