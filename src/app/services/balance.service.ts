import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NgZone } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private balanceSubject = new BehaviorSubject<number>(0);
  balance$ = this.balanceSubject.asObservable();

  constructor(private ngZone: NgZone, private authService: AuthService) {
    this.loadBalance();
  }

  private loadBalance() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      // Kullanıcıya özel bakiye anahtarı
      const balanceKey = `userBalance_${currentUser.id}`;
      const savedBalance = localStorage.getItem(balanceKey);
      if (savedBalance) {
        const balance = Number(savedBalance);
        this.balanceSubject.next(balance);
      }
    }
  }

  updateBalance(amount: number): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.ngZone.run(() => {
        // Kullanıcıya özel bakiye anahtarı
        const balanceKey = `userBalance_${currentUser.id}`;
        localStorage.setItem(balanceKey, amount.toString());
        this.balanceSubject.next(amount);
      });
    }
  }

  getBalance(): number {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      // Kullanıcıya özel bakiye anahtarı
      const balanceKey = `userBalance_${currentUser.id}`;
      const savedBalance = localStorage.getItem(balanceKey);
      return savedBalance ? Number(savedBalance) : 0;
    }
    return 0;
  }

  // Kullanıcı çıkış yaptığında bakiyeyi sıfırla
  clearBalance(): void {
    this.balanceSubject.next(0);
  }
}
