import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restaurant-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Restoran Kaydı</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="restaurantName">Restoran Adı</label>
            <input
              type="text"
              id="restaurantName"
              formControlName="restaurantName"
              placeholder="Restoran adı"
            />
          </div>

          <div class="form-group">
            <label for="name">Yetkili Adı</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              placeholder="Ad Soyad"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="Email adresiniz"
            />
          </div>

          <div class="form-group">
            <label for="password">Şifre</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Şifreniz"
            />
          </div>

          <div class="form-group">
            <label for="phone">Telefon</label>
            <input
              type="tel"
              id="phone"
              formControlName="phone"
              placeholder="Telefon numarası"
            />
          </div>

          <button type="submit" [disabled]="!registerForm.valid">
            Kayıt Ol
          </button>

          <div class="auth-links">
            <a routerLink="/restaurant-login"
              >Zaten hesabınız var mı? Giriş yapın</a
            >
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    /* Aynı CSS stilleri kullanılacak */
  ],
})
export class RestaurantRegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      restaurantName: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
      // Kayıt işlemleri burada yapılacak
      this.router.navigate(['/restaurant-login']);
    }
  }
}
