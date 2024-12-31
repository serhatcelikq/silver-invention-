import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OrderService, Order } from '../services/order.service';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any;
  orders: Order[] = [];
  currentBalance: number = 0;
  amountToAdd: number = 0;
  maxAmount: number = 5000;
  private balanceSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.loadBalance();
        this.loadOrders();
      }
    });
  }

  async addBalance() {
    if (!this.user?.uid) {
      this.notificationService.showError('Kullanıcı bulunamadı');
      return;
    }

    if (this.amountToAdd <= 0) {
      this.notificationService.showError('Geçerli bir miktar giriniz');
      return;
    }

    if (this.amountToAdd > this.maxAmount) {
      this.notificationService.showError(
        `Maximum ${this.maxAmount}₺ yükleyebilirsiniz`
      );
      return;
    }

    try {
      await firstValueFrom(
        this.userService.addBalance(this.user.uid, this.amountToAdd)
      );
      this.notificationService.showSuccess(
        `${this.amountToAdd}₺ bakiye yüklendi`
      );
      this.amountToAdd = 0;
    } catch (error) {
      console.error('Bakiye yüklenirken hata:', error);
      this.notificationService.showError('Bakiye yüklenemedi');
    }
  }

  private loadBalance() {
    if (this.user) {
      this.balanceSubscription = this.userService
        .getUserBalance(this.user.uid)
        .subscribe({
          next: (balance) => {
            this.currentBalance = balance;
          },
          error: (error) => {
            console.error('Bakiye yüklenirken hata:', error);
            this.notificationService.showError('Bakiye bilgisi alınamadı');
          },
        });
    }
  }

  private async loadOrders() {
    if (this.user) {
      try {
        const orders = await firstValueFrom(this.orderService.getOrders());
        this.orders = orders.filter((order) => order.userId === this.user.uid);
      } catch (error) {
        console.error('Siparişler yüklenirken hata:', error);
      }
    }
  }

  ngOnDestroy() {
    if (this.balanceSubscription) {
      this.balanceSubscription.unsubscribe();
    }
  }
}
