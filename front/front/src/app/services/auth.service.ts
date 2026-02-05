import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest } from '../models/interfaces';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private passwordStorage: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.apiService.login(credentials).pipe(
      tap(response => {
        if (response.success) {
          this.setSession(response.token, response.user, credentials.password);
        }
      })
    );
  }

  private setSession(token: string, user: User, password: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('pwd', btoa(password)); // Guardar encriptado
    this.passwordStorage = password;
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    const pwdStr = localStorage.getItem('pwd');
    if (userStr) {
      this.currentUserSubject.next(JSON.parse(userStr));
    }
    if (pwdStr) {
      this.passwordStorage = atob(pwdStr); // Desencriptar
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('pwd');
    this.passwordStorage = '';
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getPassword(): string {
    return this.passwordStorage;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isSA(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'sa';
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  canDelete(): boolean {
    return this.hasRole(['owner', 'sa']);
  }

  canWrite(): boolean {
    return this.hasRole(['writer', 'owner', 'sa']);
  }

  canRead(): boolean {
    return this.isAuthenticated();
  }
}
