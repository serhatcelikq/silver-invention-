import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BalanceService } from '../services/balance.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class BalanceComponent implements OnInit {
  currentBalance: number = 0;
  depositAmount: number = 0;
  showSuccess: boolean = false;
  errorMessage: string = '';

  constructor(private balanceService: BalanceService) {}

  ngOnInit() {
    this.balanceService.balance$.subscribe((balance) => {
      this.currentBalance = balance;
    });
  }

  deposit() {
    if (this.depositAmount <= 0) {
      this.errorMessage = 'Lütfen geçerli bir miktar girin';
      return;
    }

    if (this.depositAmount > 5000) {
      this.errorMessage = "Maksimum yükleme tutarı 5000 TL'dir";
      return;
    }

    const newBalance = this.currentBalance + this.depositAmount;
    this.balanceService.updateBalance(newBalance);

    this.showSuccess = true;
    this.errorMessage = '';
    this.depositAmount = 0;

    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }
}
