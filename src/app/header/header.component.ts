import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <nav class="navbar">
        <!-- Ana Sayfa ve Giriş Linkleri -->
        <ng-container *ngIf="!isBusinessHeader && !isLoggedIn">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Ana Sayfa
          </a>
          <a routerLink="/signin" routerLinkActive="active">Giriş Yap</a>
          <a routerLink="/register" routerLinkActive="active">Üye Ol</a>
          <a (click)="toggleHeader()" class="business-link">
            <i class="fas fa-store"></i>
            İşletme Girişi
          </a>
        </ng-container>

        <!-- İşletme Header -->
        <ng-container *ngIf="isBusinessHeader">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Ana Sayfa
          </a>
          <a routerLink="/restaurant-login" routerLinkActive="active"
            >İşletme Girişi</a
          >
          <a (click)="toggleHeader()" class="business-link">
            <i class="fas fa-user"></i>
            Müşteri Girişi
          </a>
        </ng-container>

        <!-- Giriş Yapmış Kullanıcı -->
        <ng-container *ngIf="!isBusinessHeader && isLoggedIn">
          <a routerLink="/restaurant" routerLinkActive="active">Restoranlar</a>
          <a routerLink="/profile" routerLinkActive="active">Profilim</a>
          <a routerLink="/favorites" routerLinkActive="active">Favorilerim</a>
          <a (click)="logout()" class="logout-btn">Çıkış</a>
        </ng-container>
      </nav>
    </header>
  `,
  styles: [
    `
      .header {
        background: white;
        padding: 1rem 2rem;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .navbar {
        display: flex;
        justify-content: center;
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .navbar a {
        color: #333;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .navbar a:hover {
        background: #f5f5f5;
        color: #1a237e;
      }

      .navbar a.active {
        background: #1a237e;
        color: white;
      }

      .business-link {
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white !important;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .business-link:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }

      .logout-btn {
        background: #ef5350;
        color: white !important;
      }

      .logout-btn:hover {
        background: #e53935 !important;
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  isBusinessHeader = false;
  isLoggedIn = false;

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });
  }

  ngOnInit() {
    // LocalStorage'dan business header durumunu kontrol et
    const businessHeader = localStorage.getItem('businessHeader');
    this.isBusinessHeader = businessHeader === 'true';
  }

  toggleHeader() {
    this.isBusinessHeader = !this.isBusinessHeader;
    // LocalStorage'a business header durumunu kaydet
    localStorage.setItem('businessHeader', this.isBusinessHeader.toString());
  }

  logout() {
    this.authService.logout();
  }
}
