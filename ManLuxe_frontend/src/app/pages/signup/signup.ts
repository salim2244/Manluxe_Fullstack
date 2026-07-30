import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Auth } from '../../services/auth';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  auth = inject(Auth);
  router = inject(Router);
  toaster = inject(ToastService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirm = false;

  agreeTerms = false;

  loading = false;
  success = false;

  errors: Record<string, string> = {};

  banner: {
    type: 'success' | 'error',
    title: string,
    message: string
  } | null = null;

  perks = [
  {
    icon: '🎁',
    text: 'Exclusive member discounts & early access'
  },
  {
    icon: '🚚',
    text: 'Free shipping on your first order'
  },
  {
    icon: '❤️',
    text: 'Save favourites to your wishlist'
  },
  {
    icon: '📦',
    text: 'Easy order tracking & returns'
  }
];

private readonly EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;

isValidEmail(): boolean {
  return this.EMAIL_REGEX.test(this.email.trim());
}

  /**
   * General email validation - accepts any valid email format
   */

  validate(): boolean {

    this.errors = {};

    if (!this.email.trim()) {
      this.errors['email'] = 'Email is required.';
    } else if (!this.EMAIL_REGEX.test(this.email.trim())) {
      this.errors['email'] = 'Please enter a valid email address.';
    }

    if (!this.name.trim()) {
      this.errors['name'] = 'Name is required.';
    }

    if (!this.password) {
      this.errors['password'] = 'Password is required.';
    }
    else if (this.password.length < 6) {
      this.errors['password'] =
        'Password must be at least 6 characters.';
    }

    if (!this.confirmPassword) {
      this.errors['confirmPassword'] =
        'Please confirm your password.';
    }
    else if (this.password !== this.confirmPassword) {
      this.errors['confirmPassword'] =
        'Passwords do not match.';
    }

    if (!this.agreeTerms) {
      this.errors['terms'] =
        'You must agree to the Terms & Conditions.';
    }

    return Object.keys(this.errors).length === 0;
  }


    onEmailChange(): void {

    const email = this.email.trim().toLowerCase();

    delete this.errors['email'];

    if (email === '') {
      return;
    }

    if (!this.EMAIL_REGEX.test(email)) {
      this.errors['email'] = 'Please enter a valid email address';
    }

}
  submit() {

    this.banner = null;

    if (!this.validate() || this.loading) {
      return;
    }

    this.loading = true;

    const names = this.name.trim().split(' ');

    this.auth.register({

      firstName: names[0],

      lastName:
        names.length > 1
          ? names.slice(1).join(' ')
          : '',

      email: this.email.trim(),

      password: this.password

    })
    .pipe(
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({

      next: () => {

        this.success = true;

        this.banner = {
          type: 'success',
          title: 'Account created!',
          message: 'Redirecting to Sign In...'
        };

        this.toaster.success(
          'Account Created!',
          'Welcome to LuxeWear.'
        );

        setTimeout(() => {

          this.router.navigate(['/login']);

        }, 2000);

      },

      error: (err: any) => {

        this.banner = {

          type: 'error',

          title: 'Registration Failed',

          message:
            err.error?.message ||
            'Registration failed.'

        };

      }

    });

  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}