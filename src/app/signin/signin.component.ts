import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  resetUsername: string = '';
  resetEmail: string = '';
  newPassword: string = '';
  showForgotPassword: boolean = false;
  showNewPasswordInput: boolean = false;
  resetMessage: string = '';
  resetSuccess: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.authService.user$.subscribe((user) => {
      if (user) {
        // Kullanıcı rolüne göre yönlendirme
        switch (user.role) {
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          case 'restaurant':
            this.router.navigate(['/restaurant-admin']);
            break;
          default:
            // Normal kullanıcılar için direkt restoran sayfasına yönlendir
            this.router.navigate(['/restaurant']);
            break;
        }
      }
    });
  }

  async onSubmit() {
    try {
      await this.authService.login(this.email, this.password);
      this.notificationService.showSuccess('Giriş başarılı');

      const user = await this.authService.getCurrentUser();
      if (user) {
        switch (user.role) {
          case 'admin':
            await this.router.navigate(['/admin']);
            break;
          case 'restaurant':
            await this.router.navigate(['/restaurant-admin']);
            break;
          default:
            await this.router.navigate(['/restaurant']);
            break;
        }
      }
    } catch (error: any) {
      console.error('Giriş yapılırken hata:', error);

      // Firebase hata kodlarına göre özel mesajlar
      switch (error.code) {
        case 'auth/wrong-password':
          this.errorMessage = 'Şifre yanlış!';
          break;
        case 'auth/user-not-found':
          this.errorMessage =
            'Bu email adresi ile kayıtlı kullanıcı bulunamadı!';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Geçersiz email adresi!';
          break;
        case 'auth/too-many-requests':
          this.errorMessage =
            'Çok fazla başarısız giriş denemesi yaptınız. Lütfen daha sonra tekrar deneyin.';
          break;
        default:
          this.errorMessage =
            'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
      }

      this.notificationService.showError(this.errorMessage);
    }
  }

  async searchUser() {
    try {
      const users = await firstValueFrom(this.authService.getUsers());
      const user = users.find(
        (u) =>
          u.displayName === this.resetUsername && u.email === this.resetEmail
      );

      if (user) {
        this.showNewPasswordInput = true;
        this.resetMessage = 'Kullanıcı bulundu. Yeni şifrenizi girebilirsiniz.';
        this.resetSuccess = true;
      } else {
        this.resetMessage = 'Kullanıcı bulunamadı!';
        this.resetSuccess = false;
      }
    } catch (error) {
      this.resetMessage = 'Bir hata oluştu!';
      this.resetSuccess = false;
    }
  }

  async resetPassword() {
    if (this.newPassword) {
      try {
        await this.authService.resetPassword(
          this.resetUsername,
          this.resetEmail,
          this.newPassword
        );

        this.resetMessage = 'Şifreniz başarıyla güncellendi!';
        this.resetSuccess = true;

        setTimeout(() => {
          this.showForgotPassword = false;
          this.resetForm();
          this.router.navigate(['/signin']);
        }, 2000);
      } catch (error: any) {
        this.resetMessage =
          error.message || 'Şifre güncelleme işlemi başarısız oldu';
        this.resetSuccess = false;
      }
    } else {
      this.resetMessage = 'Lütfen yeni şifrenizi girin';
      this.resetSuccess = false;
    }
  }

  toggleForgotPassword() {
    this.showForgotPassword = !this.showForgotPassword;
    if (!this.showForgotPassword) {
      this.resetForm();
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
