import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, BehaviorSubject, from, firstValueFrom } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  role?: 'user' | 'admin' | 'restaurant';
  photoURL?: string;
  isActive?: boolean;
  password?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  user$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  getUsers(): Observable<User[]> {
    return this.db
      .list<User>('users')
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            ...(c.payload.val() as User),
            uid: c.payload.key as string,
          }))
        )
      );
  }

  getUserData(uid: string): Observable<User | null> {
    return this.db
      .object(`users/${uid}`)
      .valueChanges()
      .pipe(
        map((user: any) => {
          if (!user) return null;
          return {
            ...user,
            uid,
            isActive: user.isActive !== false,
          } as User;
        })
      );
  }

  updateUser(userData: Partial<User>): Observable<void> {
    if (!userData.uid) {
      throw new Error('Kullanıcı ID gerekli');
    }

    const updateData = {
      ...(userData.name && { name: userData.name }),
      ...(userData.email && { email: userData.email }),
      ...(userData.role && { role: userData.role }),
      ...(userData.photoURL && { photoURL: userData.photoURL }),
      ...(userData.displayName && { displayName: userData.displayName }),
      ...(userData.phone && { phone: userData.phone }),
      ...(typeof userData.isActive !== 'undefined' && {
        isActive: userData.isActive,
      }),
      updatedAt: new Date().toISOString(),
    };

    return from(this.db.object(`users/${userData.uid}`).update(updateData));
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const credential = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      if (credential.user) {
        const userData = await this.getUserData(credential.user.uid)
          .pipe(take(1))
          .toPromise();
        if (userData) {
          this.currentUserSubject.next(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<void> {
    const credential = await this.auth.createUserWithEmailAndPassword(
      email,
      password
    );
    if (credential.user) {
      const userData: User = {
        uid: credential.user.uid,
        email,
        name: displayName,
        displayName,
        role: 'user',
        isActive: true,
      };
      await this.db.object(`users/${credential.user.uid}`).set(userData);
    }
  }

  private async initializeAuthState() {
    this.auth.authState.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        this.getUserData(firebaseUser.uid)
          .pipe(take(1))
          .subscribe((userData) => {
            if (userData) {
              this.currentUserSubject.next(userData);
            }
          });
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/signin']);
  }

  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = await this.auth.currentUser;
    if (!firebaseUser) return null;

    try {
      const userData = await firstValueFrom(this.getUserData(firebaseUser.uid));
      return userData || null;
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
      return null;
    }
  }

  async resetPassword(
    username: string,
    email: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const userSnapshot = await this.db
        .list('users', (ref) => ref.orderByChild('email').equalTo(email))
        .query.once('value');

      const userData = userSnapshot.val();
      if (!userData) throw new Error('Kullanıcı bulunamadı');

      const userId = Object.keys(userData)[0];
      const user = userData[userId];

      if (user.displayName !== username) {
        throw new Error('Kullanıcı adı eşleşmiyor');
      }

      const firebaseUser = await this.auth.currentUser;
      if (firebaseUser) {
        await firebaseUser.updatePassword(newPassword);
      }

      await this.db.object(`users/${userId}`).update({
        password: newPassword,
        updatedAt: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      throw error;
    }
  }

  deleteUser(uid: string): Observable<void> {
    return from(
      this.db
        .object(`users/${uid}`)
        .update({
          isActive: false,
          deletedAt: new Date().toISOString(),
        })
        .then(async () => {
          if (this.currentUserValue?.uid === uid) {
            await this.logout();
          }
        })
        .catch((error) => {
          console.error('Kullanıcı silinirken hata:', error);
          throw error;
        })
    );
  }
}
