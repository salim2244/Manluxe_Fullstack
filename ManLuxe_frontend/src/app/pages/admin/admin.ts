import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { OrderService } from '../../services/order';
import { AdminProductService } from '../../services/admin-product';
import { Product, ProductRequest } from '../../models/product';
import { Order, OrderStatus } from '../../models/order';
import { CategoryService } from '../../services/category';
import { ImageUploadService } from '../../services/image-upload';


export type AdminView = 'dashboard' | 'orders' | 'customers' | 'products' | 'add-product' | 'edit-product';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  auth = inject(Auth);
  orderService = inject(OrderService);
  productService = inject(AdminProductService);
  private router = inject(Router);
  categoryService = inject(CategoryService);
  activeView = signal<AdminView>('dashboard');
  sidebarOpen = signal(true);
  private imageService = inject(ImageUploadService);

uploading = false;

  ngOnInit() {
    this.orderService.loadAll();
    this.productService.loadAll();
    this.categoryService.loadAll();
  }
  get categories() {
    return this.categoryService.categories();
  }

  // Orders
  orderSearch = '';
  orderStatusFilter: OrderStatus | 'all' = 'all';
  selectedOrder: Order | null = null;

  get filteredOrders() {
    return this.orderService.orders().filter(o => {
      const q = this.orderSearch.toLowerCase();
      const matchSearch = !q || String(o.id).includes(q) ||
        o.userName.toLowerCase().includes(q) || o.userEmail.toLowerCase().includes(q);
      const matchStatus = this.orderStatusFilter === 'all' || o.status === this.orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }

  updateOrderStatus(orderId: number, status: string) {
    this.orderService.updateStatus(orderId, status as OrderStatus);
  }

  // Customers
  customerSearch = '';

  get customers() {
    const map = new Map<number, { id: number; name: string; email: string; orders: number; spent: number }>();
    for (const o of this.orderService.orders()) {
      const ex = map.get(o.userId);
      if (ex) {
        ex.orders++;
        if (o.status !== 'CANCELLED') ex.spent += o.totalAmount;
      } else {
        map.set(o.userId, {
          id: o.userId, name: o.userName, email: o.userEmail,
          orders: 1, spent: o.status !== 'CANCELLED' ? o.totalAmount : 0
        });
      }
    }
    const q = this.customerSearch.toLowerCase();
    return Array.from(map.values()).filter(c =>
      !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }

  // Products
  productSearch = '';
  productCategoryFilter = 'all';

  get filteredProducts() {
    const q = this.productSearch.toLowerCase();
    return this.productService.products().filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      const matchCat = this.productCategoryFilter === 'all' ||
        p.categoryName.toLowerCase().includes(this.productCategoryFilter.toLowerCase());
      return matchSearch && matchCat;
    });
  }

  deleteProduct(id: number) {
    if (confirm('Delete this product?')) this.productService.delete(id);
  }

  toggleActive(id: number) { this.productService.toggleActive(id); }

  // Product Form
  editingProductId: number | null = null;
  productForm: ProductRequest = this.emptyForm();

  emptyForm(): ProductRequest {
    return {
      name: '',
      brand: '',
      description: '',
      price: 0,
      discount: 0,
      stock: 0,
      imageUrl: '',
      active: true,
      gender: 'MEN',
      categoryId: 0,

      sizeType: 'FREE',
      sizes: []
    };
  }

  openAddProduct() {
    this.editingProductId = null;
    
    this.productForm = this.emptyForm();

      this.productForm.sizes.push({
        size: '',
        stock: 0
      });
    this.activeView.set('add-product');
  }

  openEditProduct(product: Product) {

  this.editingProductId = product.id;

    this.productForm = {
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      discount: product.discount,
      stock: product.stock,
      imageUrl: product.imageUrl,
      active: product.active,
      gender: product.gender,
      categoryId: product.categoryId,

      sizeType: product.sizeType,
      sizes: product.sizes ?? []
  };

  this.activeView.set('edit-product');
}

  saveProduct() {

  if (this.editingProductId !== null) {

    this.productService.update(
      this.editingProductId,
      this.productForm
    );

  } else {

    this.productService.add(this.productForm);

  }

  setTimeout(() => {
    this.productService.loadAll();
  }, 500);

  this.activeView.set('products');
}

  cancelForm() { this.activeView.set('products'); }

      addSize() {
      this.productForm.sizes.push({
        size: '',
        stock: 0
      });
    }

    removeSize(index: number) {
      this.productForm.sizes.splice(index, 1);
    }

    getTotalStock(): number {
      return this.productForm.sizes.reduce((total, size) => {
        return total + Number(size.stock);
      }, 0);
    }

  uploadImage(event: Event) {

  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];
  if (file.size > 20 * 1024 * 1024) {
     alert('Image must be smaller than 20MB');
    return;
   }

  this.uploading = true;

  this.imageService.upload(file).subscribe({

    next: (response) => {
      this.productForm.imageUrl = response.imageUrl;
      this.uploading = false;
    },

    error: (err) => {
      console.error(err);
      alert('Image upload failed');
      this.uploading = false;
    }

  });

}

  // Dashboard
  get recentOrders() {
    return [...this.orderService.orders()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  get totalRevenue() { return this.orderService.totalRevenue(); }
  get totalOrders() { return this.orderService.orders().length; }
  get totalCustomers() { return this.customers.length; }
  get totalProducts() { return this.productService.totalProducts(); }

  // Helpers
  statusColor(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING: 'badge-pending', PROCESSING: 'badge-processing',
      SHIPPED: 'badge-shipped', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled'
    };
    return map[status] ?? '';
  }

  formatCurrency(n: number) { return 'Rs.' + n.toLocaleString('en-IN'); }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  logout() { this.auth.logout(); this.router.navigate(['/']); }

  navigate(view: AdminView) { this.activeView.set(view); this.selectedOrder = null; }
}
