import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { RegisterComponent } from './register/register.component';
import { IndexComponent } from './index/index.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { FavoriteRestaurantsComponent } from './favorite-restaurants/favorite-restaurants.component';
import { OrderComponent } from './order/order.component';
import { BalanceComponent } from './balance/balance.component';
import { authGuard } from './guards/auth.guard';
import { AdminComponent } from './admin/admin.component';
import { adminGuard } from './guards/admin.guard';
import { AdminDashboardComponent } from './admin/components/admin-dashboard/admin-dashboard.component';
import { AdminRestaurantsComponent } from './admin/components/admin-restaurants/admin-restaurants.component';
import { AdminUsersComponent } from './admin/components/admin-users/admin-users.component';
import { AdminCategoriesComponent } from './admin/components/admin-categories/admin-categories.component';
import { AdminOrdersComponent } from './admin/components/admin-orders/admin-orders.component';
import { OrderDetailsComponent } from './order/order-details.component';
import { UsersComponent } from './users/users.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index.component').then((m) => m.IndexComponent),
  },
  {
    path: 'signin',
    loadComponent: () =>
      import('./signin/signin.component').then((m) => m.SigninComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'restaurant',
    loadComponent: () =>
      import('./restaurant/restaurant.component').then(
        (m) => m.RestaurantComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'favorite',
    loadComponent: () =>
      import('./favorite-restaurants/favorite-restaurants.component').then(
        (m) => m.FavoriteRestaurantsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'order/:id',
    loadComponent: () =>
      import('./order/order.component').then((m) => m.OrderComponent),
    canActivate: [authGuard],
  },
  {
    path: 'balance',
    loadComponent: () =>
      import('./balance/balance.component').then((m) => m.BalanceComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'restaurants', component: AdminRestaurantsComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'orders', component: AdminOrdersComponent },
    ],
  },
  {
    path: 'order-details',
    loadComponent: () =>
      import('./order/order-details.component').then((m) => m.default),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
    canActivate: [authGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // HttpClientModule burada olmamalı
  exports: [RouterModule],
})
export class AppRoutingModule {}
