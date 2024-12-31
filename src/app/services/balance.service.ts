import { Injectable } from '@angular/core';
import { AuthService, User } from './auth.service';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private balanceSubject = new BehaviorSubject<number>(0);
  balance$ = this.balanceSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadInitialBalance();
  }

  private loadInitialBalance() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      const balanceKey = `userBalance_${currentUser.uid}`;
      const savedBalance = localStorage.getItem(balanceKey);
      if (savedBalance) {
        this.balanceSubject.next(Number(savedBalance));
      }
    }
  }

  updateBalance(amount: number) {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      const balanceKey = `userBalance_${currentUser.uid}`;
      localStorage.setItem(balanceKey, amount.toString());
      this.balanceSubject.next(amount);
    }
  }

  getBalance(): Observable<number> {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      const balanceKey = `userBalance_${currentUser.uid}`;
      const savedBalance = localStorage.getItem(balanceKey);
      return of(savedBalance ? Number(savedBalance) : 0);
    }
    return of(0);
  }

  // Bakiye düş
  deductBalance(amount: number): Observable<void> {
    return new Observable((subscriber) => {
      const currentBalance = this.balanceSubject.value;
      if (currentBalance < amount) {
        subscriber.error('Yetersiz bakiye');
        return;
      }

      const newBalance = currentBalance - amount;
      this.updateBalance(newBalance);
      subscriber.next();
      subscriber.complete();
    });
  }

  // Bakiye ekle
  addBalance(amount: number): Observable<void> {
    return new Observable((subscriber) => {
      const newBalance = this.balanceSubject.value + amount;
      this.updateBalance(newBalance);
      subscriber.next();
      subscriber.complete();
    });
  }
}
