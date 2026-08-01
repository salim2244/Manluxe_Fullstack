import { Component } from '@angular/core';
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
export class Home {
  searchQuery = '';
  category = 'all';

  onSearchChange(value: string) {
    this.searchQuery = value;
  }

  onCategoryChange(cat: string) {
    this.category = cat;

    if (cat !== 'all') {
      setTimeout(() => {
        const el = document.getElementById('product-grid-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }
}
