import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, from, take } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private db: AngularFireDatabase) {}

  getUsers(): Observable<User[]> {
    return this.db.list<User>('users').valueChanges();
  }

  updateUser(uid: string, data: Partial<User>): Observable<void> {
    return from(this.db.object(`users/${uid}`).update(data));
  }

  deleteUser(uid: string): Observable<void> {
    return from(this.db.object(`users/${uid}`).remove());
  }

  getUserBalance(userId: string): Observable<number> {
    return this.db
      .object<number>(`users/${userId}/balance`)
      .valueChanges()
      .pipe(map((balance) => balance || 0));
  }

  addBalance(userId: string, amount: number): Observable<void> {
    return new Observable((subscriber) => {
      this.getUserBalance(userId)
        .pipe(take(1))
        .subscribe({
          next: (currentBalance) => {
            const newBalance = currentBalance + amount;

            this.db
              .object(`users/${userId}/balance`)
              .set(newBalance)
              .then(() => {
                console.log('Bakiye eklendi. Yeni bakiye:', newBalance);
                subscriber.next();
                subscriber.complete();
              })
              .catch((error) => {
                console.error('Bakiye eklenirken hata:', error);
                subscriber.error(error);
              });
          },
          error: (error) => {
            subscriber.error(error);
          },
        });
    });
  }

  removeBalance = this.deductBalance;

  deductBalance(userId: string, amount: number): Observable<void> {
    return new Observable((subscriber) => {
      this.getUserBalance(userId)
        .pipe(take(1))
        .subscribe({
          next: (currentBalance) => {
            if (currentBalance < amount) {
              subscriber.error(new Error('Yetersiz bakiye'));
              return;
            }

            const newBalance = currentBalance - amount;

            this.db
              .object(`users/${userId}/balance`)
              .set(newBalance)
              .then(() => {
                console.log('Bakiye güncellendi. Yeni bakiye:', newBalance);
                subscriber.next();
                subscriber.complete();
              })
              .catch((error) => {
                console.error('Bakiye düşülürken hata:', error);
                subscriber.error(error);
              });
          },
          error: (error) => {
            subscriber.error(error);
          },
        });
    });
  }

  updateUserBalance(userId: string, amount: number): Observable<void> {
    return new Observable((subscriber) => {
      this.getUserBalance(userId)
        .pipe(take(1))
        .subscribe({
          next: (currentBalance) => {
            const newBalance = amount;

            this.db
              .object(`users/${userId}/balance`)
              .set(newBalance)
              .then(() => {
                console.log('Bakiye başarıyla güncellendi:', newBalance);
                subscriber.next();
                subscriber.complete();
              })
              .catch((error) => {
                console.error('Bakiye güncellenirken hata:', error);
                subscriber.error(error);
              });
          },
          error: (error) => {
            console.error('Bakiye bilgisi alınırken hata:', error);
            subscriber.error(error);
          },
        });
    });
  }
}
