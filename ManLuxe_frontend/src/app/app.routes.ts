import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { CartPage } from './pages/cart/cart';
import { ProductDetails } from './pages/product-details/product-details';
import { Checkout } from './pages/checkout/checkout';
import { OrdersPage } from './pages/orders/orders';
import { Admin } from './pages/admin/admin';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '',            component: Home },
  { path: 'login',       component: Login },
  { path: 'signup',      component: Signup },
  { path: 'cart',        component: CartPage },
  { path: 'product/:id', component: ProductDetails },
  { path: 'checkout',    component: Checkout,  canActivate: [authGuard] },
  { path: 'orders',      component: OrdersPage, canActivate: [authGuard] },
  { path: 'admin',       component: Admin,      },
  { path: '**',          redirectTo: '' }
];
