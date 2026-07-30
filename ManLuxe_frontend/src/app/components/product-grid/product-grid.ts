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

  activeTab: 'all' | 'trending' | 'new' | 'featured' = 'all';
  activeSub = 'all';

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: data => {
        this.allProducts = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load products.';
        this.loading = false;
        console.error(err);
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
