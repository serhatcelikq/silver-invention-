import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RestaurantAdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    return this.auth.user$.pipe(
      take(1),
      map((user) => {
        if (user && this.auth.isRestaurantAdmin(user)) return true;

        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
