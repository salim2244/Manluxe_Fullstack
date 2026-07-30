import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Cart as CartService } from '../../services/cart';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartPage {
  cartService = inject(CartService);
  auth = inject(Auth);
  router = inject(Router);

  get items() { return this.cartService.items(); }
  get total() { return this.cartService.totalPrice(); }
  get count() { return this.cartService.totalItems(); }

  updateQty(id: string, qty: number) {
    this.cartService.updateQty(id, qty);
  }

  remove(id: string) {
    this.cartService.remove(id);
  }

  proceedToCheckout() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/checkout']);
    } else {
      // Redirect to login with return URL
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    }
  }
}
