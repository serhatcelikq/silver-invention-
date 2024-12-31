import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    return this.auth.user$.pipe(
      take(1),
      map(user => {
        if (user?.role === 'admin') {
          return true;
        }
        
        // Admin değilse signin sayfasına yönlendir
        this.router.navigate(['/signin']);
        return false;
      })
    );
  }
}
