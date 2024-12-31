import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../services/layout.service';
import { RestaurantOwnerService } from '../services/restaurant-owner.service';
import {
  RestaurantService,
  Restaurant,
  MenuItem,
} from '../services/restaurant.service';
import { OrderService, Order } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-restaurant-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './restaurant-admin.component.html',
  styleUrls: ['./restaurant-admin.component.css'],
})
export class RestaurantAdminComponent implements OnInit {
  restaurant: Restaurant | null = null;
  activeSection: string = 'stats';
  dailyOrders: number = 0;
  dailyRevenue: number = 0;
  menuItemForm: MenuItem = {
    id: 0,
    name: '',
    price: 0,
    description: '',
    category: '',
    portion: '',
    quantity: 0,
  };
  showMenuModal: boolean = false;
  editingMenuItem: MenuItem | null = null;

  constructor(
    private router: Router,
    private layoutService: LayoutService,
    private restaurantOwnerService: RestaurantOwnerService,
    private restaurantService: RestaurantService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.layoutService.hideHeader();
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        try {
          const restaurant = await firstValueFrom(
            this.restaurantService.getMyRestaurant()
          );
          if (restaurant) {
            this.restaurant = restaurant;
          }
        } catch (error) {
          console.error('Restoran yüklenirken hata:', error);
        }
      }
    });
    this.calculateDailyStats();
  }

  async updateRestaurant() {
    if (!this.restaurant) return;

    try {
      await firstValueFrom(
        this.restaurantService.updateRestaurant(
          this.restaurant.id,
          this.restaurant
        )
      );
      this.notificationService.showSuccess('Restoran bilgileri güncellendi');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      this.notificationService.showError('Güncelleme başarısız oldu');
    }
  }

  async saveMenuItem() {
    if (!this.restaurant) return;

    try {
      const updatedMenu = [...(this.restaurant.menu || [])];

      if (this.editingMenuItem) {
        // Mevcut öğeyi güncelle
        const index = updatedMenu.findIndex(
          (item) => item.id === this.editingMenuItem!.id
        );
        if (index !== -1) {
          updatedMenu[index] = { ...this.menuItemForm };
        }
      } else {
        // Yeni öğe ekle
        const newItem = {
          ...this.menuItemForm,
          id: Date.now(),
        };
        updatedMenu.push(newItem);
      }

      await firstValueFrom(
        this.restaurantService.updateMenu(this.restaurant.id, updatedMenu)
      );

      this.restaurant.menu = updatedMenu;
      this.closeMenuModal();
      this.notificationService.showSuccess(
        this.editingMenuItem
          ? 'Menü öğesi güncellendi'
          : 'Yeni menü öğesi eklendi'
      );
    } catch (error) {
      console.error('Menü güncelleme hatası:', error);
      this.notificationService.showError('Menü güncellenemedi');
    }
  }

  async deleteMenuItem(itemId: number) {
    if (!this.restaurant) return;

    try {
      const updatedMenu = this.restaurant.menu.filter(
        (item) => item.id !== itemId
      );
      await firstValueFrom(
        this.restaurantService.updateMenu(this.restaurant.id, updatedMenu)
      );

      this.restaurant.menu = updatedMenu;
      this.notificationService.showSuccess('Menü öğesi silindi');
    } catch (error) {
      console.error('Menü öğesi silme hatası:', error);
      this.notificationService.showError('Menü öğesi silinemedi');
    }
  }

  editMenuItem(item: MenuItem) {
    this.editingMenuItem = item;
    this.menuItemForm = { ...item };
    this.showMenuModal = true;
  }

  closeMenuModal() {
    this.showMenuModal = false;
    this.editingMenuItem = null;
    this.menuItemForm = {
      id: 0,
      name: '',
      price: 0,
      description: '',
      category: '',
      portion: '',
      quantity: 0,
    };
  }

  showSection(section: string) {
    this.activeSection = section;
  }

  logout() {
    this.restaurantOwnerService.logout();
    this.router.navigate(['/restaurant-login']);
    this.layoutService.showHeader();
  }

  private async calculateDailyStats() {
    try {
      const orders = await firstValueFrom(this.orderService.getOrders());
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter((order: Order) => {
        const orderDate = new Date(order.orderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      this.dailyOrders = todayOrders.length;
      this.dailyRevenue = todayOrders.reduce(
        (sum: number, order: Order) => sum + order.totalAmount,
        0
      );
    } catch (error) {
      console.error('Günlük istatistikler hesaplanırken hata:', error);
    }
  }
}
