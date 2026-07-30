import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Auth } from '../../services/auth';
import { Cart } from '../../services/cart';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  auth    = inject(Auth);
  router  = inject(Router);
  route   = inject(ActivatedRoute);
  toaster = inject(ToastService);
  cart    = inject(Cart);

  email        = '';
  password     = '';
  showPassword = false;
  loading      = false;
  error        = '';

  submit() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
  this.loading = false;

  console.log('Role:', this.auth.role());
  console.log('Is Admin:', this.auth.isAdmin());

  this.toaster.success('Welcome back!', 'Good to see you again.');

  // Sync local cart to backend after login
  this.cart.syncLocalCartToBackend();

  // Get returnUrl from query params or default to appropriate page
  const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  if (this.auth.isAdmin()) {
    console.log('Navigating to admin');
    this.router.navigateByUrl('/admin');
  } else if (returnUrl && returnUrl !== '/') {
    console.log('Navigating to return URL:', returnUrl);
    this.router.navigateByUrl(returnUrl);
  } else {
    console.log('Navigating to home');
    this.router.navigateByUrl('/');
  }
},
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid email or password.';
        this.toaster.error('Login failed', this.error);
      }
    });
  }
}
