import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  id: number;
  name?: string;
  username?: string;
  email?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  error = '';

  apiUsersUrl = 'http://localhost:2502/api/Users';

  constructor(private router: Router) {}

  async iniciarSesion(): Promise<void> {
    this.error = '';

    try {
      const response = await fetch(this.apiUsersUrl);

      if (!response.ok) {
        throw new Error('No se pudieron cargar los usuarios');
      }

      const usuarios: User[] = await response.json();

      const usuarioEncontrado = usuarios.find(
        u =>
          (u.email && u.email.toLowerCase() === this.email.toLowerCase()) ||
          (u.username && u.username.toLowerCase() === this.email.toLowerCase())
      );

      if (!usuarioEncontrado) {
        this.error = 'Usuario no encontrado';
        return;
      }

      localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioEncontrado));
      await this.router.navigate(['/productos']);
    } catch (error) {
      console.error(error);
      this.error = 'Error al iniciar sesión';
    }
  }
}