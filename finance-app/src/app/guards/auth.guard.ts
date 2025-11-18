import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = (route, state) => {
  // MODO DEV: permite acesso sem autenticação
  if (environment.devMode) {
    console.warn('🔓 MODO DEV ATIVO: Autenticação desabilitada');
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && authService.isAuthenticated()) {
        return true;
      } else {
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    })
  );
};
