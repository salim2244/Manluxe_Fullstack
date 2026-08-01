import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
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
  @Output() searchChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();

  auth = inject(Auth);
  cart = inject(Cart);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isMenuOpen = false;
  showAuth = false;
  showUserMenu = false;
  activeCategory = 'all';

  categories = [
    { id: 'all',    label: 'All' },
    { id: 'mens',   label: "Men's" },
    { id: 'womens', label: "Women's" },
  ];

  ngOnInit() {
    this.updateActiveCategoryFromRoute();

    this.route.queryParams.subscribe(() => {
      this.updateActiveCategoryFromRoute();
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveCategoryFromRoute();
      });
  }

  private updateActiveCategoryFromRoute() {
    const category = this.route.snapshot.queryParamMap.get('category');
    this.activeCategory = category || 'all';
  }

  onSearch(value: string) {
    this.searchChange.emit(value);
  }

  selectCategory(id: string) {
    this.activeCategory = id;
    this.isMenuOpen = false;

    this.router.navigate(['/'], {
      queryParams: id === 'all' ? {} : { category: id },
      replaceUrl: true
    });

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
    this.showUserMenu = false;
    this.auth.logout();
  }
}
