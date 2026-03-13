import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  description?: string;
  price?: number;
  categoryId?: number;
  categoryName?: string;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly dbName = 'tienda-db';
  private readonly storeName = 'cart';
  private readonly cartKey = 'current-cart';

  private carritoSubject = new BehaviorSubject<CartItem[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  constructor() {}

  async init(): Promise<void> {
    const carritoGuardado = await this.leerCarritoDeIndexedDb();
    this.carritoSubject.next(carritoGuardado);
  }

  getCarrito(): CartItem[] {
    return this.carritoSubject.value;
  }

  private async setCarrito(carrito: CartItem[]): Promise<void> {
    this.carritoSubject.next(carrito);
    await this.guardarCarritoEnIndexedDb(carrito);
  }

  async anadirAlCarrito(producto: Omit<CartItem, 'cantidad'>): Promise<void> {
    const carritoActual = [...this.getCarrito()];
    const itemExistente = carritoActual.find((item) => item.id === producto.id);

    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      carritoActual.push({
        ...producto,
        cantidad: 1
      });
    }

    await this.setCarrito(carritoActual);
  }

  async quitarDelCarrito(productId: number): Promise<void> {
    const carritoActual = this.getCarrito().filter((item) => item.id !== productId);
    await this.setCarrito(carritoActual);
  }

  async aumentarCantidad(productId: number): Promise<void> {
    const carritoActual = [...this.getCarrito()];
    const item = carritoActual.find((p) => p.id === productId);

    if (item) {
      item.cantidad += 1;
      await this.setCarrito(carritoActual);
    }
  }

  async disminuirCantidad(productId: number): Promise<void> {
    const carritoActual = [...this.getCarrito()];
    const item = carritoActual.find((p) => p.id === productId);

    if (!item) return;

    if (item.cantidad > 1) {
      item.cantidad -= 1;
      await this.setCarrito(carritoActual);
    } else {
      await this.quitarDelCarrito(productId);
    }
  }

  async vaciarCarrito(): Promise<void> {
    await this.setCarrito([]);
  }

  getTotalItems(): number {
    return this.getCarrito().reduce((acc, item) => acc + item.cantidad, 0);
  }

  getTotalPrecio(): number {
    return this.getCarrito().reduce(
      (acc, item) => acc + (item.price ?? 0) * item.cantidad,
      0
    );
  }

  private abrirDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async leerCarritoDeIndexedDb(): Promise<CartItem[]> {
    const db = await this.abrirDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(this.cartKey);

      request.onsuccess = () => {
        resolve(request.result ?? []);
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async guardarCarritoEnIndexedDb(carrito: CartItem[]): Promise<void> {
    const db = await this.abrirDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(carrito, this.cartKey);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}