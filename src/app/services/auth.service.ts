import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { RestaurantService } from './restaurant.service';
import { UserService } from './user.service';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private router: Router,
    private restaurantService: RestaurantService,
    private userService: UserService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.initializeAdmin();
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  register(user: Omit<User, 'id'>): boolean {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

    if (users.some((u) => u.email === user.email)) {
      return false;
    }

    const newUser: User = {
      id: users.length + 1,
      ...user,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Yeni kullanıcı için bakiye oluştur
    const balanceKey = `userBalance_${newUser.id}`;
    localStorage.setItem(balanceKey, '0'); // Başlangıç bakiyesi 0

    return true;
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);

      this.userService.saveUserData(user);

      if (user.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/restaurant']);
      }
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.restaurantService.clearLocalStorage(); // Çıkış yaparken de temizle
    this.currentUserSubject.next(null);
    this.router.navigate(['/signin']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  initializeAdmin() {
    const users = this.getUsers();
    const adminExists = users.some((user) => user.role === 'admin');

    if (!adminExists) {
      const admin: User = {
        id: 1,
        name: 'Admin',
        email: 'admin@yemek23.com',
        password: 'admin123',
        role: 'admin',
      };

      users.push(admin);
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  getUsers(): User[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  getAllUsers(): any[] {
    // Örnek kullanıcı listesi - gerçek uygulamada API'den gelecek
    return [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      },
      {
        id: 2,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      },
      {
        id: 3,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
      },
      // ... diğer kullanıcılar
    ];
  }

  deleteUser(userId: number): void {
    let users = this.getUsers();
    users = users.filter((user) => user.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
  }

  updateUser(updatedUser: User): void {
    let users = this.getUsers();
    const index = users.findIndex((user) => user.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  resetPassword(
    username: string,
    email: string,
    newPassword: string
  ): Observable<boolean> {
    console.log('Şifre sıfırlama parametreleri:', {
      username,
      email,
      newPassword,
    }); // Debug için

    let users = this.getUsers();
    console.log('Mevcut kullanıcılar:', users); // Debug için

    const userIndex = users.findIndex(
      (u) =>
        u.name.toLowerCase() === username.toLowerCase() &&
        u.email.toLowerCase() === email.toLowerCase()
    );

    if (userIndex === -1) {
      console.log('Kullanıcı bulunamadı'); // Debug için
      return throwError(() => new Error('Kullanıcı bulunamadı!'));
    }

    // Kullanıcının şifresini güncelle
    users[userIndex].password = newPassword;

    // Kullanıcılar listesini localStorage'da güncelle
    localStorage.setItem('users', JSON.stringify(users));

    console.log('Şifre güncellendi:', users[userIndex]); // Debug için

    // Eğer giriş yapmış kullanıcının şifresi değiştiyse, oturumu güncelle
    const currentUser = this.currentUserValue;
    if (currentUser && currentUser.id === users[userIndex].id) {
      localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
      this.currentUserSubject.next(users[userIndex]);
    }

    return of(true);
  }
}
