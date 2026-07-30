import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../models/cart-item';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Auth } from './auth';


@Injectable({
 providedIn:'root'
})
export class Cart {


    private _items = signal<CartItem[]>([]);

    // Track which product+size combinations have been added (for UI state)
    private _addedCombinations = signal<Set<string>>(new Set());

    readonly items = this._items.asReadonly();


    readonly totalItems = computed(() =>
    this._items()
    .reduce((sum,item)=>sum + item.quantity,0)
    );


    readonly totalPrice = computed(() =>
    this._items()
    .reduce((sum,item)=>sum + item.price * item.quantity,0)
    );


    private http = inject(HttpClient);
    private auth = inject(Auth);


    private api="http://localhost:8080/api/cart";
    private readonly LOCAL_STORAGE_KEY = 'local_cart';



    constructor() {
      this.loadCart();
    }

    private isUserLoggedIn(): boolean {
      return this.auth.isLoggedIn();
    }



// ADD PRODUCT

add(product: any, size?: string, color?: string) {

  console.log("Adding:", product.id, "size:", size, "color:", color);

  const params: any = { quantity: 1 };
  if (size) params.size = size;
  if (color) params.color = color;

  // Track this combination as added
  const key = `${product.id}-${size || 'none'}`;
  const currentCombinations = this._addedCombinations();
  currentCombinations.add(key);
  this._addedCombinations.set(new Set(currentCombinations));

  // Optimistic update - add item immediately
  const tempId = 'temp-' + Date.now();
  const newItem: CartItem = {
    id: tempId,
    productId: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.imageUrl,
    quantity: 1,
    size: size,
    color: color
  };

  const currentItems = this._items();
  this._items.set([...currentItems, newItem]);

  // If user is logged in, sync with backend
  if (this.isUserLoggedIn()) {
    return this.http.post<any>(
      `${this.api}/add/${product.id}`,
      {},
      { params }
    ).pipe(
      tap({
        next: (res: any) => {
          console.log("ADD RESPONSE", res);
          this.loadCart();
        },
        error: (err) => {
          console.error("ADD ERROR", err);
          // Remove from combinations on error
          const errorCombinations = this._addedCombinations();
          errorCombinations.delete(key);
          this._addedCombinations.set(new Set(errorCombinations));
          // Revert on error
          this.loadCart();
        }
      })
    );
  } else {
    // If not logged in, save to localStorage
    this.saveToLocalStorage();
    return new Observable<any>(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

}

// SAVE TO LOCAL STORAGE
private saveToLocalStorage() {
  const items = this._items();
  localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(items));
}

// LOAD FROM LOCAL STORAGE
private loadFromLocalStorage() {
  const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const items: CartItem[] = JSON.parse(stored);
      this._items.set(items);
      // Rebuild combinations
      const combinations = new Set<string>();
      items.forEach(item => {
        combinations.add(`${item.productId}-${item.size || 'none'}`);
      });
      this._addedCombinations.set(combinations);
    } catch (e) {
      console.error('Error loading cart from localStorage', e);
      localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    }
  }
}




// LOAD CART FROM BACKEND

loadCart() {

  // If user is logged in, load from backend
  if (this.isUserLoggedIn()) {
    this.http.get<any>(this.api).subscribe({

      next: (cart) => {

        console.log("LOAD CART:", cart);

        const items: CartItem[] = cart.items.map((item: any) => ({
          id: String(item.cartItemId),
          productId: item.productId,
          name: item.productName,
          brand: item.brand,
          price: item.price,
          image: item.imageUrl,
          quantity: item.quantity,
          size: item.size || undefined,
          color: item.color || undefined
        }));

        console.log("SETTING ITEMS:", items);

        this._items.set(items);

          // Rebuild combinations from backend cart
          const combinations = new Set<string>();

          items.forEach(item => {
            combinations.add(`${item.productId}-${item.size || 'none'}`);
          });

          this._addedCombinations.set(combinations);

          // Clear localStorage after successful backend load
          localStorage.removeItem(this.LOCAL_STORAGE_KEY);

      },

      error: (err) => {

        console.log("LOAD CART ERROR:", err);

        // On error, try to load from localStorage as fallback
        this.loadFromLocalStorage();

      }

    });
  } else {
    // If not logged in, load from localStorage
    this.loadFromLocalStorage();
  }

}




    // CHECK PRODUCT EXIST

    isInCart(productId: number, size?: string) {
      return this._items().some(item =>
        item.productId === productId &&
        (item.size || '') === (size || '')
      );
    }




// UPDATE QUANTITY

updateQty(cartItemId: string, qty: number) {

  if (qty <= 0) {
    this.remove(cartItemId);
    return;
  }

  // If user is logged in, sync with backend
  if (this.isUserLoggedIn()) {
    this.http.put(
      `${this.api}/update/${cartItemId}?quantity=${qty}`,
      {}
    ).subscribe({
      next: () => this.loadCart(),
      error: err => console.error(err)
    });
  } else {
    // If not logged in, update locally
    const currentItems = this._items();
    const updatedItems = currentItems.map(item =>
      item.id === cartItemId ? { ...item, quantity: qty } : item
    );
    this._items.set(updatedItems);
    this.saveToLocalStorage();
  }

}




// DELETE ITEM
remove(cartItemId: string) {

  console.log("DELETE START", cartItemId);

  // Get the item being deleted to remove its combination
  const currentItems = this._items();
  const itemToDelete = currentItems.find(item => item.id === cartItemId);

  // Optimistic update - remove item immediately
  const updatedItems = currentItems.filter(item => item.id !== cartItemId);
  this._items.set(updatedItems);

  // Remove from combinations
  if (itemToDelete) {
    const key = `${itemToDelete.productId}-${itemToDelete.size || 'none'}`;
    const combinations = this._addedCombinations();
    combinations.delete(key);
    this._addedCombinations.set(new Set(combinations));
  }

  // If user is logged in, sync with backend
  if (this.isUserLoggedIn()) {
    this.http.delete(`${this.api}/remove/${cartItemId}`).subscribe({

      next: () => {

        console.log("DELETE SUCCESS");

        this.loadCart();

        console.log("LOAD CART CALLED");

      },

      error: err => {
        console.error("DELETE ERROR", err);
        // Revert on error
        this.loadCart();
      }

    });
  } else {
    // If not logged in, save to localStorage
    this.saveToLocalStorage();
  }

}




    clear() {

      // Clear items immediately for UI update
      this._items.set([]);
      this._addedCombinations.set(new Set());

      // If user is logged in, sync with backend
      if (this.isUserLoggedIn()) {
        this.http.delete(`${this.api}/clear`)
          .subscribe({
            next: () => {
              console.log("Cart cleared on backend");
            },
            error: (err) => {
              console.error("Failed to clear cart on backend", err);
            }
          });
      } else {
        // If not logged in, clear localStorage
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
      }

    }

    // Sync local cart to backend after login
    syncLocalCartToBackend() {
      const localCart = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (localCart) {
        try {
          const items: CartItem[] = JSON.parse(localCart);
          if (items.length > 0) {
            // Add each item to backend
            items.forEach(item => {
              const params: any = { quantity: item.quantity };
              if (item.size) params.size = item.size;
              if (item.color) params.color = item.color;

              this.http.post<any>(
                `${this.api}/add/${item.productId}`,
                {},
                { params }
              ).subscribe({
                next: () => {
                  console.log('Synced item to backend:', item.productId);
                },
                error: (err) => {
                  console.error('Failed to sync item:', item.productId, err);
                }
              });
            });

            // Clear local storage after sync attempt
            localStorage.removeItem(this.LOCAL_STORAGE_KEY);

            // Reload cart from backend after a short delay
            setTimeout(() => {
              this.loadCart();
            }, 500);
          }
        } catch (e) {
          console.error('Error parsing local cart for sync', e);
          localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        }
      }
    }

}