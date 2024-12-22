import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, delay, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from './notification.service';

export interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  portion: string;
  quantity: number;
}

export interface Restaurant {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  category: string;
  products: string[];
  address: string;
  phone: string;
  url: string;
  isFavorite: boolean;
  menu: MenuItem[];
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private jsonUrl = './assets/data/restaurants.json';
  private DELETED_IDS_KEY = 'deletedRestaurantIds';
  private RESTAURANTS_KEY = 'restaurants';
  private deletedRestaurantIds: Set<number>;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    // Silinen ID'leri yükle
    this.deletedRestaurantIds = new Set(this.getDeletedRestaurantIds());
    // İlk veri yüklemesi
    this.initializeData();
  }

  private getDeletedRestaurantIds(): number[] {
    const deletedIds = localStorage.getItem(this.DELETED_IDS_KEY);
    return deletedIds ? JSON.parse(deletedIds) : [];
  }

  private initializeData(): void {
    // JSON'dan verileri al ve silinen ID'leri filtrele
    this.http
      .get<{ restaurants: Restaurant[] }>(this.jsonUrl)
      .subscribe((response) => {
        const filteredRestaurants = response.restaurants.filter(
          (r: Restaurant) => !this.deletedRestaurantIds.has(r.id)
        );
        this.saveToStorage(filteredRestaurants);
      });
  }

  private saveToStorage(restaurants: Restaurant[]): void {
    localStorage.setItem(this.RESTAURANTS_KEY, JSON.stringify({ restaurants }));
  }

  getRestaurants(): Observable<Restaurant[]> {
    return new Observable<Restaurant[]>((observer) => {
      // Önce kalıcı veriyi kontrol et
      const permanentData = localStorage.getItem('permanentRestaurants');

      if (permanentData) {
        try {
          const data = JSON.parse(permanentData);
          const filteredRestaurants = data.restaurants.filter(
            (r: Restaurant) => !this.deletedRestaurantIds.has(r.id)
          );
          observer.next(filteredRestaurants);
          observer.complete();
        } catch (error) {
          // Kalıcı veri bozuksa JSON'dan yükle
          this.loadFromJson(observer);
        }
      } else {
        // Kalıcı veri yoksa JSON'dan yükle
        this.loadFromJson(observer);
      }
    });
  }

  private loadFromJson(observer: any): void {
    this.http.get<{ restaurants: Restaurant[] }>(this.jsonUrl).subscribe({
      next: (response) => {
        const filteredRestaurants = response.restaurants.filter(
          (r: Restaurant) => !this.deletedRestaurantIds.has(r.id)
        );
        this.persistRestaurants(filteredRestaurants);
        observer.next(filteredRestaurants);
        observer.complete();
      },
      error: (error) => observer.error(error),
    });
  }

  getRestaurantById(id: number): Observable<Restaurant | undefined> {
    return this.getRestaurants().pipe(
      map((restaurants) => restaurants.find((r) => r.id === id))
    );
  }

  updateRestaurant(restaurant: Restaurant): Observable<Restaurant> {
    return new Observable<Restaurant>((observer) => {
      try {
        // Önce JSON dosyasından tüm restoranları al
        this.http.get<{ restaurants: Restaurant[] }>(this.jsonUrl).subscribe({
          next: (response) => {
            let allRestaurants = response.restaurants;

            // Güncellenecek restoranı bul
            const index = allRestaurants.findIndex(
              (r: Restaurant) => r.id === restaurant.id
            );

            if (index !== -1) {
              // Restoranı güncelle
              allRestaurants[index] = restaurant;

              // Silinen restoranları filtrele
              const filteredRestaurants = allRestaurants.filter(
                (r: Restaurant) => !this.deletedRestaurantIds.has(r.id)
              );

              // Güncellenmiş listeyi localStorage'a kaydet
              this.persistRestaurants(filteredRestaurants);

              // Başarılı mesajı gönder
              this.notificationService.showSuccess(
                'Restoran bilgileri başarıyla güncellendi'
              );
              observer.next(restaurant);
              observer.complete();
            } else {
              throw new Error('Restoran bulunamadı');
            }
          },
          error: (error) => {
            this.notificationService.showError(
              'Restoran güncellenirken bir hata oluştu'
            );
            observer.error(error);
          },
        });
      } catch (error) {
        this.notificationService.showError(
          'Restoran güncellenirken bir hata oluştu'
        );
        observer.error(error);
      }
    }).pipe(delay(500));
  }

  deleteRestaurant(id: number): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      try {
        // ID'yi silinen listesine ekle
        this.deletedRestaurantIds.add(id);
        localStorage.setItem(
          this.DELETED_IDS_KEY,
          JSON.stringify(Array.from(this.deletedRestaurantIds))
        );

        // Mevcut restoranları güncelle
        const storedData = localStorage.getItem(this.RESTAURANTS_KEY);
        if (storedData) {
          const data = JSON.parse(storedData);
          const filteredRestaurants = data.restaurants.filter(
            (r: Restaurant) => r.id !== id
          );
          this.saveToStorage(filteredRestaurants);

          // JSON dosyasını da güncelle (simüle edilmiş)
          this.http
            .get<{ restaurants: Restaurant[] }>(this.jsonUrl)
            .subscribe((response) => {
              const updatedRestaurants = response.restaurants.filter(
                (r: Restaurant) => !this.deletedRestaurantIds.has(r.id)
              );
              this.saveToStorage(updatedRestaurants);
            });
        }

        this.notificationService.showSuccess('Restoran başarıyla silindi');
        observer.next(true);
        observer.complete();
      } catch (error) {
        this.notificationService.showError(
          'Restoran silinirken bir hata oluştu'
        );
        observer.error(error);
      }
    }).pipe(delay(500));
  }

  addRestaurant(restaurant: Omit<Restaurant, 'id'>): Observable<Restaurant> {
    return new Observable<Restaurant>((observer) => {
      this.getRestaurants().subscribe((restaurants) => {
        const newRestaurant = {
          ...restaurant,
          id: this.generateNewId(restaurants),
          isFavorite: false,
        } as Restaurant;

        const updatedRestaurants = [...restaurants, newRestaurant];

        // JSON dosyasını güncelle
        this.saveToJson(updatedRestaurants).subscribe(
          () => {
            observer.next(newRestaurant);
            this.notificationService.showSuccess(
              'Yeni restoran başarıyla eklendi'
            );
            observer.complete();
          },
          (error) => {
            observer.error(error);
            this.notificationService.showError(
              'Restoran eklenirken bir hata oluştu'
            );
          }
        );
      });
    });
  }

  private generateNewId(restaurants: Restaurant[]): number {
    return restaurants.length > 0
      ? Math.max(...restaurants.map((r) => r.id)) + 1
      : 1;
  }

  private saveToJson(restaurants: Restaurant[]): Observable<any> {
    const data = { restaurants };
    localStorage.setItem('restaurants', JSON.stringify(data));
    return of(true).pipe(delay(500));
  }

  // Oturum açma/kapama işlemleri için
  clearLocalStorage() {
    localStorage.removeItem(this.RESTAURANTS_KEY);
    // Silinen ID'leri KORUYORUZ
  }

  // Tam sıfırlama için (test amaçlı)
  resetAllData() {
    localStorage.removeItem(this.RESTAURANTS_KEY);
    localStorage.removeItem(this.DELETED_IDS_KEY);
    this.deletedRestaurantIds.clear();
    this.initializeData();
  }

  // Yeni metod: Restoranları kalıcı olarak kaydet
  private persistRestaurants(restaurants: Restaurant[]): void {
    // localStorage'a kaydet
    this.saveToStorage(restaurants);

    // Kalıcı veri olarak JSON benzeri bir yapıda sakla
    const permanentData = {
      restaurants: restaurants,
      lastUpdate: new Date().toISOString(),
    };

    localStorage.setItem('permanentRestaurants', JSON.stringify(permanentData));

    // Silinen ID'leri güncelle
    localStorage.setItem(
      this.DELETED_IDS_KEY,
      JSON.stringify(Array.from(this.deletedRestaurantIds))
    );
  }
}
