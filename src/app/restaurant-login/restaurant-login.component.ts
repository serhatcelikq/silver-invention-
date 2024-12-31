import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RestaurantService, Restaurant } from '../services/restaurant.service';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-restaurant-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="signin-container">
      <div class="signin-card">
        <h2>Restoran Girişi</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="Restoran email adresi"
            />
          </div>

          <div class="form-group">
            <label for="password">Şifre</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Şifre"
            />
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="!loginForm.valid">Giriş Yap</button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .signin-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        padding: 2rem;
      }

      .signin-card {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }

      h2 {
        color: #1a237e;
        text-align: center;
        margin-bottom: 2rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #666;
      }

      input {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
      }

      button {
        width: 100%;
        padding: 1rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      button:hover {
        background: #5a67d8;
      }

      button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .error-message {
        color: #dc2626;
        margin-bottom: 1rem;
        font-size: 0.9rem;
      }

      .auth-links {
        margin-top: 1.5rem;
        text-align: center;
      }

      .auth-links a {
        color: #667eea;
        text-decoration: none;
        font-size: 0.9rem;
      }

      .auth-links a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class RestaurantLoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private restaurantService: RestaurantService,
    private layoutService: LayoutService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Eğer zaten giriş yapılmışsa dashboard'a yönlendir
    const restaurantData = localStorage.getItem('currentRestaurant');
    if (restaurantData) {
      this.router.navigate(['/restaurant-panel/dashboard']);
    }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      try {
        const restaurant = await this.restaurantService.loginRestaurantOwner(
          email,
          password
        );

        if (restaurant) {
          // Doğru formatta kaydet
          const restaurantData = {
            ...restaurant,
            id: restaurant.id.toString().includes('restaurant')
              ? restaurant.id
              : `restaurant${restaurant.id}`,
          };

          localStorage.setItem(
            'currentRestaurant',
            JSON.stringify(restaurantData)
          );
          this.layoutService.hideHeader();

          // Direkt olarak dashboard'a yönlendir
          this.router.navigate(['/restaurant-panel/dashboard']);
        }
      } catch (error: any) {
        console.error('Giriş hatası:', error);
        this.errorMessage = error.message || 'Giriş yapılırken bir hata oluştu';
      }
    }
  }
}
