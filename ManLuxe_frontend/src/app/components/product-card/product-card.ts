import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input() product!: Product;

  private router = inject(Router);

  /** Discounted price calculated from price + discount% */
  get discountedPrice(): number {
    if (!this.product.discount) return this.product.price;
    return Math.round(this.product.price * (1 - this.product.discount / 100));
  }

  get hasDiscount(): boolean {
    return this.product.discount > 0;
  }

  get inStock(): boolean {
    return this.product.stock > 0 && this.product.active;
  }

  openDetails() {
    this.router.navigate(['/product', this.product.id]);
  }

  quickAdd(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/product', this.product.id]);
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    alert('Wishlist feature coming soon.');
  }

  get stars(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
