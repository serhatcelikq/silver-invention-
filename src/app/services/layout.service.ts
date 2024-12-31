import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private showHeaderSubject = new BehaviorSubject<boolean>(true);
  showHeader$ = this.showHeaderSubject.asObservable();

  constructor() {
    // Başlangıçta header'ı göster
    this.showHeader();
  }

  hideHeader() {
    this.showHeaderSubject.next(false);
  }

  showHeader() {
    this.showHeaderSubject.next(true);
  }
}
