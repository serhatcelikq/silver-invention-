import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();

  constructor() {
    // Sayfa yüklendiğinde admin durumunu kontrol et
    this.checkAdminStatus();
  }

  checkAdminStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.isAdminSubject.next(currentUser?.role === 'admin');
  }

  isAdmin(): boolean {
    return this.isAdminSubject.value;
  }

  // Admin yetkisi gerektiren işlemler için metodlar
  addRestaurant(restaurant: any) {
    if (!this.isAdmin()) return;
    // Restoran ekleme işlemi
  }

  updateRestaurant(restaurant: any) {
    if (!this.isAdmin()) return;
    // Restoran güncelleme işlemi
  }

  deleteRestaurant(id: number) {
    if (!this.isAdmin()) return;
    // Restoran silme işlemi
  }

  getUsers() {
    if (!this.isAdmin()) return;
    // Kullanıcıları getirme işlemi
  }

  updateUser(user: any) {
    if (!this.isAdmin()) return;
    // Kullanıcı güncelleme işlemi
  }

  deleteUser(id: number) {
    if (!this.isAdmin()) return;
    // Kullanıcı silme işlemi
  }
}
