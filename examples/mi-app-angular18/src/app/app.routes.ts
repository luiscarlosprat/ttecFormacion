import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ListaProductosComponent } from './components/lista-productos/lista-productos.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'productos', component: ListaProductosComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];