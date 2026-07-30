import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { ToastService } from '../toast/toast.service';
import { finalize } from 'rxjs';




// Valid email: must have letters-only TLD of 2+ chars
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css'
})
export class AuthModal {
  @Output() close = new EventEmitter<void>();

  auth    = inject(Auth);
toaster = inject(ToastService);
router  = inject(Router);

  isLogin       = true;
  name          = '';
  email         = '';
  password      = '';
  showPassword  = false;
  loading       = false;
  transitioning = false;
  registerDone  = false;

  // Inline error banner — shown inside the modal below the form
  banner: { type: 'error'; text: string } | null = null;

  get emailHint(): string {
    if (!this.email || EMAIL_RE.test(this.email)) return '';
    if (!this.email.includes('@')) return 'Missing @';
    const domain = this.email.split('@')[1] || '';
    if (!domain.includes('.')) return 'Add a domain like gmail.com or outlook.com';
    if (!/\.[a-zA-Z]{2,}$/.test(domain)) return 'Domain must end with letters (.com, .in, .net…)';
    return '';
  }

  get emailValid(): boolean {
    return !!this.email && EMAIL_RE.test(this.email);
  }

  validate(): string {
    if (!this.isLogin && !this.name.trim()) return 'Please enter your full name.';
    if (!this.email)                         return 'Email address is required.';
    if (!EMAIL_RE.test(this.email))          return 'Enter a valid email like name@gmail.com or name@outlook.com.';
    if (!this.password)                      return 'Password is required.';
    if (!this.isLogin && this.password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  }

  submit() {
    this.banner = null;
    if (this.loading) return;

    const validationError = this.validate();
    if (validationError) {
      this.banner = { type: 'error', text: validationError };
      return;
    }

    this.loading = true;

    if (this.isLogin) {
      this.auth.login({ email: this.email, password: this.password })
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe({
          next: () => {
  this.toaster.success('Welcome back!', 'You are now signed in.');

  if (this.auth.isAdmin()) {
    this.router.navigateByUrl('/admin');
  } else {
    this.router.navigateByUrl('/');
  }

  this.close.emit();
},
          error: (err) => {
            const msg = err.error?.message || 'Invalid email or password.';
            this.banner = { type: 'error', text: msg };
          }
        });

    } else {
      const names = this.name.trim().split(' ');
      this.auth.register({
        firstName: names[0],
        lastName:  names.length > 1 ? names.slice(1).join(' ') : '',
        email:     this.email,
        password:  this.password
      })
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: () => {
          this.registerDone = true;
          this.toaster.success('Account created! 🎉', 'Please sign in to continue.');
          setTimeout(() => {
            this.registerDone = false;
            this.isLogin  = true;
            this.banner   = null;
            this.name     = '';
            this.password = '';
          }, 1500);
        },
        error: (err) => {
          const msg = err.error?.message || 'Registration failed. Please try again.';
          this.banner = { type: 'error', text: msg };
        }
      });
    }
  }

  switchMode(keepEmail = false) {
    this.transitioning = true;
    this.banner        = null;
    setTimeout(() => {
      this.isLogin      = !this.isLogin;
      this.name         = '';
      this.password     = '';
      this.registerDone = false;
      if (!keepEmail) this.email = '';
      this.transitioning = false;
    }, 150);
  }

  setTab(login: boolean) {
    if (this.isLogin === login) return;   // already on this tab, do nothing
    this.switchMode(true);               // switch and keep email
  }
}
