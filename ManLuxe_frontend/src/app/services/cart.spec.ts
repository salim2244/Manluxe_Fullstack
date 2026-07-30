import { TestBed } from '@angular/core/testing';
import { Cart } from './cart';

describe('Cart', () => {
  let service: Cart;

  const mockProduct = {
    id: 1, name: 'Denim Jeans', brand: 'Levis', description: 'Blue jeans',
    price: 2999, discount: 10, stock: 20, imageUrl: 'img.jpg',
    active: true, categoryName: 'mens'
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [Cart] });
    service = TestBed.inject(Cart);
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty cart', () => {
    expect(service.items()).toEqual([]);
    expect(service.totalItems()).toBe(0);
    expect(service.totalPrice()).toBe(0);
  });

  it('add() should add a product to the cart', () => {
    service.add(mockProduct);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].name).toBe('Denim Jeans');
    expect(service.totalItems()).toBe(1);
  });

  it('add() should apply discount to the stored price', () => {
    service.add(mockProduct); // 10% off 2999 = 2699.1 → rounded = 2699
    expect(service.items()[0].price).toBe(2699);
  });

  it('add() should increment quantity when adding the same product again', () => {
    service.add(mockProduct);
    service.add(mockProduct);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].quantity).toBe(2);
    expect(service.totalItems()).toBe(2);
  });

  it('remove() should remove item from cart', () => {
    service.add(mockProduct);
    const id = service.items()[0].id;
    service.remove(id);
    expect(service.items()).toEqual([]);
  });

  it('updateQty() should change item quantity', () => {
    service.add(mockProduct);
    const id = service.items()[0].id;
    service.updateQty(id, 5);
    expect(service.items()[0].quantity).toBe(5);
  });

  it('updateQty() with qty < 1 should remove the item', () => {
    service.add(mockProduct);
    const id = service.items()[0].id;
    service.updateQty(id, 0);
    expect(service.items()).toEqual([]);
  });

  it('clear() should empty the cart', () => {
    service.add(mockProduct);
    service.clear();
    expect(service.items()).toEqual([]);
    expect(service.totalItems()).toBe(0);
  });

  it('totalPrice() should compute correctly', () => {
    service.add(mockProduct);
    service.add(mockProduct);
    // price 2699 × qty 2 = 5398
    expect(service.totalPrice()).toBe(5398);
  });

  it('should persist cart to localStorage on add', () => {
    service.add(mockProduct);
    const stored = JSON.parse(localStorage.getItem('cart') ?? '[]');
    expect(stored.length).toBe(1);
  });
});
