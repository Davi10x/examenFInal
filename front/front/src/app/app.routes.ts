import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { SaGuard } from './guards/sa.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'libros',
    loadComponent: () => import('./libros/libros.page').then((m) => m.LibrosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./usuarios/usuarios.page').then((m) => m.UsuariosPage),
    canActivate: [AuthGuard, SaGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
];
