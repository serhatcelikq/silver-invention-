import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="order-success-container">
      <div class="success-card">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Siparişiniz Başarıyla Oluşturuldu!</h2>
        <p>Siparişiniz başarılı bir şekilde alınmıştır.</p>

        <div class="action-buttons">
          <button class="view-orders-btn" (click)="goToProfile()">
            <i class="fas fa-list"></i>
            Siparişlerim
          </button>
          <button class="continue-btn" (click)="goToRestaurants()">
            <i class="fas fa-utensils"></i>
            Restoranlara Dön
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .order-success-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 80px);
        padding: 2rem;
        margin-top: 80px;
        background: #f8f9fa;
      }

      .success-card {
        background: white;
        padding: 3rem;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 90%;
      }

      .success-icon {
        font-size: 5rem;
        color: #22c55e;
        margin-bottom: 1.5rem;
      }

      h2 {
        color: #1a237e;
        margin-bottom: 1rem;
        font-size: 1.8rem;
      }

      p {
        color: #4b5563;
        margin-bottom: 2rem;
        font-size: 1.1rem;
      }

      .action-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      button {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
      }

      .view-orders-btn {
        background: #667eea;
        color: white;
      }

      .continue-btn {
        background: white;
        color: #4b5563;
        border: 1px solid #e5e7eb;
      }

      button:hover {
        transform: translateY(-2px);
      }

      .view-orders-btn:hover {
        background: #5a67d8;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }

      .continue-btn:hover {
        background: #f8f9fa;
        border-color: #d1d5db;
      }

      @media (max-width: 640px) {
        .action-buttons {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class OrderDetailsComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToRestaurants() {
    this.router.navigate(['/restaurant']);
  }
}

// Bileşeni dışa aktar
export default OrderDetailsComponent;
