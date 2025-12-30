import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree | any => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.loggedIn$.pipe(
    take(1),
    map((loggedIn) => (loggedIn ? true : router.createUrlTree(['/login'])))
  );
};
