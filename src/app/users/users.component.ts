import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.users = this.authService.getUsers();
  }

  editUser(user: any) {
    this.selectedUser = { ...user };
  }

  deleteUser(user: any) {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      this.authService.deleteUser(user.id);
      this.loadUsers();
    }
  }

  updateUser() {
    if (this.selectedUser) {
      this.authService.updateUser(this.selectedUser);
      this.loadUsers();
      this.closeModal();
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
