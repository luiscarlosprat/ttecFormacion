import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartItem, CartService } from '../../services/cart.service';

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  categoryId?: number;
  categoryName?: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.css'
})
export class ListaProductosComponent implements OnInit {
  productos: Product[] = [];
  categorias: Category[] = [];

  categoriaSeleccionada: number | null = null;
  textoBusqueda = '';

  usuarioLogueado: any = null;

  carrito: CartItem[] = [];
  mostrarCarrito = false;

  mostrarFormularioProducto = false;
  modoFormulario: 'crear' | 'editar' = 'crear';
  productoForm: Product = this.crearProductoVacio();
  mensajeAdmin = '';
  errorAdmin = '';

  apiProductsUrl = 'http://localhost:2502/api/Products';
  apiCategoriesUrl = 'http://localhost:2502/api/Categories';

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.inicializarComponente();
  }

  async inicializarComponente(): Promise<void> {
    this.usuarioLogueado = this.authService.getUsuario();

    await this.cartService.init();

    this.cartService.carrito$.subscribe((carrito) => {
      this.carrito = carrito;
    });

    await this.cargarCategorias();
    await this.cargarProductos();
  }

  crearProductoVacio(): Product {
    return {
      id: 0,
      name: '',
      description: '',
      price: 0,
      categoryId: undefined
    };
  }

  async cargarProductos(): Promise<void> {
    try {
      const response = await fetch(this.apiProductsUrl);

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const data: Product[] = await response.json();
      this.productos = data;
    } catch (error) {
      console.error('Error cargando productos', error);
    }
  }

  async cargarCategorias(): Promise<void> {
    try {
      const response = await fetch(this.apiCategoriesUrl);

      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }

      const data: Category[] = await response.json();
      this.categorias = data;
    } catch (error) {
      console.error('Error cargando categorías', error);
    }
  }

  get productosFiltrados(): Product[] {
    return this.productos.filter((producto) => {
      const coincideTexto =
        !this.textoBusqueda.trim() ||
        producto.name.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        (producto.description ?? '')
          .toLowerCase()
          .includes(this.textoBusqueda.toLowerCase());

      const coincideCategoria =
        this.categoriaSeleccionada === null ||
        producto.categoryId === this.categoriaSeleccionada;

      return coincideTexto && coincideCategoria;
    });
  }

  seleccionarCategoria(categoryId: number | null): void {
    this.categoriaSeleccionada = categoryId;
  }

  obtenerNombreCategoria(categoryId?: number): string {
    if (!categoryId) return 'Sin categoría';

    const categoria = this.categorias.find((c) => c.id === categoryId);
    return categoria ? categoria.name : 'Sin categoría';
  }

  esAdmin(): boolean {
    return this.usuarioLogueado?.role === 'Admin';
  }

  async cerrarSesion(): Promise<void> {
    this.authService.logout();
    await this.cartService.vaciarCarrito();
    this.router.navigate(['/login']);
  }

  async anadirAlCarrito(producto: Product): Promise<void> {
    await this.cartService.anadirAlCarrito(producto);
  }

  async quitarDelCarrito(productId: number): Promise<void> {
    await this.cartService.quitarDelCarrito(productId);
  }

  async aumentarCantidad(productId: number): Promise<void> {
    await this.cartService.aumentarCantidad(productId);
  }

  async disminuirCantidad(productId: number): Promise<void> {
    await this.cartService.disminuirCantidad(productId);
  }

  async vaciarCarrito(): Promise<void> {
    await this.cartService.vaciarCarrito();
  }

  alternarCarrito(): void {
    this.mostrarCarrito = !this.mostrarCarrito;
  }

  get totalItemsCarrito(): number {
    return this.cartService.getTotalItems();
  }

  get totalCarrito(): number {
    return this.cartService.getTotalPrecio();
  }

  abrirCrearProducto(): void {
    this.modoFormulario = 'crear';
    this.productoForm = this.crearProductoVacio();
    this.errorAdmin = '';
    this.mensajeAdmin = '';
    this.mostrarFormularioProducto = true;
  }

  abrirEditarProducto(producto: Product): void {
    this.modoFormulario = 'editar';
    this.productoForm = {
      id: producto.id,
      name: producto.name,
      description: producto.description ?? '',
      price: producto.price ?? 0,
      categoryId: producto.categoryId
    };
    this.errorAdmin = '';
    this.mensajeAdmin = '';
    this.mostrarFormularioProducto = true;
  }

  cerrarFormularioProducto(): void {
    this.mostrarFormularioProducto = false;
    this.errorAdmin = '';
    this.mensajeAdmin = '';
  }

  async guardarProducto(): Promise<void> {
    this.errorAdmin = '';
    this.mensajeAdmin = '';

    if (!this.productoForm.name?.trim()) {
      this.errorAdmin = 'El nombre es obligatorio';
      return;
    }

    if (
      this.productoForm.price === undefined ||
      this.productoForm.price === null ||
      Number(this.productoForm.price) < 0
    ) {
      this.errorAdmin = 'El precio debe ser válido';
      return;
    }

    if (!this.productoForm.categoryId) {
      this.errorAdmin = 'Debes seleccionar una categoría';
      return;
    }

    const body = {
      name: this.productoForm.name,
      description: this.productoForm.description ?? '',
      price: Number(this.productoForm.price),
      categoryId: Number(this.productoForm.categoryId)
    };

    try {
      let response: Response;

      if (this.modoFormulario === 'crear') {
        response = await fetch(this.apiProductsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      } else {
        response = await fetch(`${this.apiProductsUrl}/${this.productoForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: this.productoForm.id,
            ...body
          })
        });
      }

      if (!response.ok) {
        throw new Error('La API devolvió un error al guardar el producto');
      }

      this.mensajeAdmin =
        this.modoFormulario === 'crear'
          ? 'Producto creado correctamente'
          : 'Producto editado correctamente';

      await this.cargarProductos();
      this.mostrarFormularioProducto = false;
    } catch (error) {
      console.error(error);
      this.errorAdmin = 'No se pudo guardar el producto';
    }
  }

  async eliminarProducto(producto: Product): Promise<void> {
    this.errorAdmin = '';
    this.mensajeAdmin = '';

    const confirmar = window.confirm(`¿Seguro que quieres eliminar "${producto.name}"?`);

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(`${this.apiProductsUrl}/${producto.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('La API devolvió un error al eliminar el producto');
      }

      this.mensajeAdmin = 'Producto eliminado correctamente';
      await this.cargarProductos();
    } catch (error) {
      console.error(error);
      this.errorAdmin = 'No se pudo eliminar el producto';
    }
  }
}