// import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment';
// import { HttpClient, HttpHeaders } from '@angular/common/http';



// @Injectable({
//     providedIn: 'root'
//   })
//   export class AuthService {


//       rutaApi=`${environment.api_backend}/login`


//       token:string=environment.token;

//   constructor(
//       private _httpClient: HttpClient,


//   ) { }

//       acceso(email:string, password:string){
//           const body={email: email, password: password}
//           return this._httpClient.post(this.rutaApi, body,{
//               headers: new HttpHeaders().set('content-Type', 'application/json; charset=utf-8'),
//           });
//       }
//       /** cerrar ssion*/
//       cerrarSesion(){
//           LocalStorage.clear();

//       }
//       //**OBTENER TOKEN */
//       obtenerToken(){
//           var token=LocalStorage.getItem(this.token);
//           if(token==null){
//               token='';

//           }
//           return token;
//       }
//   }









// import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { tap } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   rutaApi = `${environment.api_backend}/login`;
//   tokenKey = 'access_token'; // Definir clave para el token

//   constructor(
//     private _httpClient: HttpClient,
//   ) { }

//   // Función para hacer login
//   acceso(email: string, password: string) {
//     const body = { email: email, password: password };
//     return this._httpClient.post(this.rutaApi, body, {
//       headers: new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8'),
//     }).pipe(
//       // Almacenar el token recibido en LocalStorage
//       tap((response: any) => {
//         if (response && response.access_token) {
//           LocalStorage.setItem(this.tokenKey, response.access_token);
//         }
//       })
//     );
//   }

//   // Cerrar sesión
//   cerrarSesion() {
//     LocalStorage.clear();
//   }

//   // Obtener el token almacenado
//   obtenerToken() {
//     return LocalStorage.getItem(this.tokenKey) || '';
//   }
// }


// import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { tap, map } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   rutaApi = `${environment.api_backend}/login`;
//   tokenKey = 'access_token';  // Clave para almacenar el token
//   refreshTokenKey = 'refresh_token'; // Clave para almacenar el refresh token


//   constructor(
//     private _httpClient: HttpClient,
//   ) { }

//   // Función para hacer login
//   acceso(email: string, password: string): Observable<any> {
//     const body = { email, password };
//     return this._httpClient.post<any>(this.rutaApi, body, {
//       headers: new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8'),
//     }).pipe(
//       tap((response) => {
//         // Guardar el access_token y refresh_token en LocalStorage
//         if (response && response.access_token) {
//           LocalStorage.setItem(this.tokenKey, response.access_token);
//           LocalStorage.setItem(this.refreshTokenKey, response.refresh_token);
//         }
//       })
//     );
//   }

//   // Verificar token de usuario
//   getUserByToken(token: string): Observable<any> {
//     // Llamada al backend para verificar el token o buscar usuario
//     return this._httpClient.get<any>(`${environment.api_backend}/user`, {
//       headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
//     }).pipe(
//       map((response) => {
//         if (response) {
//           return response.user;
//         }
//         return null;
//       })
//     );
//   }




//   // Obtener el token almacenado
//   obtenerToken(): string {
//     return LocalStorage.getItem(this.tokenKey) || '';
//   }

//   // Obtener el refresh token almacenado
//   obtenerRefreshToken(): string {
//     return LocalStorage.getItem(this.refreshTokenKey) || '';
//   }

//   // Cerrar sesión y limpiar almacenamiento
//   cerrarSesion(): void {
//     LocalStorage.clear();
//   }
// }



// import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { tap, map, catchError, finalize } from 'rxjs/operators';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private tokenKey = 'access_token'; // Clave para almacenar el token
//   private refreshTokenKey = 'refresh_token'; // Clave para almacenar el refresh token
//   private userKey = 'user'; // Clave para almacenar el usuario
//   private rutaApi = `${environment.api_backend}/login`;

//   constructor(
//     private _httpClient: HttpClient,
//     private router: Router
//   ) {}

//   // Función para hacer login
//   acceso(email: string, password: string): Observable<any> {
//     const body = { email, password };
//     return this._httpClient.post<any>(this.rutaApi, body, {
//       headers: new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8'),
//     }).pipe(
//       tap((response) => {
//         if (response && response.access_token) {
//           // Guardar el access_token y refresh_token en LocalStorage
//           LocalStorage.setItem(this.tokenKey, response.access_token);
//           LocalStorage.setItem(this.refreshTokenKey, response.refresh_token);

//           // Guardar el usuario en localStorage
//           const user = {
//             fullname: response.user.fullname,
//             email: response.user.email,
//           };
//           localStorage.setItem(this.userKey, JSON.stringify(user));
//         }
//       }),
//       catchError((err) => {
//         console.error('Error during login:', err);
//         return of(null); // Devuelve un observable vacío en caso de error
//       })
//     );
//   }

//   // Función para verificar el usuario usando el token
//   getUserByToken(): Observable<any> {
//     const token = this.obtenerToken();
//     if (!token) {
//       return of(null); // Si no hay token, devuelve null
//     }

//     return this._httpClient.get<any>(`${environment.api_backend}/user`, {
//       headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
//     }).pipe(
//       map((response) => {
//         if (response && response.user) {
//           return response.user; // Devuelve el usuario si es encontrado
//         }
//         return null;
//       }),
//       catchError((err) => {
//         console.error('Error verifying token:', err);
//         return of(null); // Devuelve null en caso de error
//       })
//     );
//   }

//   // Obtener el token almacenado
//   obtenerToken(): string {
//     return LocalStorage.getItem(this.tokenKey) || '';
//   }

//   // Obtener el refresh token almacenado
//   obtenerRefreshToken(): string {
//     return LocalStorage.getItem(this.refreshTokenKey) || '';
//   }

//   // Obtener el usuario almacenado
//   obtenerUsuario(): any {
//     const user = localStorage.getItem(this.userKey);
//     return user ? JSON.parse(user) : null;
//   }

//   // Cerrar sesión y limpiar almacenamiento
//   cerrarSesion(): void {
//     LocalStorage.clear();
//     localStorage.clear();
//     this.router.navigate(['/login']); // Redirigir al login después de cerrar sesión
//   }
// }



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
  private emailKey = 'email';
  private rutaApi = `${environment.api_backend}/login`;

  constructor(
    private _httpClient: HttpClient,
    private router: Router
  ) {}

  // Función para hacer login
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
          localStorage.setItem(this.userKey, JSON.stringify(user));
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
  obtenerUsuario(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  // Cerrar sesión y limpiar almacenamiento
  cerrarSesion(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']); // Redirigir al login después de cerrar sesión
  }
}
