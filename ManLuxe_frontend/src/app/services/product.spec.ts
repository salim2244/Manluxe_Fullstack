import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './product';
import { Product } from '../models/product';
import { environment } from '../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/products`;

  const mockProducts: Product[] = [
    { id: 1, name: 'Denim Jeans', brand: 'Levis', description: 'Blue jeans', price: 2999, discount: 10, stock: 50, imageUrl: 'img1.jpg', active: true, categoryName: 'Jeans',  categoryId: 1, gender: 'MEN',   sizeType: 'NUMBER', sizes: [{ id: 1, size: '32', stock: 25 }] },
    { id: 2, name: 'Silk Blouse', brand: 'Zara',  description: 'Silk top',   price: 1999, discount: 0,  stock: 30, imageUrl: 'img2.jpg', active: true, categoryName: 'Tops',   categoryId: 2, gender: 'WOMEN', sizeType: 'LETTER', sizes: [{ id: 2, size: 'M',  stock: 15 }] }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service  = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() should GET /api/products and return products', () => {
    service.getAll().subscribe(products => {
      expect(products.length).toBe(2);
      expect(products[0].name).toBe('Denim Jeans');
    });

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('getById() should GET /api/products/:id and return a single product', () => {
    service.getById(1).subscribe(product => {
      expect(product.id).toBe(1);
      expect(product.brand).toBe('Levis');
    });

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts[0]);
  });

  it('search() should GET /api/products/search?keyword=jeans', () => {
    service.search('jeans').subscribe(products => {
      expect(products.length).toBe(1);
      expect(products[0].name).toBe('Denim Jeans');
    });

    const req = httpMock.expectOne(`${base}/search?keyword=jeans`);
    expect(req.request.method).toBe('GET');
    req.flush([mockProducts[0]]);
  });

  it('getByCategory() should GET /api/products/category/:id', () => {
    service.getByCategory(3).subscribe(products => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${base}/category/3`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('getAll() should handle empty response', () => {
    service.getAll().subscribe(products => {
      expect(products).toEqual([]);
    });

    const req = httpMock.expectOne(base);
    req.flush([]);
  });

  it('getById() should propagate HTTP errors', () => {
    let errorStatus = 0;
    service.getById(999).subscribe({
      next: () => { throw new Error('expected an error'); },
      error: err => { errorStatus = err.status; }
    });

    const req = httpMock.expectOne(`${base}/999`);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(errorStatus).toBe(404);
  });
});
