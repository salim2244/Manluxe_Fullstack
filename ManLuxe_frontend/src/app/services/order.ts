import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Order, OrderStatus } from '../models/order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/orders`;

  private _orders = signal<Order[]>([]);
  readonly orders = this._orders.asReadonly();

  readonly totalRevenue = computed(() =>
    this._orders()
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  );

  readonly pendingCount = computed(() =>
    this._orders().filter(o => o.status === 'PENDING').length
  );

  readonly deliveredCount = computed(() =>
    this._orders().filter(o => o.status === 'DELIVERED').length
  );

  /** Load all orders — call from admin ngOnInit */
  loadAll(): void {
    this.http.get<Order[]>(this.base).subscribe({
      next: data => this._orders.set(data),
      error: err => console.error('Failed to load orders', err)
    });
  }

  /** Load current user's orders */
  loadMyOrders(): void {
    this.http.get<Order[]>(`${this.base}/my-orders`).subscribe({
      next: data => this._orders.set(data),
      error: err => console.error('Failed to load my orders', err)
    });
  }

  /** Checkout — creates order from cart on backend */
  checkout() {
    return this.http.post<Order>(`${this.base}/checkout`, {});
  }

  /** Admin: update order status via PUT /{id}/status?status=SHIPPED */
  updateStatus(orderId: number, status: OrderStatus): void {
    this.http
      .put<Order>(`${this.base}/${orderId}/status`, null, { params: { status } })
      .subscribe({
        next: updated =>
          this._orders.update(list =>
            list.map(o => o.id === orderId ? updated : o)
          ),
        error: err => console.error('Failed to update status', err)
      });
  }
}
