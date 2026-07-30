import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order';
import { Order, OrderStatus } from '../../models/order';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class OrdersPage implements OnInit {
  orderService = inject(OrderService);

  orders: Order[] = [];
  loading = true;
  error = '';
  expandedOrders: Set<number> = new Set();

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.loadMyOrders();
    this.orders = this.orderService.orders();
    this.loading = false;
  }

  toggleOrderExpansion(orderId: number) {
    if (this.expandedOrders.has(orderId)) {
      this.expandedOrders.delete(orderId);
    } else {
      this.expandedOrders.add(orderId);
    }
  }

  isOrderExpanded(orderId: number): boolean {
    return this.expandedOrders.has(orderId);
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-700';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'PROCESSING':
        return '⚙️';
      case 'SHIPPED':
        return '🚚';
      case 'DELIVERED':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '📦';
    }
  }

  getStatusDescription(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Your order is pending confirmation';
      case 'PROCESSING':
        return 'Your order is being prepared';
      case 'SHIPPED':
        return 'Your order is on the way';
      case 'DELIVERED':
        return 'Your order has been delivered';
      case 'CANCELLED':
        return 'Your order has been cancelled';
      default:
        return 'Order status unknown';
    }
  }

  getEstimatedDelivery(status: OrderStatus, orderDate: string): string {
    if (status === 'DELIVERED') return 'Delivered';
    if (status === 'CANCELLED') return 'Cancelled';
    
    const order = new Date(orderDate);
    const now = new Date();
    const daysSinceOrder = Math.floor((now.getTime() - order.getTime()) / (1000 * 60 * 60 * 24));
    
    if (status === 'PENDING') {
      return `Est. delivery: ${3 - daysSinceOrder} days`;
    } else if (status === 'PROCESSING') {
      return `Est. delivery: ${2 - daysSinceOrder} days`;
    } else if (status === 'SHIPPED') {
      return `Est. delivery: ${1 - daysSinceOrder} days`;
    }
    
    return 'Est. delivery: 3-5 days';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getOrderTotal(order: Order): number {
    return order.totalAmount || order.totalPrice || 0;
  }

  getTrackingSteps(status: OrderStatus): { step: string; completed: boolean; icon: string }[] {
    const steps = [
      { step: 'Order Placed', completed: true, icon: '📝' },
      { step: 'Processing', completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status), icon: '⚙️' },
      { step: 'Shipped', completed: ['SHIPPED', 'DELIVERED'].includes(status), icon: '🚚' },
      { step: 'Delivered', completed: status === 'DELIVERED', icon: '✅' }
    ];

    if (status === 'CANCELLED') {
      return [
        { step: 'Order Placed', completed: true, icon: '📝' },
        { step: 'Cancelled', completed: true, icon: '❌' }
      ];
    }

    return steps;
  }

  canCancelOrder(status: OrderStatus): boolean {
    return status === 'PENDING';
  }
}
