import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogoAlumnoComponent } from '../dialogo-alumno/dialogo-alumno.component';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface Alumno {
  id: number;
  nombre: string;
  curso: string;
  nota: number;
}

@Component({
  selector: 'app-lista-alumnos',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormsModule,
    DialogoAlumnoComponent,
    ToastModule
  ],
  templateUrl: './lista-alumnos.component.html',
  styleUrls: ['./lista-alumnos.component.css'],
  providers: [MessageService]
})
export class ListaAlumnosComponent {

  alumnos: Alumno[] = [];

  filtro = '';
  mostrarDialogo = false;

  alumnoSeleccionado: Alumno = {
    id: 0,
    nombre: '',
    curso: '',
    nota: 0
  };

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  async cargarAlumnos() {
    try {
      const response = await fetch('http://localhost:2502/api/alumnos');
      const data = await response.json();
      this.alumnos = data;
    } catch (error) {
      console.error('Error cargando alumnos', error);
    }
  }

  get alumnosFiltrados(): Alumno[] {
    if (!this.filtro.trim()) return this.alumnos;

    return this.alumnos.filter(a =>
      a.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      a.curso.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  abrirDialogo() {
    this.alumnoSeleccionado = {
      id: 0,
      nombre: '',
      curso: '',
      nota: 0
    };

    this.mostrarDialogo = true;
  }

  editarAlumno(alumno: Alumno) {
    this.alumnoSeleccionado = { ...alumno };
    this.mostrarDialogo = true;
  }

  guardarAlumno(alumno: Alumno) {

    if (alumno.id === 0) {
      alumno.id = Math.max(...this.alumnos.map(a => a.id), 0) + 1;
      this.alumnos.push(alumno);
    } else {
      const index = this.alumnos.findIndex(a => a.id === alumno.id);
      if (index !== -1) {
        this.alumnos[index] = alumno;
      }
    }

    this.mostrarDialogo = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Alumno guardado correctamente'
    });
  }

  eliminarAlumno(alumno: Alumno) {

    this.alumnos = this.alumnos.filter(a => a.id !== alumno.id);

    this.messageService.add({
      severity: 'warn',
      summary: 'Eliminado',
      detail: 'Alumno eliminado'
    });
  }
}