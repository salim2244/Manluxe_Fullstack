import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
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
export class Header implements OnInit {
  @Input() searchQuery = '';
  @Input() activeCategory = 'all';
  @Output() searchChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();

  auth = inject(Auth);
  cart = inject(Cart);
  private router = inject(Router);

  isMenuOpen = false;
  showAuth = false;
  showUserMenu = false;

  categories = [
    { id: 'all',    label: 'All' },
    { id: 'mens',   label: "Men's" },
    { id: 'womens', label: "Women's" },
  ];

  ngOnInit() {}

  onSearch(value: string) {
    this.searchChange.emit(value);
  }

  selectCategory(id: string) {
    this.isMenuOpen = false;
    this.categoryChange.emit(id);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
    this.showUserMenu = false;
  }

  goToWishlist() {
    alert('Wishlist feature coming soon!');
    this.showUserMenu = false;
  }

  goToAccount() {
    alert('Account details feature coming soon!');
    this.showUserMenu = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.showUserMenu = false;
    this.auth.logout();
  }
}
