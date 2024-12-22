import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BalanceService } from '../services/balance.service';

interface Order {
  id: number;
  restaurantName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  orderDate: Date;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  orders: Order[] = [];
  currentBalance: number = 0;

  constructor(
    private authService: AuthService,
    private balanceService: BalanceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;

    this.balanceService.balance$.subscribe((balance) => {
      this.currentBalance = balance;
    });

    const savedBalance = localStorage.getItem('userBalance');
    if (savedBalance) {
      this.currentBalance = Number(savedBalance);
    }

    if (this.user) {
      const savedOrders = localStorage.getItem(`orders_${this.user.id}`);
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders).map((order: any) => ({
          ...order,
          orderDate: new Date(order.orderDate),
        }));
      }
    }
  }

  navigateToBalance() {
    this.router.navigate(['/balance']);
  }
}
