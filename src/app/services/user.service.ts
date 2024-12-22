import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './auth.service';
import { OrderService } from './order.service';

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  registrationDate: string;
  favorites: number[]; // Favori restoran ID'leri
  orders: any[]; // Sipariş geçmişi
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USERS_KEY = 'registeredUsers';
  private readonly USER_DATA_KEY = 'userData';
  private usersSubject = new BehaviorSubject<UserData[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private orderService: OrderService) {
    this.loadUsers();
  }

  private loadUsers() {
    const savedUsers = localStorage.getItem(this.USERS_KEY);
    if (savedUsers) {
      this.usersSubject.next(JSON.parse(savedUsers));
    }
  }

  saveUserData(user: User) {
    const users = this.getUsers();
    const existingUserIndex = users.findIndex((u) => u.email === user.email);

    const userData: UserData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: new Date().toISOString(),
      registrationDate: new Date().toISOString(),
      favorites: [],
      orders: [],
    };

    if (existingUserIndex === -1) {
      // Yeni kullanıcı
      users.push(userData);
    } else {
      // Mevcut kullanıcı
      users[existingUserIndex] = {
        ...users[existingUserIndex],
        lastLogin: new Date().toISOString(),
      };
    }

    this.saveUsers(users);
  }

  private saveUsers(users: UserData[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    this.usersSubject.next(users);
  }

  getUsers(): UserData[] {
    const savedUsers = localStorage.getItem(this.USERS_KEY);
    return savedUsers ? JSON.parse(savedUsers) : [];
  }

  getUserByEmail(email: string): UserData | undefined {
    return this.getUsers().find((u) => u.email === email);
  }

  updateUserData(email: string, data: Partial<UserData>) {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...data };
      this.saveUsers(users);
      return true;
    }
    return false;
  }

  addFavoriteRestaurant(email: string, restaurantId: number) {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex !== -1) {
      if (!users[userIndex].favorites.includes(restaurantId)) {
        users[userIndex].favorites.push(restaurantId);
        this.saveUsers(users);
      }
    }
  }

  removeFavoriteRestaurant(email: string, restaurantId: number) {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex !== -1) {
      users[userIndex].favorites = users[userIndex].favorites.filter(
        (id) => id !== restaurantId
      );
      this.saveUsers(users);
    }
  }

  addOrder(email: string, order: any) {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex !== -1) {
      if (!users[userIndex].orders) {
        users[userIndex].orders = [];
      }
      users[userIndex].orders.push({
        ...order,
        orderDate: new Date().toISOString(),
      });
      this.saveUsers(users);
    }
  }

  getUserOrders(email: string): any[] {
    const user = this.getUserByEmail(email);
    return user?.orders || [];
  }

  clearUserData() {
    localStorage.removeItem(this.USERS_KEY);
    this.usersSubject.next([]);
  }

  updateUser(userId: number, updatedUser: any) {
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex !== -1) {
        const oldUser = users[userIndex];
        users[userIndex] = { ...oldUser, ...updatedUser };

        // LocalStorage'ı güncelle
        localStorage.setItem('users', JSON.stringify(users));

        // Eğer kullanıcı adı değiştiyse, siparişlerdeki kullanıcı adını da güncelle
        if (oldUser.name !== updatedUser.name) {
          this.orderService.updateOrdersUserName(userId, updatedUser.name);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      return false;
    }
  }
}
