import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RestaurantAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const restaurantOwner = localStorage.getItem('restaurantOwner');
    if (restaurantOwner) {
      return true;
    }

    this.router.navigate(['/restaurant-login']);
    return false;
  }
}
