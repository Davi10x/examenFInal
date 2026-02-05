import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  LoginRequest, 
  LoginResponse, 
  ApiResponse, 
  Libro, 
  UsuarioSQLServer,
  CreateUserRequest 
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  verifyToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify`);
  }

  getLibros(): Observable<ApiResponse<Libro[]>> {
    return this.http.get<ApiResponse<Libro[]>>(`${this.apiUrl}/libros`);
  }

  getLibroById(id: number): Observable<ApiResponse<Libro>> {
    return this.http.get<ApiResponse<Libro>>(`${this.apiUrl}/libros/${id}`);
  }

  createLibro(libro: Libro, password: string): Observable<ApiResponse<Libro>> {
    return this.http.post<ApiResponse<Libro>>(`${this.apiUrl}/libros`, {
      ...libro,
      password
    });
  }

  updateLibro(id: number, libro: Libro, password: string): Observable<ApiResponse<Libro>> {
    return this.http.put<ApiResponse<Libro>>(`${this.apiUrl}/libros/${id}`, {
      ...libro,
      password
    });
  }

  deleteLibro(id: number, password: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/libros/${id}`, {
      body: { password }
    });
  }

  getUsuarios(): Observable<ApiResponse<UsuarioSQLServer[]>> {
    return this.http.get<ApiResponse<UsuarioSQLServer[]>>(`${this.apiUrl}/usuarios`);
  }

  createUsuario(userData: CreateUserRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/usuarios`, userData);
  }

  deleteUsuario(username: string, password: string): Observable<ApiResponse<any>> {
    const options = {
      body: { password }
    };
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/usuarios/${username}`, options);
  }
}
