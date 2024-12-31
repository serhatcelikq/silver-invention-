import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MenuItem } from '../../services/restaurant.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="menu-container">
      <div class="header">
        <h2>Menü Yönetimi</h2>
        <button class="add-btn" (click)="openModal()">
          <i class="fas fa-plus"></i> Yeni Ürün Ekle
        </button>
      </div>

      <div class="menu-grid">
        <div *ngFor="let item of menuItems" class="menu-card">
          <div class="card-content">
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="description">{{ item.description }}</p>
              <div class="meta">
                <span class="category">
                  <i class="fas fa-tag"></i> {{ item.category }}
                </span>
                <span class="portion">
                  <i class="fas fa-utensils"></i> {{ item.portion }}
                </span>
              </div>
            </div>
            <div class="price-tag">₺{{ item.price }}</div>
          </div>
          <div class="card-actions">
            <button class="edit-btn" (click)="editItem(item)">
              <i class="fas fa-edit"></i> Düzenle
            </button>
            <button class="delete-btn" (click)="confirmDelete(item)">
              <i class="fas fa-trash"></i> Sil
            </button>
          </div>
        </div>
      </div>

      <!-- Ürün Ekleme/Düzenleme Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal($event)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editMode ? 'Ürün Düzenle' : 'Yeni Ürün Ekle' }}</h3>
            <button class="close-btn" (click)="closeModal($event)">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form [formGroup]="menuForm" (ngSubmit)="saveItem()">
            <div class="form-group">
              <label>Ürün Adı</label>
              <input
                type="text"
                formControlName="name"
                placeholder="Ürün adı"
              />
            </div>
            <div class="form-group">
              <label>Açıklama</label>
              <textarea
                formControlName="description"
                placeholder="Ürün açıklaması"
              ></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Kategori</label>
                <input
                  type="text"
                  formControlName="category"
                  placeholder="Kategori"
                />
              </div>
              <div class="form-group">
                <label>Porsiyon</label>
                <input
                  type="text"
                  formControlName="portion"
                  placeholder="Porsiyon"
                />
              </div>
            </div>
            <div class="form-group">
              <label>Fiyat</label>
              <input
                type="number"
                formControlName="price"
                placeholder="Fiyat"
              />
            </div>
            <div class="modal-actions">
              <button
                type="button"
                class="cancel-btn"
                (click)="closeModal($event)"
              >
                İptal
              </button>
              <button
                type="submit"
                class="save-btn"
                [disabled]="!menuForm.valid"
              >
                {{ editMode ? 'Güncelle' : 'Kaydet' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Silme Onay Modalı -->
      <div
        class="modal-overlay"
        *ngIf="showDeleteModal"
        (click)="closeDeleteModal()"
      >
        <div class="delete-modal" (click)="$event.stopPropagation()">
          <div class="delete-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Ürünü Silmek İstediğinize Emin Misiniz?</h3>
          <p>{{ selectedItem?.name }} silinecek. Bu işlem geri alınamaz.</p>
          <div class="modal-actions">
            <button class="cancel-btn" (click)="closeDeleteModal()">
              İptal
            </button>
            <button class="confirm-delete-btn" (click)="deleteItem()">
              <i class="fas fa-trash"></i> Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .menu-container {
        padding: 2rem;
        background: #f8fafc;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .header h2 {
        font-size: 2rem;
        color: #1e293b;
        margin: 0;
      }

      .add-btn {
        background: #22c55e;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .add-btn:hover {
        background: #16a34a;
        transform: translateY(-2px);
      }

      .menu-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .menu-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
      }

      .menu-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
      }

      .card-content {
        padding: 1.5rem;
      }

      .item-details h3 {
        margin: 0;
        color: #1e293b;
        font-size: 1.25rem;
      }

      .description {
        color: #64748b;
        margin: 0.5rem 0;
        font-size: 0.9rem;
      }

      .meta {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }

      .category,
      .portion {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #64748b;
        font-size: 0.9rem;
      }

      .price-tag {
        font-size: 1.5rem;
        font-weight: 600;
        color: #16a34a;
        margin-top: 1rem;
      }

      .card-actions {
        display: flex;
        border-top: 1px solid #e2e8f0;
      }

      .edit-btn,
      .delete-btn {
        flex: 1;
        padding: 1rem;
        border: none;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
      }

      .edit-btn {
        color: #3b82f6;
      }

      .delete-btn {
        color: #ef4444;
        border-left: 1px solid #e2e8f0;
      }

      .edit-btn:hover {
        background: #eff6ff;
      }

      .delete-btn:hover {
        background: #fef2f2;
      }

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal-content {
        background: white;
        border-radius: 16px;
        width: 90%;
        max-width: 600px;
        padding: 2rem;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #64748b;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #1e293b;
        font-weight: 500;
      }

      input,
      textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
      }

      textarea {
        height: 100px;
        resize: vertical;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
      }

      .save-btn,
      .cancel-btn {
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .save-btn {
        background: #3b82f6;
        color: white;
      }

      .save-btn:hover {
        background: #2563eb;
      }

      .cancel-btn {
        background: #e2e8f0;
        color: #64748b;
      }

      .cancel-btn:hover {
        background: #cbd5e1;
      }

      /* Delete Modal */
      .delete-modal {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        text-align: center;
        max-width: 400px;
      }

      .delete-icon {
        font-size: 3rem;
        color: #ef4444;
        margin-bottom: 1rem;
      }

      .confirm-delete-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .confirm-delete-btn:hover {
        background: #dc2626;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }

      .add-category-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .add-category-btn:hover {
        background: #2563eb;
        transform: translateY(-2px);
      }

      .category-modal {
        max-width: 500px;
      }
    `,
  ],
})
export class MenuComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  private subscription: Subscription | undefined;
  currentRestaurantId: string = '';
  showModal = false;
  showDeleteModal = false;
  editMode = false;
  selectedItem: MenuItem | null = null;
  menuForm: FormGroup;

  constructor(private fb: FormBuilder, private db: AngularFireDatabase) {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      portion: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    // Giriş yapan restoranın bilgilerini al
    const restaurantData = localStorage.getItem('currentRestaurant');
    if (restaurantData) {
      const restaurant = JSON.parse(restaurantData);
      // restaurant1 formatındaki ID'yi al
      this.currentRestaurantId = restaurant.id.toString().includes('restaurant')
        ? restaurant.id
        : `restaurant${restaurant.id}`;

      console.log('Mevcut restoran ID:', this.currentRestaurantId);

      // Sadece giriş yapan restoranın menüsünü getir
      this.subscription = this.db
        .object(`restaurants/${this.currentRestaurantId}`)
        .valueChanges()
        .subscribe({
          next: (data: any) => {
            console.log('Restoran verisi:', data);
            if (data && data.menu) {
              this.menuItems = data.menu;
              console.log('Yüklenen menü:', this.menuItems);
            } else {
              console.log('Menü bulunamadı');
              this.menuItems = [];
            }
          },
          error: (error) => {
            console.error('Menü yüklenirken hata:', error);
            this.menuItems = [];
          },
        });
    } else {
      console.error('Restoran bilgisi bulunamadı');
    }
  }

  private async updateMenu(newMenu: MenuItem[]) {
    if (this.currentRestaurantId) {
      try {
        // Sadece giriş yapan restoranın menüsünü güncelle
        await this.db
          .object(`restaurants/${this.currentRestaurantId}`)
          .update({ menu: newMenu });

        // Menü değişikliklerinin geçmişini tut
        await this.db.list(`menu_history/${this.currentRestaurantId}`).push({
          menu: newMenu,
          updatedAt: new Date().toISOString(),
          updatedBy: 'restaurant_admin',
        });

        console.log('Menü başarıyla güncellendi');
      } catch (error) {
        console.error('Menü güncellenirken hata:', error);
        throw error;
      }
    } else {
      console.error('Restoran ID bulunamadı');
      throw new Error('Restoran ID bulunamadı');
    }
  }

  async addMenuItem() {
    if (this.menuForm.valid) {
      const newItem: MenuItem = {
        id: Date.now(),
        ...this.menuForm.value,
        quantity: 0,
      };

      this.menuItems = [...this.menuItems, newItem];
      await this.updateMenu(this.menuItems);
      this.showModal = false;
      this.menuForm.reset();
    }
  }

  openModal() {
    this.showModal = true;
    this.editMode = false;
    this.menuForm.reset();
  }

  closeModal(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.showModal = false;
    this.editMode = false;
    this.selectedItem = null;
    this.menuForm.reset();
  }

  editItem(item: MenuItem) {
    this.editMode = true;
    this.selectedItem = item;
    this.showModal = true;
    this.menuForm.patchValue({
      name: item.name,
      description: item.description,
      category: item.category,
      portion: item.portion,
      price: item.price,
    });
  }

  confirmDelete(item: MenuItem) {
    this.selectedItem = item;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedItem = null;
  }

  async saveItem() {
    if (this.menuForm.valid) {
      const formData = this.menuForm.value;

      try {
        if (this.editMode && this.selectedItem) {
          // Mevcut ürünü güncelle
          const updatedItem: MenuItem = {
            ...this.selectedItem,
            ...formData,
          };

          const updatedMenu = this.menuItems.map((item) =>
            item.id === this.selectedItem?.id ? updatedItem : item
          );

          await this.updateMenu(updatedMenu);
        } else {
          // Yeni ürün ekle
          const newItem: MenuItem = {
            id: Date.now(),
            quantity: 0,
            ...formData,
          };

          await this.updateMenu([...this.menuItems, newItem]);
        }

        this.closeModal();
      } catch (error) {
        console.error('Menü güncellenirken hata:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  }

  async deleteItem() {
    if (this.selectedItem) {
      try {
        const updatedMenu = this.menuItems.filter(
          (item) => item.id !== this.selectedItem?.id
        );
        await this.updateMenu(updatedMenu);
        this.closeDeleteModal();
      } catch (error) {
        console.error('Ürün silinirken hata:', error);
        alert('Silme işlemi başarısız oldu. Lütfen tekrar deneyin.');
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
