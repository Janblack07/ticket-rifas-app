import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthLocalService } from '../services/auth-local.service';

export const authLocalGuard: CanActivateFn = () => {
  const auth = inject(AuthLocalService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};
