

import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'access_token'; // Clave para almacenar el token
  private refreshTokenKey = 'refresh_token'; // Clave para almacenar el refresh token
  private userKey = 'user'; // Clave para almacenar el usuario
  user: any | undefined
  private emailKey = 'email';
  private rutaApi = `${environment.api_backend}/login`;
  private users = 'access_token';
  constructor(
    private _httpClient: HttpClient,
    private router: Router
  ) {}
  getUser(): any | undefined {
    const user = localStorage.getItem(this.userKey);
  return user ? JSON.parse(user) : null;  // Parsear el valor para obtener el objeto
  }
//   Función para hacer login
  acceso(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this._httpClient.post<any>(this.rutaApi, body, {
      headers: new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8'),
    }).pipe(
      tap((response) => {
        if (response && response.access_token) {
          // Guardar el access_token en LocalStorage
          localStorage.setItem(this.tokenKey, response.access_token);

          // Guardar el usuario en localStorage
          const user = {
            fullname: response.user.fullname,
            email: response.user.email,
          };
          const email = response.user.email;
        //   localStorage.setItem(this.users, JSON.stringify(response.user));
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          localStorage.setItem(this.emailKey, JSON.stringify(email));
        }
      }),
      catchError((err) => {
        console.error('Error during login:', err);
        return of(null); // Devuelve un observable vacío en caso de error
      })
    );
  }



  // Función para verificar el usuario usando el token
  getUserByToken(): Observable<any> {
    const token = this.obtenerToken();
    if (!token) {
      return of(null); // Si no hay token, devuelve null
    }

    return this._httpClient.get<any>(`${environment.api_backend}/user`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    }).pipe(
      map((response) => {
        if (response && response.user) {
          return response.user; // Devuelve el usuario si es encontrado
        }
        return null;
      }),
      catchError((err) => {
        console.error('Error verifying token:', err);
        return of(null); // Devuelve null en caso de error
      })
    );
  }

  // Obtener el token almacenado
  obtenerToken(): string {
    return localStorage.getItem(this.tokenKey) || '';
  }

  // Obtener el refresh token almacenado
  obtenerRefreshToken(): string {
    return localStorage.getItem(this.refreshTokenKey) || '';
  }

  // Obtener el usuario almacenado
  obtenerUsuario(): string | null {
    return localStorage.getItem(this.userKey);
  }


  cerrarSesion(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']); // Redirigir al login después de cerrar sesión
  }
}
