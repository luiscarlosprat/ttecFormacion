import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  modo: 'login' | 'registro' = 'login';

  loginUsername = '';
  loginPassword = '';
  errorLogin = '';

  registerUsername = '';
  registerEmail = '';
  registerPassword = '';
  registerPasswordConfirm = '';
  errorRegistro = '';
  mensajeRegistro = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.estaLogueado()) {
      this.router.navigate(['/productos']);
    }
  }

  cambiarModo(nuevoModo: 'login' | 'registro'): void {
    this.modo = nuevoModo;
    this.errorLogin = '';
    this.errorRegistro = '';
    this.mensajeRegistro = '';
  }

  async iniciarSesion(): Promise<void> {

    this.errorLogin = '';

    if (!this.loginUsername.trim() || !this.loginPassword.trim()) {
      this.errorLogin = 'Debes rellenar usuario y contraseña';
      return;
    }

    try {

      await this.authService.login(
        this.loginUsername,
        this.loginPassword
      );

      await this.router.navigate(['/productos']);

    } catch (error) {

      this.errorLogin = 'Usuario o contraseña incorrectos';

    }

  }

  async crearCuenta(): Promise<void> {

    this.errorRegistro = '';
    this.mensajeRegistro = '';

    if (
      !this.registerUsername.trim() ||
      !this.registerEmail.trim() ||
      !this.registerPassword.trim() ||
      !this.registerPasswordConfirm.trim()
    ) {
      this.errorRegistro = 'Debes rellenar todos los campos';
      return;
    }

    if (this.registerPassword !== this.registerPasswordConfirm) {
      this.errorRegistro = 'Las contraseñas no coinciden';
      return;
    }

    try {

      await this.authService.register(
        this.registerUsername,
        this.registerEmail,
        this.registerPassword
      );

      this.mensajeRegistro = 'Cuenta creada correctamente. Ya puedes iniciar sesión.';

      this.registerUsername = '';
      this.registerEmail = '';
      this.registerPassword = '';
      this.registerPasswordConfirm = '';

      this.modo = 'login';

    } catch (error) {

      this.errorRegistro = 'No se pudo crear la cuenta';

    }

  }

}