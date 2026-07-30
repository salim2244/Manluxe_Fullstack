import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ChangeDetectorRef } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product';
import { Cart } from '../../services/cart';

import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ProductCard } from '../../components/product-card/product-card';


@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    Header,
    Footer,
    ProductCard
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  private cdr = inject(ChangeDetectorRef);

  cart = inject(Cart);

  product: Product | null = null;
  relatedProducts: Product[] = [];

  loading = true;

  activeTab: 'description' | 'details' = 'description';

 selectedSize = '';

  addedToCart = false;


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = Number(params.get('id'));

      if (!id) {
        this.router.navigate(['/']);
        return;
      }

      this.loading = true;

      this.productService.getById(id).subscribe({

        next: (product) => {

          console.log("Product received:", product);

          this.product = product;

          // Reset selected size whenever a new product is opened
          this.selectedSize = '';

          this.loading = false;

          this.cdr.detectChanges();

          console.log("Loading =", this.loading);
          console.log("Product =", this.product);

          this.loadRelated(product);

        },

        error: (err) => {

          console.error(err);

          this.loading = false;

          this.router.navigate(['/']);

        }

      });

    });

  }

  private loadRelated(product: Product) {

    this.productService.getAll().subscribe({

      next: products => {

        this.relatedProducts = products
          .filter(p =>
            p.id !== product.id &&
            p.categoryName === product.categoryName &&
            p.active
          )
          .slice(0, 4);

      }

    });

  }

  get discountedPrice(): number {

    if (!this.product) return 0;

    return this.product.discount
      ? Math.round(this.product.price * (1 - this.product.discount / 100))
      : this.product.price;

  }

  get inStock(): boolean {

    return !!this.product &&
      this.product.active &&
      this.product.stock > 0;

  }
  get alreadyInCart(): boolean {
    if (!this.product) return false;

    // Reading items() ensures Angular reevaluates when cart changes
    this.cart.items();

    return this.cart.isInCart(this.product.id, this.selectedSize);
  };

  addToCart() {

    if (!this.product || !this.inStock) return;


    if (this.availableSizes.length && !this.selectedSize) {

      alert('Please select a size');
      return;

    }


    if (this.alreadyInCart) {

      this.router.navigate(['/cart']);
      return;

    }


    this.cart.add(
      this.product,
      this.selectedSize
    ).subscribe({
      error: (err) => {
        console.error('Add to cart error:', err);
      }
    });

  }
  goToCart() {

    this.router.navigate(['/cart']);

  }
  get availableSizes(): { id: number; size: string; stock: number }[] {

    return this.product?.sizes ?? [];

  }

}