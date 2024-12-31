import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  activeSection: string = 'dashboard';

  constructor(
    private router: Router,
    private authService: AuthService,
    private layoutService: LayoutService
  ) {}

  ngOnInit() {
    // Admin sayfasında header'ı gizle
    this.layoutService.hideHeader();
  }

  ngOnDestroy() {
    // Component destroy olduğunda header'ı tekrar göster
    this.layoutService.showHeader();
  }

  showSection(section: string) {
    this.activeSection = section;
    if (section === 'users') {
      this.router.navigate(['/admin/users']);
    } else if (section === 'dashboard') {
      this.router.navigate(['/admin/dashboard']);
    } else if (section === 'restaurants') {
      this.router.navigate(['/admin/restaurants']);
    } else if (section === 'orders') {
      this.router.navigate(['/admin/orders']);
    }
  }

  logout() {
    this.authService.logout();
    this.layoutService.showHeader(); // Çıkış yaparken header'ı göster
    this.router.navigate(['/signin']);
  }
}
