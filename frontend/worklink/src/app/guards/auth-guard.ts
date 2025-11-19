// File: frontend/worklink/src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, catchError, of } from 'rxjs';
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    router.navigate(['/login']);
    return false;
  }
  return authService.getUserProfile().pipe(
    map(usuario => {
      const rolRequerido = route.data['rol']; 
      if (rolRequerido && usuario.rol !== rolRequerido) {
        alert('Acceso denegado: No tienes permisos.');
        authService.logout(); 
        return false;
      }

      return true;
    }),
    catchError(() => {
    
      authService.logout();
      return of(false);
    })
  );
};