import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../services/order.service';
import { RestaurantService } from '../services/restaurant.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <h2>Admin Paneli</h2>
      </div>

      <div class="admin-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AdminComponent implements OnInit {
  constructor(
    private router: Router,
    private orderService: OrderService,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit() {
    // Sayfa yenilendiğinde dashboard'a yönlendir
    if (this.router.url === '/admin') {
      this.router.navigate(['/admin/dashboard']);
    }

    // Periyodik güncelleme için interval başlat
    setInterval(() => {
      this.orderService.refreshOrders();
      this.restaurantService.getRestaurants().subscribe();
    }, 5000); // Her 5 saniyede bir güncelle
  }
}
