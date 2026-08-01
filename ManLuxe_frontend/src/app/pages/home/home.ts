import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private router = inject(Router);

  searchQuery = '';
  category = 'all';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.category = params['category'] || 'all';

      if (params['category']) {
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

    // Replace URL so category switches don't stack browser history
    this.router.navigate(['/'], {
      queryParams: cat === 'all' ? {} : { category: cat },
      replaceUrl: true
    });

    if (cat !== 'all') {
      setTimeout(() => {
        const el = document.getElementById('product-grid-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }
}
