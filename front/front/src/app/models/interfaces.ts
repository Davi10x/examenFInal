export interface User {
  username: string;
  role: 'lector' | 'writer' | 'owner' | 'sa';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface Libro {
  id_libro?: number;
  titulo: string;
  autor: string;
  editorial?: string;
  anio_publicacion?: number;
  categoria?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UsuarioSQLServer {
  username: string;
  type_desc?: string;
  role: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: 'lector' | 'writer' | 'owner';
  saPassword: string;
}
