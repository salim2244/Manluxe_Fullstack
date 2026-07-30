import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast-item pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-sm
                 bg-white rounded-2xl shadow-2xl border px-4 py-3.5 pr-3"
          [class.border-green-200]="toast.type === 'success'"
          [class.border-red-200]="toast.type === 'error'"
          [class.border-blue-200]="toast.type === 'info'">

          <!-- Icon -->
          <div class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            [class.bg-green-100]="toast.type === 'success'"
            [class.bg-red-100]="toast.type === 'error'"
            [class.bg-blue-100]="toast.type === 'info'">
            @if (toast.type === 'success') { ✅ }
            @if (toast.type === 'error')   { ❌ }
            @if (toast.type === 'info')    { ℹ️ }
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0 pt-0.5">
            <p class="text-sm font-semibold text-gray-900">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="text-xs text-gray-500 mt-0.5">{{ toast.message }}</p>
            }
          </div>

          <!-- Close -->
          <button (click)="toastService.remove(toast.id)"
            class="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-gray-300
                   hover:bg-gray-100 hover:text-gray-500 transition-all text-xs mt-0.5">
            ✕
          </button>

          <!-- Progress bar -->
          <div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl overflow-hidden">
            <div class="h-full toast-progress rounded-b-2xl"
              [class.bg-green-400]="toast.type === 'success'"
              [class.bg-red-400]="toast.type === 'error'"
              [class.bg-blue-400]="toast.type === 'info'">
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-item {
      position: relative;
      animation: slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%) scale(0.9); }
      to   { opacity: 1; transform: translateX(0)   scale(1); }
    }
    .toast-progress {
      animation: shrink 4s linear forwards;
    }
    @keyframes shrink {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
