import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  RestaurantService,
  Restaurant,
  MenuItem,
  Order,
} from '../services/restaurant.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { firstValueFrom } from 'rxjs';

// Status çevirilerini tanımlayalım
const statusTranslations = {
  pending: 'Beklemede',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
};

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent implements OnInit {
  restaurant: Restaurant | null = null;
  selectedItems: MenuItem[] = [];
  totalAmount: number = 0;
  currentBalance: number = 0;
  selectedCategory: string = 'Tümü';
  showBalanceError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadRestaurant();
    this.loadUserBalance();
  }

  private loadRestaurant() {
    this.route.params.subscribe((params) => {
      const restaurantId = params['id'];
      if (restaurantId) {
        const savedRestaurant = localStorage.getItem('selectedRestaurant');
        if (savedRestaurant) {
          this.restaurant = JSON.parse(savedRestaurant);
        } else {
          this.restaurantService.getRestaurantById(restaurantId).subscribe({
            next: (restaurant) => {
              this.restaurant = restaurant;
            },
            error: (error) => {
              console.error('Restoran yüklenirken hata:', error);
              this.notificationService.showError(
                'Restoran bilgileri yüklenemedi'
              );
            },
          });
        }
      }
    });
  }

  private loadUserBalance() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userService.getUserBalance(user.uid).subscribe((balance) => {
          this.currentBalance = balance;
        });
      }
    });
  }

  getUniqueCategories(): string[] {
    if (!this.restaurant?.menu) return ['Tümü'];
    const categories = this.restaurant.menu.map(
      (item) => item.category || 'Diğer'
    );
    return ['Tümü', ...new Set(categories)];
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  getItemsByCategory(category: string): MenuItem[] {
    if (!this.restaurant?.menu) return [];
    if (category === 'Tümü') return this.restaurant.menu;
    return this.restaurant.menu.filter(
      (item) => (item.category || 'Diğer') === category
    );
  }

  addToCart(item: MenuItem) {
    const existingItem = this.selectedItems.find((i) => i.id === item.id);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 0) + 1;
    } else {
      this.selectedItems.push({ ...item, quantity: 1 });
    }
    this.calculateTotal();
    this.notificationService.showSuccess('Ürün sepete eklendi');
  }

  updateQuantity(item: MenuItem, change: number) {
    const existingItem = this.selectedItems.find((i) => i.id === item.id);

    if (existingItem) {
      const newQuantity = (existingItem.quantity || 0) + change;
      if (newQuantity <= 0) {
        // Ürünü sepetten kaldır
        this.selectedItems = this.selectedItems.filter((i) => i.id !== item.id);
      } else {
        existingItem.quantity = newQuantity;
      }
    } else if (change > 0) {
      // Yeni ürün ekleniyor
      this.selectedItems.push({ ...item, quantity: 1 });
    }

    this.calculateTotal();
    console.log('Güncel sepet:', this.selectedItems); // Debug için
  }

  getItemQuantity(item: MenuItem): number {
    const selectedItem = this.selectedItems.find((i) => i.id === item.id);
    return selectedItem?.quantity || 0;
  }

  private calculateTotal() {
    this.totalAmount = this.selectedItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 0),
      0
    );
    console.log('Toplam tutar:', this.totalAmount); // Debug için
  }

  async completeOrder() {
    if (!this.restaurant || !this.selectedItems.length) {
      this.notificationService.showError('Lütfen en az bir ürün seçin');
      return;
    }

    if (this.totalAmount > this.currentBalance) {
      // Sadece butonu disable et, mesaj gösterme
      return;
    }

    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user) {
        this.notificationService.showError('Lütfen giriş yapın');
        return;
      }

      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      const orderNumber = `SP${timestamp.toString().slice(-6)}${randomNum}`;

      const order: Order = {
        id: timestamp.toString(),
        userId: user.uid,
        userName: user.displayName || user.email || 'İsimsiz Kullanıcı',
        restaurantId: this.restaurant.id,
        restaurantName: this.restaurant.name,
        items: this.selectedItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 0,
          category: item.category,
          description: item.description,
          portion: item.portion,
        })),
        totalAmount: this.totalAmount,
        status: 'pending',
        orderDate: new Date().toISOString(),
        orderNumber: orderNumber,
      };

      // Önce siparişi kaydet
      await firstValueFrom(this.restaurantService.createOrder(order));

      // Sonra bakiyeyi güncelle
      await firstValueFrom(
        this.userService.deductBalance(user.uid, this.totalAmount)
      );

      // Başarı mesajını göster
      this.notificationService.showSuccess('Siparişiniz başarıyla alındı!');

      // Yönlendirmeyi değiştirelim
      this.router
        .navigate(['/profile'], { replaceUrl: true })
        .then(() => {
          console.log('Profil sayfasına yönlendirildi');
        })
        .catch((error) => {
          console.error('Yönlendirme hatası:', error);
        });
    } catch (error) {
      console.error('Sipariş oluşturulurken hata:', error);
      this.notificationService.showError('Sipariş oluşturulamadı');
    }
  }

  // Status'u görüntülerken Türkçe çevirisini kullanabiliriz
  getStatusTranslation(status: string): string {
    return (
      statusTranslations[status as keyof typeof statusTranslations] || status
    );
  }
}
