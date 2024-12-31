import { Injectable, ErrorHandler } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private notificationService: NotificationService) {}

  handleError(error: any) {
    console.error('Bir hata oluştu:', error);

    let errorMessage = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';

    if (error.status === 404) {
      errorMessage = 'İstenen sayfa bulunamadı.';
    } else if (error.status === 403) {
      errorMessage = 'Bu işlem için yetkiniz bulunmamaktadır.';
    } else if (error.status === 401) {
      errorMessage = 'Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.';
    }

    this.notificationService.showError(errorMessage);
  }
}
