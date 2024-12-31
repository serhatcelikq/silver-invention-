import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.users = await firstValueFrom(this.authService.getUsers());
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  }

  editUser(user: User) {
    this.selectedUser = { ...user };
  }

  async deleteUser(user: User) {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await this.authService.updateUser({ ...user, isActive: false });
        await this.loadUsers();
      } catch (error) {
        console.error('Kullanıcı silinirken hata:', error);
      }
    }
  }

  async updateUser() {
    if (this.selectedUser) {
      try {
        await this.authService.updateUser(this.selectedUser);
        await this.loadUsers();
        this.closeModal();
      } catch (error) {
        console.error('Kullanıcı güncellenirken hata:', error);
      }
    }
  }

  closeModal(event?: Event) {
    if (event) {
      const target = event.target as HTMLElement;
      if (target.className === 'modal' || target.className === 'cancel-btn') {
        this.selectedUser = null;
      }
    } else {
      this.selectedUser = null;
    }
  }
}
