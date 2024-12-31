import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../styles/auth.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
})
export class RegisterComponent {
  userName: string = '';
  userEmail: string = '';
  userPassword: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister() {
    if (!this.userName || !this.userEmail || !this.userPassword) {
      this.errorMessage = 'Lütfen tüm alanları doldurun!';
      return;
    }

    try {
      await this.authService.register(
        this.userEmail,
        this.userPassword,
        this.userName
      );

      // Başarılı kayıt sonrası direkt restaurant sayfasına yönlendir
      this.router.navigate(['/restaurant']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Kayıt sırasında bir hata oluştu!';
    }
  }
}
