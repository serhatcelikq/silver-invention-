import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  selectedUser: User | null = null;
  private usersSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  loadUsers() {
    this.usersSubscription = this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Kullanıcılar yüklenirken hata:', error);
        this.notificationService.showError('Kullanıcılar yüklenemedi');
      },
    });
  }

  editUser(user: User) {
    this.selectedUser = { ...user };
  }

  async saveUser() {
    if (!this.selectedUser) return;

    try {
      await this.userService
        .updateUser(this.selectedUser.uid, {
          name: this.selectedUser.name,
          displayName: this.selectedUser.displayName,
          email: this.selectedUser.email,
          role: this.selectedUser.role,
          isActive: this.selectedUser.isActive,
        })
        .toPromise();

      this.notificationService.showSuccess('Kullanıcı başarıyla güncellendi');
      this.closeModal();
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
      this.notificationService.showError('Kullanıcı güncellenemedi');
    }
  }

  async deleteUser(user: User) {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu kullanıcı kalıcı olarak silinecek!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#dc3545',
    });

    if (result.isConfirmed) {
      try {
        await this.userService.deleteUser(user.uid).toPromise();
        this.notificationService.showSuccess('Kullanıcı başarıyla silindi');
      } catch (error) {
        console.error('Kullanıcı silinirken hata:', error);
        this.notificationService.showError('Kullanıcı silinemedi');
      }
    }
  }

  closeModal() {
    this.selectedUser = null;
  }
}
