import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const usuarioLogueado = localStorage.getItem('usuarioLogueado');

  if (usuarioLogueado) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};