import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../../../services/restaurant.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section">
      <div class="section-header">
        <h3>Kategoriler</h3>
        <button class="add-btn" (click)="showAddCategoryForm()">
          <i class="fas fa-plus"></i> Yeni Kategori Ekle
        </button>
      </div>
      <div class="categories-list">
        <div *ngFor="let category of categories" class="category-item">
          <span>{{ category }}</span>
          <button class="delete-btn" (click)="deleteCategory(category)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AdminCategoriesComponent implements OnInit {
  categories: string[] = [];

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.restaurantService.getRestaurants().subscribe((restaurants) => {
      this.categories = [...new Set(restaurants.map((r) => r.category))];
    });
  }

  showAddCategoryForm() {
    // Kategori ekleme formu gösterme işlemi
  }

  deleteCategory(category: string) {
    // Kategori silme işlemi
  }
}
