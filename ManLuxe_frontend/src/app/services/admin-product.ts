import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Product, ProductRequest } from '../models/product';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/products`;

  private _products = signal<Product[]>([]);
  readonly products = this._products.asReadonly();

  readonly totalProducts = computed(() => this._products().length);
  readonly inStockCount = computed(() => this._products().filter(p => p.stock > 0 && p.active).length);
  readonly outOfStockCount = computed(() => this._products().filter(p => p.stock === 0 || !p.active).length);

  /** Load all products — call from admin ngOnInit */
  loadAll(): void {
    this.http.get<Product[]>(this.base).subscribe({
      next: data => this._products.set(data),
      error: err => console.error('Failed to load products', err)
    });
  }

  add(product: ProductRequest): void {
    this.http.post<Product>(this.base, product).subscribe({
      next: created => this._products.update(list => [created, ...list]),
      error: err => console.error('Failed to add product', err)
    });
  }

  update(id: number, changes: ProductRequest): void {
    this.http.put<Product>(`${this.base}/${id}`, changes).subscribe({
      next: updated => this._products.update(list => list.map(p => p.id === id ? updated : p)),
      error: err => console.error('Failed to update product', err)
    });
  }

  delete(id: number): void {
    this.http.delete(`${this.base}/${id}`).subscribe({
      next: () => this._products.update(list => list.filter(p => p.id !== id)),
      error: err => console.error('Failed to delete product', err)
    });
  }

  toggleActive(id: number): void {
    const current = this._products().find(p => p.id === id);
    if (!current) return;
    this.http.put<Product>(`${this.base}/${id}`, { ...current, active: !current.active }).subscribe({
      next: updated => this._products.update(list => list.map(p => p.id === id ? updated : p)),
      error: err => console.error('Failed to toggle active', err)
    });
  }
}
