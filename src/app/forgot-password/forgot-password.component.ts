import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <h2>Şifre Yenileme</h2>
        <div class="form-group">
          <label>Kullanıcı Adı</label>
          <input
            type="text"
            [(ngModel)]="username"
            placeholder="Kullanıcı adınız"
          />
        </div>
        <div class="form-group">
          <label>E-posta</label>
          <input
            type="email"
            [(ngModel)]="email"
            placeholder="E-posta adresiniz"
          />
        </div>
        <div class="form-group">
          <label>Yeni Şifre</label>
          <input
            type="password"
            [(ngModel)]="newPassword"
            placeholder="Yeni şifreniz"
          />
        </div>
        <button (click)="resetPassword()" [disabled]="!isFormValid">
          Şifreyi Güncelle
        </button>
        <div class="message" *ngIf="message" [class.error]="isError">
          {{ message }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .forgot-password-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #f8fafc;
        padding: 1rem;
      }

      .forgot-password-card {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }

      h2 {
        text-align: center;
        color: #1a237e;
        margin-bottom: 2rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #4b5563;
      }

      input {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid #e2e8f0;
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

      button:hover:not(:disabled) {
        background: #5a67d8;
        transform: translateY(-2px);
      }

      button:disabled {
        background: #cbd5e0;
        cursor: not-allowed;
      }

      .message {
        margin-top: 1rem;
        padding: 0.8rem;
        border-radius: 8px;
        text-align: center;
      }

      .message.error {
        background: #fee2e2;
        color: #dc2626;
      }

      .message:not(.error) {
        background: #dcfce7;
        color: #16a34a;
      }
    `,
  ],
})
export class ForgotPasswordComponent {
  username: string = '';
  email: string = '';
  newPassword: string = '';
  message: string = '';
  isError: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  get isFormValid(): boolean {
    return Boolean(this.username && this.email && this.newPassword);
  }

  resetPassword(): void {
    if (this.isFormValid) {
      this.authService
        .resetPassword(this.username, this.email, this.newPassword)
        .subscribe({
          next: () => {
            this.message = 'Şifreniz başarıyla güncellendi!';
            this.isError = false;
            setTimeout(() => {
              this.router.navigate(['/signin']);
            }, 2000);
          },
          error: (error: Error) => {
            this.message = error.message || 'Bir hata oluştu!';
            this.isError = true;
          },
        });
    }
  }
}
