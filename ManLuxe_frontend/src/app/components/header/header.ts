import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Cart } from '../../services/cart';
import { AuthModal } from '../auth-modal/auth-modal';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, AuthModal],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  @Input() searchQuery = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();

  auth = inject(Auth);
  cart = inject(Cart);
  private router = inject(Router);

  isMenuOpen = false;
  showAuth = false;
  showUserMenu = false;
  activeCategory = 'all';

  categories = [
    { id: 'all',    label: 'All' },
    { id: 'mens',   label: "Men's" },
    { id: 'womens', label: "Women's" },
  ];

  onSearch(value: string) {
    this.searchChange.emit(value);
  }

  selectCategory(id: string) {
    this.activeCategory = id;
    this.isMenuOpen = false;

    const isHome = this.router.url === '/' || this.router.url.startsWith('/?');
    if (isHome) {
      // Already on home — just emit so the grid filters in place
      this.categoryChange.emit(id);
    } else {
      // On another page — navigate to home with category query param
      this.router.navigate(['/'], { queryParams: { category: id } });
    }
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
    this.showUserMenu = false;
  }

  goToWishlist() {
    // Wishlist feature coming soon
    alert('Wishlist feature coming soon!');
    this.showUserMenu = false;
  }

  goToAccount() {
    // Account details feature coming soon
    alert('Account details feature coming soon!');
    this.showUserMenu = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.auth.logout();
    this.showUserMenu = false;
  }
}
