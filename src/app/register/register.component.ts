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

  onRegister(): void {
    if (!this.userName || !this.userEmail || !this.userPassword) {
      this.errorMessage = 'Lütfen tüm alanları doldurun!';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userEmail)) {
      this.errorMessage = 'Geçerli bir email adresi giriniz!';
      return;
    }

    if (this.userPassword.length < 6) {
      this.errorMessage = 'Şifre en az 6 karakter olmalıdır!';
      return;
    }

    const success = this.authService.register({
      name: this.userName,
      email: this.userEmail,
      password: this.userPassword,
      role: 'user',
    });

    if (success) {
      alert('Kayıt başarılı!');
      this.router.navigate(['/signin']);
    } else {
      this.errorMessage = 'Bu email adresi zaten kullanımda!';
    }
  }
}
