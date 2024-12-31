import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Restaurant } from './restaurant.service';

export interface RestaurantOwner {
  id?: string;
  name: string;
  email: string;
  phone: string;
  restaurantId: string;
  restaurantName: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantOwnerService {
  private currentOwnerSubject = new BehaviorSubject<RestaurantOwner | null>(
    null
  );
  currentOwner$ = this.currentOwnerSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedOwner = localStorage.getItem('restaurantOwner');
    if (savedOwner) {
      this.currentOwnerSubject.next(JSON.parse(savedOwner));
    }
  }

  getCurrentOwner(): RestaurantOwner | null {
    return this.currentOwnerSubject.value;
  }

  login(email: string, password: string): Observable<RestaurantOwner> {
    return this.http
      .get<{ restaurants: Restaurant[] }>('assets/data/restaurants.json')
      .pipe(
        map((response) => {
          const restaurant = response.restaurants.find(
            (r) => r.owner?.email === email && r.owner?.password === password
          );

          if (restaurant?.owner) {
            const owner: RestaurantOwner = {
              id: restaurant.owner.id || undefined,
              name: restaurant.owner.name,
              email: restaurant.owner.email,
              phone: restaurant.owner.phone,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              isActive: true,
            };

            localStorage.setItem('restaurantOwner', JSON.stringify(owner));
            this.currentOwnerSubject.next(owner);
            return owner;
          }

          throw new Error('Geçersiz email veya şifre');
        })
      );
  }

  logout() {
    localStorage.removeItem('restaurantOwner');
    this.currentOwnerSubject.next(null);
  }
}
