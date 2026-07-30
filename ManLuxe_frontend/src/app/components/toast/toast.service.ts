import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private nextId = 0;

  show(type: ToastMessage['type'], title: string, message?: string, duration = 4000) {
    const id = ++this.nextId;
    this._toasts.update(t => [...t, { id, type, title, message }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(title: string, message?: string) { this.show('success', title, message); }
  error(title: string, message?: string)   { this.show('error',   title, message); }
  info(title: string, message?: string)    { this.show('info',    title, message); }

  remove(id: number) {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }
}
