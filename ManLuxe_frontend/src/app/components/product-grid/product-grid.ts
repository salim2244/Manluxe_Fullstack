import { Component, Input, OnInit, OnChanges, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../product-card/product-card';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css'
})
export class ProductGrid implements OnInit, OnChanges {
  @Input() searchQuery = '';
  @Input() category = 'all';
  @Output() categorySelect = new EventEmitter<string>();

  private productService = inject(ProductService);

  allProducts: Product[] = [];
  loading = false;
  error = '';
  retryCount = 0;
  maxRetries = 3;
  slowLoading = false;   // true after 5s — shows "waking up server" hint

  activeTab: 'all' | 'trending' | 'new' | 'featured' = 'all';
  activeSub = 'all';

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.slowLoading = false;

    // After 5 seconds show a "server waking up" hint (Render cold start)
    const slowTimer = setTimeout(() => {
      if (this.loading) this.slowLoading = true;
    }, 5000);

    this.productService.getAll().subscribe({
      next: data => {
        clearTimeout(slowTimer);
        this.allProducts = data;
        this.loading = false;
        this.slowLoading = false;
        this.retryCount = 0;
      },
      error: err => {
        clearTimeout(slowTimer);
        this.loading = false;
        this.slowLoading = false;
        console.error(err);

        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          // Exponential back-off: 3s, 6s, 12s
          const delay = 3000 * this.retryCount;
          this.error = `Connecting to server… retrying (${this.retryCount}/${this.maxRetries})`;
          setTimeout(() => this.loadProducts(), delay);
        } else {
          this.error = 'Unable to load products. Please refresh the page.';
        }
      }
    });
  }

  get subcategories(): string[] {

      let base = this.allProducts.filter(p => p.active);

      if (this.category === 'mens') {
        base = base.filter(p => p.gender === 'MEN');
      } else if (this.category === 'womens') {
        base = base.filter(p => p.gender === 'WOMEN');
      }

      const subs = [...new Set(base.map(p => p.categoryName))];

      return ['all', ...subs];
    }

  get filteredProducts(): Product[] {
    let list = this.allProducts.filter(p => p.active);

    if (this.category === 'mens') {
      list = list.filter(p => p.gender === 'MEN');
    } else if (this.category === 'womens') {
      list = list.filter(p => p.gender === 'WOMEN');
    }

    if (this.activeSub !== 'all') {
      list = list.filter(
        p => p.categoryName.toLowerCase() === this.activeSub.toLowerCase()
      );
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    return list;
  }

  get trendingProducts(): Product[] {
    return this.allProducts.filter(p => p.active && p.discount > 0).slice(0, 4);
  }

  get mensProducts(): Product[] {
  return this.allProducts
    .filter(p => p.active && p.gender === 'MEN')
    .slice(0, 8);
}

  get womensProducts(): Product[] {
  return this.allProducts
    .filter(p => p.active && p.gender === 'WOMEN')
    .slice(0, 8);
}

  get sectionTitle(): string {
    if (this.searchQuery) return `Results for "${this.searchQuery}"`;
    if (this.category === 'mens') return "Men's Collection";
    if (this.category === 'womens') return "Women's Collection";
    return 'All Products';
  }

  ngOnChanges() {
    this.activeSub = 'all';
    this.activeTab = 'all';
  }

  setTab(tab: 'all' | 'trending' | 'new' | 'featured') {
    this.activeTab = tab;
    this.activeSub = 'all';
  }
}
