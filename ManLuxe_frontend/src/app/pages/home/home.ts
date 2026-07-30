import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Header } from '../../components/header/header';
import { Hero } from '../../components/hero/hero';
import { Footer } from '../../components/footer/footer';
import { ProductGrid } from '../../components/product-grid/product-grid';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Header, Hero, ProductGrid, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private route = inject(ActivatedRoute);

  searchQuery = '';
  category = 'all';

  ngOnInit() {
    // Read category from query param (e.g. navigated from cart/checkout header)
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.category = params['category'];
        // Scroll to product grid after a tick
        setTimeout(() => {
          const el = document.getElementById('product-grid-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
  }

  onCategoryChange(cat: string) {
    this.category = cat;
    setTimeout(() => {
      const el = document.getElementById('product-grid-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
}
