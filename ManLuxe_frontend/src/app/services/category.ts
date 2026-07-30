import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/categories`;

  private _categories = signal<Category[]>([]);

  readonly categories = this._categories.asReadonly();

  loadAll() {
    this.http.get<Category[]>(this.api).subscribe({
      next: data => this._categories.set(data),
      error: err => console.error(err)
    });
  }
}