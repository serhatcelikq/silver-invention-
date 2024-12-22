import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class AdminProfileComponent implements OnInit {
  admin: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.admin = this.authService.currentUserValue;
  }
}
