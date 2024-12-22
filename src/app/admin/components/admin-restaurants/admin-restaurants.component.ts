import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  RestaurantService,
  Restaurant,
} from '../../../services/restaurant.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-admin-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section">
      <div class="section-header">
        <h3>Restoranlar</h3>
        <button class="add-btn" (click)="openAddModal()">
          <i class="fas fa-plus"></i> Yeni Restoran Ekle
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ad</th>
            <th>Kategori</th>
            <th>Puan</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let restaurant of restaurants">
            <td>{{ restaurant.id }}</td>
            <td>{{ restaurant.name }}</td>
            <td>{{ restaurant.category }}</td>
            <td>{{ restaurant.rating }}</td>
            <td>
              <div class="action-buttons">
                <button
                  type="button"
                  class="edit-btn"
                  (click)="editRestaurant(restaurant)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  type="button"
                  class="delete-btn"
                  (click)="confirmDelete(restaurant)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Düzenleme/Ekleme Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Restoran Düzenle' : 'Yeni Restoran Ekle' }}</h3>
          <button class="close-btn" (click)="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form #editForm="ngForm">
            <div class="form-group">
              <label>Restoran Adı</label>
              <input
                type="text"
                [(ngModel)]="editingRestaurant.name"
                name="name"
                required
                #name="ngModel"
              />
              <div class="error-message" *ngIf="name.invalid && name.touched">
                Restoran adı gereklidir
              </div>
            </div>

            <div class="form-group">
              <label>Kategori</label>
              <input
                type="text"
                [(ngModel)]="editingRestaurant.category"
                name="category"
                required
                #category="ngModel"
              />
              <div
                class="error-message"
                *ngIf="category.invalid && category.touched"
              >
                Kategori gereklidir
              </div>
            </div>

            <div class="form-group">
              <label>Adres</label>
              <textarea
                [(ngModel)]="editingRestaurant.address"
                name="address"
                required
                #address="ngModel"
              ></textarea>
              <div
                class="error-message"
                *ngIf="address.invalid && address.touched"
              >
                Adres gereklidir
              </div>
            </div>

            <div class="form-group">
              <label>Resim URL</label>
              <input
                type="text"
                [(ngModel)]="editingRestaurant.url"
                name="url"
                required
                #url="ngModel"
              />
              <div class="error-message" *ngIf="url.invalid && url.touched">
                Resim URL'si gereklidir
              </div>
            </div>

            <div class="form-group">
              <label>Puan</label>
              <input
                type="number"
                [(ngModel)]="editingRestaurant.rating"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                required
                #rating="ngModel"
              />
              <div
                class="error-message"
                *ngIf="rating.invalid && rating.touched"
              >
                Puan 0-5 arasında olmalıdır
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            class="cancel-btn"
            (click)="closeModal()"
            [disabled]="isSaving"
          >
            İptal
          </button>
          <button
            class="save-btn"
            (click)="saveRestaurant()"
            [disabled]="editForm.invalid || isSaving"
          >
            <span *ngIf="!isSaving">Kaydet</span>
            <span *ngIf="isSaving">
              <i class="fas fa-spinner fa-spin"></i> Kaydediliyor...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bildirim komponenti -->
    <div
      class="notification"
      *ngIf="showNotification"
      [class]="notificationType"
    >
      {{ notificationMessage }}
    </div>

    <!-- Silme Modal -->
    <div
      class="modal"
      *ngIf="showDeleteModal"
      (click)="closeDeleteModal($event)"
    >
      <div class="modal-content delete-modal">
        <div class="modal-header">
          <h3>
            <i class="fas fa-exclamation-triangle"></i>
            Restoran Silme
          </h3>
        </div>
        <div class="modal-body">
          <p>
            <strong>"{{ restaurantToDelete?.name }}"</strong> restoranını silmek
            istediğinize emin misiniz?<br />
            <small>Bu işlem geri alınamaz.</small>
          </p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" (click)="closeDeleteModal($event)">
            <i class="fas fa-times"></i> İptal
          </button>
          <button
            class="delete-btn"
            (click)="confirmDeleteRestaurant()"
            [disabled]="isDeleting"
          >
            <i
              [class]="isDeleting ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"
            ></i>
            {{ isDeleting ? 'Siliniyor...' : 'Sil' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Buraya admin-restaurants.component.css içeriğini taşıyoruz */
      .section {
        margin-bottom: 2rem;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
      }

      .edit-btn,
      .delete-btn {
        padding: 0.5rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        color: white;
        transition: all 0.3s ease;
        min-width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .edit-btn {
        background: #667eea;
      }

      .delete-btn {
        background: #ef4444;
      }

      .edit-btn:hover,
      .delete-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }

      .edit-btn:hover {
        background: #5a67d8;
      }

      .delete-btn:hover {
        background: #dc2626;
      }

      .edit-btn:active,
      .delete-btn:active {
        transform: translateY(0);
      }

      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1050;
        backdrop-filter: blur(4px);
      }

      .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        width: 90%;
        max-width: 600px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        transform: translateY(0);
        animation: modalSlideIn 0.3s ease;
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-header h3 {
        color: #1a237e;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #666;
        cursor: pointer;
        transition: color 0.3s ease;
        padding: 0.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }

      .modal-body {
        margin-bottom: 1.5rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #4a5568;
        font-weight: 500;
      }

      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: #f8fafc;
      }

      .form-group input:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        background: white;
      }

      .form-group textarea {
        min-height: 100px;
        resize: vertical;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }

      .modal-footer button {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .save-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
      }

      .save-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }

      .cancel-btn {
        background: white;
        color: #666;
        border: 1px solid #e2e8f0;
      }

      .cancel-btn:hover {
        background: #f8f9fa;
        border-color: #cbd5e0;
      }

      /* Form validation stilleri */
      .form-group input.ng-invalid.ng-touched,
      .form-group textarea.ng-invalid.ng-touched {
        border-color: #ef4444;
      }

      .form-group input.ng-invalid.ng-touched:focus,
      .form-group textarea.ng-invalid.ng-touched:focus {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }

      /* Loading durumu için */
      .save-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      /* Responsive tasarım */
      @media (max-width: 640px) {
        .modal-content {
          width: 95%;
          padding: 1.5rem;
        }

        .modal-footer {
          flex-direction: column-reverse;
          gap: 0.5rem;
        }

        .modal-footer button {
          width: 100%;
        }
      }

      /* Bildirim stilleri */
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        z-index: 1100;
      }

      .notification.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      }

      .notification.error {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      .error-message {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .ng-invalid.ng-touched {
        border-color: #ef4444;
      }

      /* Silme Dialog Stilleri */
      .custom-dialog {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: flex-start;
        z-index: 1100;
        backdrop-filter: blur(4px);
      }

      .dialog-content {
        background: white;
        padding: 2rem;
        border-radius: 0 0 15px 15px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        max-width: 500px;
        width: 90%;
        animation: slideDown 0.3s ease;
        border-bottom: 4px solid #ef4444;
        margin-top: 0;
        position: relative;
        top: 0;
      }

      .dialog-content h3 {
        color: #ef4444;
        margin-bottom: 1rem;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
      }

      .dialog-content h3 i {
        font-size: 1.25rem;
        color: #ef4444;
      }

      .dialog-content p {
        color: #4b5563;
        margin-bottom: 1.5rem;
        line-height: 1.6;
        font-size: 1.1rem;
      }

      .dialog-content p strong {
        color: #1f2937;
      }

      .dialog-content p small {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.9rem;
      }

      .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
      }

      .dialog-buttons button {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .dialog-buttons .cancel-btn {
        background: white;
        border: 1px solid #e5e7eb;
        color: #4b5563;
      }

      .dialog-buttons .delete-btn {
        background: #ef4444;
        border: none;
        color: white;
      }

      .dialog-buttons .cancel-btn:hover {
        background: #f9fafb;
        border-color: #d1d5db;
      }

      .dialog-buttons .delete-btn:hover {
        background: #dc2626;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
      }

      @keyframes slideDown {
        from {
          transform: translateY(-100%);
        }
        to {
          transform: translateY(0);
        }
      }

      /* Responsive tasarım için */
      @media (max-width: 640px) {
        .dialog-content {
          width: 100%;
          border-radius: 0 0 10px 10px;
        }

        .dialog-buttons {
          flex-direction: column-reverse;
          gap: 0.5rem;
        }

        .dialog-buttons button {
          width: 100%;
        }
      }

      .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1100;
        backdrop-filter: blur(4px);
      }

      .modal-content {
        background: white;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 500px;
        animation: modalFadeIn 0.3s ease;
      }

      .delete-modal {
        border: 2px solid #ef4444;
      }

      .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .modal-header h3 {
        color: #ef4444;
        margin: 0;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .modal-header h3 i {
        font-size: 1.25rem;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .modal-body p {
        color: #4b5563;
        margin: 0;
        line-height: 1.6;
        font-size: 1.1rem;
      }

      .modal-body p strong {
        color: #1f2937;
      }

      .modal-body p small {
        display: block;
        margin-top: 0.5rem;
        color: #6b7280;
        font-size: 0.9rem;
      }

      .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      .modal-footer button {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 120px;
        justify-content: center;
      }

      .cancel-btn {
        background: white;
        border: 1px solid #e5e7eb;
        color: #4b5563;
      }

      .delete-btn {
        background: #ef4444;
        border: none;
        color: white;
      }

      .delete-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .cancel-btn:hover {
        background: #f9fafb;
        border-color: #d1d5db;
      }

      .delete-btn:not(:disabled):hover {
        background: #dc2626;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
      }

      @keyframes modalFadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @media (max-width: 640px) {
        .modal-content {
          width: 95%;
          margin: 1rem;
        }

        .modal-footer {
          flex-direction: column-reverse;
        }

        .modal-footer button {
          width: 100%;
        }
      }
    `,
  ],
})
export class AdminRestaurantsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  @ViewChild('editForm') editForm!: NgForm;
  showModal = false;
  isEditing = false;
  editingRestaurant: Partial<Restaurant> = {};
  showNotification = false;
  notificationMessage = '';
  notificationType = 'success';
  isSaving = false;

  // Yeni eklenecek özellikler
  showDeleteModal = false;
  isDeleting = false;
  restaurantToDelete: Restaurant | null = null;

  constructor(
    private restaurantService: RestaurantService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
      },
      error: (error) => {
        console.error('Yükleme hatası:', error);
        this.notificationService.showError(
          'Restoranlar yüklenirken bir hata oluştu'
        );
      },
    });
  }

  // Silme işlemleri için yeni metodlar
  confirmDelete(restaurant: Restaurant) {
    this.restaurantToDelete = restaurant;
    this.showDeleteModal = true;
  }

  closeDeleteModal(event: MouseEvent) {
    if (
      event.target instanceof HTMLElement &&
      (event.target.classList.contains('modal') ||
        event.target.classList.contains('cancel-btn'))
    ) {
      this.showDeleteModal = false;
      this.restaurantToDelete = null;
    }
  }

  confirmDeleteRestaurant() {
    if (!this.restaurantToDelete || this.isDeleting) return;

    this.isDeleting = true;
    this.restaurantService
      .deleteRestaurant(this.restaurantToDelete.id)
      .subscribe({
        next: () => {
          this.loadRestaurants();
          this.notificationService.showSuccess(
            `"${this.restaurantToDelete?.name}" başarıyla silindi`
          );
          this.showDeleteModal = false;
          this.restaurantToDelete = null;
        },
        error: (error) => {
          console.error('Silme hatası:', error);
          this.notificationService.showError(
            'Restoran silinirken bir hata oluştu'
          );
        },
        complete: () => {
          this.isDeleting = false;
        },
      });
  }

  openAddModal() {
    this.isEditing = false;
    this.editingRestaurant = {
      name: '',
      category: '',
      address: '',
      url: '',
      rating: 0,
      reviews: 0,
      products: [],
      menu: [],
      isFavorite: false,
    };
    this.showModal = true;
  }

  editRestaurant(restaurant: Restaurant) {
    this.isEditing = true;
    this.editingRestaurant = { ...restaurant };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingRestaurant = {};
  }

  saveRestaurant() {
    if (this.editForm && !this.editForm.valid) {
      this.notificationService.showError('Lütfen tüm alanları doldurun');
      return;
    }

    this.isSaving = true;

    if (this.isEditing && this.editingRestaurant.id) {
      // Güncelleme işlemi
      this.restaurantService
        .updateRestaurant(this.editingRestaurant as Restaurant)
        .subscribe({
          next: () => {
            this.loadRestaurants();
            this.closeModal();
          },
          error: (error) => {
            console.error('Restoran güncellenirken hata:', error);
          },
          complete: () => {
            this.isSaving = false;
          },
        });
    } else {
      // Yeni restoran ekleme işlemi
      this.restaurantService
        .addRestaurant(this.editingRestaurant as Omit<Restaurant, 'id'>)
        .subscribe({
          next: () => {
            this.loadRestaurants();
            this.closeModal();
          },
          error: (error) => {
            console.error('Restoran eklenirken hata:', error);
          },
          complete: () => {
            this.isSaving = false;
          },
        });
    }
  }
}
