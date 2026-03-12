import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  categoryId?: number;
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

  apiProductsUrl = 'http://localhost:2502/api/Products';
  apiCategoriesUrl = 'http://localhost:2502/api/Categories';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  async cargarProductos(): Promise<void> {
    try {
      const response = await fetch(this.apiProductsUrl);

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const data: Product[] = await response.json();
      this.productos = data;
      console.log('Productos cargados:', data);
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
      console.log('Categorías cargadas:', data);
    } catch (error) {
      console.error('Error cargando categorías', error);
    }
  }

  get productosFiltrados(): Product[] {
    return this.productos.filter((producto) => {
      const coincideTexto =
        !this.textoBusqueda.trim() ||
        producto.name.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        (producto.description ?? '').toLowerCase().includes(this.textoBusqueda.toLowerCase());

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

    const categoria = this.categorias.find(c => c.id === categoryId);
    return categoria ? categoria.name : 'Sin categoría';
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuarioLogueado');
    this.router.navigate(['/login']);
  }
}