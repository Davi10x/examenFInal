import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SaGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isSA()) {
      return true;
    }
    
    // Si no es SA, redirigir a libros
    this.router.navigate(['/libros']);
    return false;
  }
}
