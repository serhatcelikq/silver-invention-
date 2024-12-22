import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { BalanceService } from './services/balance.service';
import { User } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  currentBalance: number = 0;
  currentUser: User | null = null;
  @ViewChild('adminDropdown') adminDropdown!: ElementRef;
  isAdminMenuOpen = false;

  constructor(
    private authService: AuthService,
    private balanceService: BalanceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.balanceService.balance$.subscribe({
      next: (balance) => {
        NgZone.assertInAngularZone();

        this.currentBalance = balance;
        this.cdr.markForCheck();
      },
    });

    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        const savedBalance = localStorage.getItem('userBalance');
        if (savedBalance) {
          const balance = Number(savedBalance);
          this.balanceService.updateBalance(balance);
        }
      }
      if (user && this.router.url === '/') {
        this.router.navigate(['/restaurant']);
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userName(): string {
    return this.currentUser?.name || '';
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  onLogout(): void {
    this.authService.logout();
  }

  onSearch(): void {
    console.log('Arama yapılıyor...');
  }

  toggleAdminMenu() {
    this.isAdminMenuOpen = !this.isAdminMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (
      this.adminDropdown &&
      !this.adminDropdown.nativeElement.contains(event.target)
    ) {
      this.isAdminMenuOpen = false;
    }
  }
}
