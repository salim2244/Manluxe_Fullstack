import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-auth-modal',
  imports: [CommonModule],
  templateUrl: './auth-modal.html'
})
export class AuthModal {

  isLogin = true;

  @Output() close = new EventEmitter<void>();

  switchMode() {
    this.isLogin = !this.isLogin;
  }

  closeModal() {
    this.close.emit();
  }
}
