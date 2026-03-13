import { Injectable } from '@angular/core';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  role?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:2502/api/Users';

  async login(username: string, password: string): Promise<Usuario> {

    const response = await fetch(`${this.apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        passwordHash: password
      })
    });

    if (!response.ok) {
      throw new Error('Login incorrecto');
    }

    const user: Usuario = await response.json();

    localStorage.setItem('usuarioLogueado', JSON.stringify(user));

    return user;
  }

  async register(username: string, email: string, password: string): Promise<Usuario> {

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        passwordHash: password,
        email: email,
        role: 'User'
      })
    });

    if (!response.ok) {
      throw new Error('Error al crear usuario');
    }

    return await response.json();
  }

  getUsuario(): Usuario | null {
    return JSON.parse(localStorage.getItem('usuarioLogueado') || 'null');
  }

  logout(): void {
    localStorage.removeItem('usuarioLogueado');
  }

  estaLogueado(): boolean {
    return this.getUsuario() !== null;
  }

}