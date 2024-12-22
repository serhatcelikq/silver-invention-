import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-form">
        <h2>{{ showForgotPassword ? 'Şifre Yenileme' : 'Giriş Yap' }}</h2>

        <!-- Normal Giriş Formu -->
        <div *ngIf="!showForgotPassword">
          <div class="form-group">
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="E-posta adresiniz"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Şifreniz"
              required
              class="form-control"
            />
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" (click)="onSubmit()" class="auth-btn">
            Giriş Yap
          </button>

          <div class="auth-links">
            <a (click)="toggleForgotPassword()" class="forgot-password-link">
              Şifremi Unuttum
            </a>
            <a routerLink="/register" class="register-link">
              Hesabınız yok mu? Kaydolun.
            </a>
          </div>

          <!-- Admin giriş bilgileri -->
          <div class="admin-info">
            <p class="admin-note">Admin Girişi için:</p>
            <p>Email: admin&#64;yemek23.com</p>
            <p>Şifre: admin123</p>
          </div>
        </div>

        <!-- Şifre Sıfırlama Formu -->
        <div *ngIf="showForgotPassword" class="forgot-password-form">
          <div class="form-group">
            <input
              type="text"
              [(ngModel)]="resetUsername"
              name="resetUsername"
              placeholder="Kullanıcı adınız"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <input
              type="email"
              [(ngModel)]="resetEmail"
              name="resetEmail"
              placeholder="E-posta adresiniz"
              required
              class="form-control"
            />
          </div>

          <div *ngIf="!showNewPasswordInput">
            <button (click)="searchUser()" class="auth-btn">Ara</button>
          </div>

          <div *ngIf="showNewPasswordInput" class="form-group">
            <input
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              placeholder="Yeni şifreniz"
              required
              class="form-control"
            />
            <button (click)="resetPassword()" class="auth-btn">
              Şifreyi Güncelle
            </button>
          </div>

          <button (click)="toggleForgotPassword()" class="back-btn">
            Giriş Sayfasına Dön
          </button>

          <div
            *ngIf="resetMessage"
            [class]="resetSuccess ? 'success-message' : 'error-message'"
          >
            {{ resetMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../styles/auth.css'],
})
export class SigninComponent {
  @ViewChild('loginForm') loginForm!: NgForm; // Form referansını ekle

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  // Şifre sıfırlama için
  showForgotPassword: boolean = false;
  resetUsername: string = '';
  resetEmail: string = '';
  newPassword: string = '';
  showNewPasswordInput: boolean = false;
  resetMessage: string = '';
  resetSuccess: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.email && this.password) {
      const success = this.authService.login(this.email, this.password);
      if (!success) {
        this.errorMessage = 'Email veya şifre hatalı!';
      }
    }
  }

  toggleForgotPassword() {
    this.showForgotPassword = !this.showForgotPassword;
    this.resetForm();
  }

  searchUser() {
    if (this.resetUsername && this.resetEmail) {
      const users = this.authService.getUsers();
      console.log('Bulunan kullanıcılar:', users); // Debug için

      const user = users.find((u) => {
        console.log('Karşılaştırma:', {
          userName: u.name.toLowerCase(),
          resetUsername: this.resetUsername.toLowerCase(),
          userEmail: u.email.toLowerCase(),
          resetEmail: this.resetEmail.toLowerCase(),
        }); // Debug için

        return (
          u.name.toLowerCase() === this.resetUsername.toLowerCase() &&
          u.email.toLowerCase() === this.resetEmail.toLowerCase()
        );
      });

      if (user) {
        this.showNewPasswordInput = true;
        this.resetMessage = 'Kullanıcı bulundu. Yeni şifrenizi girebilirsiniz.';
        this.resetSuccess = true;
      } else {
        this.resetMessage = 'Kullanıcı bulunamadı!';
        this.resetSuccess = false;
      }
    }
  }

  resetPassword() {
    if (this.newPassword) {
      console.log('Şifre güncelleme isteği:', {
        username: this.resetUsername,
        email: this.resetEmail,
        newPassword: this.newPassword,
      });

      this.authService
        .resetPassword(this.resetUsername, this.resetEmail, this.newPassword)
        .subscribe({
          next: () => {
            this.resetMessage = 'Şifreniz başarıyla güncellendi!';
            this.resetSuccess = true;
            setTimeout(() => {
              this.showForgotPassword = false;
              this.resetForm();
              this.router.navigate(['/signin']);
            }, 2000);
          },
          error: (error) => {
            console.error('Şifre güncelleme hatası:', error);
            this.resetMessage = error.message;
            this.resetSuccess = false;
          },
        });
    }
  }

  private resetForm() {
    this.resetUsername = '';
    this.resetEmail = '';
    this.newPassword = '';
    this.showNewPasswordInput = false;
    this.resetMessage = '';
  }
}
