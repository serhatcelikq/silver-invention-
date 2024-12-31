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
      .object<{ balance: number }>(`amountusers/${userId}`)
      .valueChanges()
      .pipe(map((data) => data?.balance || 0));
  }

  addBalance(userId: string, amount: number): Observable<void> {
    return new Observable((subscriber) => {
      // Önce mevcut bakiyeyi kontrol et
      this.db
        .object(`amountusers/${userId}`)
        .valueChanges()
        .pipe(take(1))
        .subscribe({
          next: (data: any) => {
            // Mevcut bakiye veya 0
            const currentBalance = data?.balance || 0;
            // Yeni bakiyeyi hesapla
            const newBalance = currentBalance + amount;

            // Firebase'de güncelle
            this.db
              .object(`amountusers/${userId}`)
              .update({
                balance: newBalance,
                lastUpdated: new Date().toISOString(),
              })
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
            console.error('Mevcut bakiye alınırken hata:', error);
            subscriber.error(error);
          },
        });
    });
  }

  removeBalance = this.deductBalance;

  deductBalance(userId: string, amount: number): Observable<void> {
    return new Observable((subscriber) => {
      this.getUserBalance(userId).subscribe(
        (currentBalance) => {
          if (currentBalance < amount) {
            subscriber.error(new Error('Yetersiz bakiye'));
            return;
          }

          const newBalance = currentBalance - amount;
          this.db
            .object(`amountusers/${userId}`)
            .update({
              balance: newBalance,
              lastUpdated: new Date().toISOString(),
            })
            .then(() => {
              subscriber.next();
              subscriber.complete();
            })
            .catch((error) => {
              subscriber.error(error);
            });
        },
        (error) => subscriber.error(error)
      );
    });
  }
}
