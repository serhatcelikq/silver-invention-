import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { RegisterComponent } from './register/register.component';
import { IndexComponent } from './index/index.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { FavoriteRestaurantsComponent } from './favorite-restaurants/favorite-restaurants.component';
import { OrderComponent } from './order/order.component';
import { BalanceComponent } from './balance/balance.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminDashboardComponent } from './admin/components/admin-dashboard/admin-dashboard.component';
import { AdminRestaurantsComponent } from './admin/components/admin-restaurants/admin-restaurants.component';
import { AdminOrdersComponent } from './admin/components/admin-orders/admin-orders.component';
import { OrderDetailsComponent } from './order/order-details.component';
import { UsersComponent } from './users/users.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { RestaurantAuthGuard } from './guards/restaurant-auth.guard';
import { RestaurantPanelComponent } from './restaurant-panel/restaurant-panel.component';
import { DashboardComponent } from './restaurant-panel/dashboard/dashboard.component';

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
    canActivate: [AuthGuard],
  },
  {
    path: 'favorite',
    loadComponent: () =>
      import('./favorite-restaurants/favorite-restaurants.component').then(
        (m) => m.FavoriteRestaurantsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'order/:id',
    loadComponent: () =>
      import('./order/order.component').then((m) => m.OrderComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'balance',
    loadComponent: () =>
      import('./balance/balance.component').then((m) => m.BalanceComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin.component').then((m) => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './admin/components/admin-dashboard/admin-dashboard.component'
          ).then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/components/admin-users/admin-users.component').then(
            (m) => m.AdminUsersComponent
          ),
      },
      {
        path: 'restaurants',
        loadComponent: () =>
          import(
            './admin/components/admin-restaurants/admin-restaurants.component'
          ).then((m) => m.AdminRestaurantsComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./admin/components/admin-orders/admin-orders.component').then(
            (m) => m.AdminOrdersComponent
          ),
      },
    ],
  },
  {
    path: 'order-details',
    loadComponent: () =>
      import('./order/order-details.component').then((m) => m.default),
    canActivate: [AuthGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'restaurant-login',
    loadComponent: () =>
      import('./restaurant-login/restaurant-login.component').then(
        (m) => m.RestaurantLoginComponent
      ),
  },
  {
    path: 'restaurant-register',
    loadComponent: () =>
      import('./restaurant-register/restaurant-register.component').then(
        (m) => m.RestaurantRegisterComponent
      ),
  },
  {
    path: 'restaurant-admin',
    loadComponent: () =>
      import('./restaurant-admin/restaurant-admin.component').then(
        (m) => m.RestaurantAdminComponent
      ),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./favorites/favorites.component').then(
        (m) => m.FavoritesComponent
      ),
  },
  {
    path: 'restaurant-panel',
    component: RestaurantPanelComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./restaurant-panel/menu/menu.component').then(
            (m) => m.MenuComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./restaurant-panel/orders/orders.component').then(
            (m) => m.OrdersComponent
          ),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./restaurant-panel/employees/employees.component').then(
            (m) => m.EmployeesComponent
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
