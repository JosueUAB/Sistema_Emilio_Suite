// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';
// import { AuthService } from './auth.service';
// import { environment } from 'src/environments/environment';

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, catchError, finalize, Observable, of } from "rxjs";
import { AuthService } from "./auth.service";
import { environment } from "src/environments/environment";
import { Injectable } from "@angular/core";

// @Injectable({
//   providedIn: 'root'
// })
// export class RolesService {
//     private rutaApi = `${environment.URL_SERVICIOS}/roles`;

//     isLoading$: Observable<boolean>;
//     isLoadingSubject: BehaviorSubject<boolean>;

//     constructor(
//       private http: HttpClient,
//       public authservice: AuthService,
//     ) {
//       this.isLoadingSubject = new BehaviorSubject<boolean>(false);
//       this.isLoading$ = this.isLoadingSubject.asObservable();
//     }



// registrarRol(data: any) {
//     this.isLoadingSubject.next(true);

//     let token = this.authservice.obtenerToken();

//     if (token) {
//       console.log('Token:', token);

//       let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//       console.log('Headers:', headers);

//       return this.http.post(this.rutaApi, data, { headers: headers }).pipe(
//         finalize(() => this.isLoadingSubject.next(false)),
//         catchError((error) => {
//           console.error('Error en la solicitud', error);
//           this.isLoadingSubject.next(false); // Finaliza la carga incluso si hay error
//           return of(null); // Devuelve un valor por defecto si hay error
//         })
//       );
//     } else {
//       console.log('Token no disponible');
//       this.isLoadingSubject.next(false);
//       return of(null); // Devuelve un valor por defecto si no hay token
//     }
//   }
//   //* obtener roles  **//

//   ListarRoles(page=1,search:string='')
//   {
//     this.isLoadingSubject.next(true);

//     let headers = new HttpHeaders().set('Authorization', `Bearer ${this.authservice.obtenerToken()}`);
//     let url = `${this.rutaApi}?page=${page}&search=${search}`;
//     return this.http.get<any>(url, { headers: headers }).pipe(
//       finalize(() => this.isLoadingSubject.next(false))
//     );

//   }


//   actualizarRol(id: number, data: any) {
//     this.isLoadingSubject.next(true);

//     let token = this.authservice.obtenerToken();

//     if (token) {
//         let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//         return this.http.put(`${this.rutaApi}/${id}`, data, { headers: headers }).pipe(
//             finalize(() => this.isLoadingSubject.next(false)),
//             catchError((error) => {
//                 console.error('Error en la solicitud', error);
//                 this.isLoadingSubject.next(false);
//                 return of(null);
//             })
//         );
//     } else {
//         console.log('Token no disponible');
//         this.isLoadingSubject.next(false);
//         return of(null);
//     }
// }

// eliminarRol(id: number) {
//     this.isLoadingSubject.next(true);

//     let token = this.authservice.obtenerToken();

//     if (token) {
//         let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//         return this.http.delete(`${this.rutaApi}/${id}`, { headers: headers }).pipe(
//             finalize(() => this.isLoadingSubject.next(false)),
//             catchError((error) => {
//                 console.error('Error en la solicitud', error);
//                 this.isLoadingSubject.next(false);
//                 return of(null);
//             })
//         );
//     } else {
//         console.log('Token no disponible');
//         this.isLoadingSubject.next(false);
//         return of(null);
//     }
// }


// }


@Injectable({
    providedIn: 'root'
  })
  export class RolesService {
    private rutaApi = `${environment.URL_SERVICIOS}/roles`;

    isLoading$: Observable<boolean>;
    isLoadingSubject: BehaviorSubject<boolean>;

    constructor(
      private http: HttpClient,
      public authservice: AuthService
    ) {
      this.isLoadingSubject = new BehaviorSubject<boolean>(false);
      this.isLoading$ = this.isLoadingSubject.asObservable();
    }

    // Obtener rol por ID
    getRoleById(id: number): Observable<any> {
        const token = this.authservice.obtenerToken();

        if (token) {
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

          return this.http.get<any>(`${this.rutaApi}/${id}`, { headers }).pipe(
            catchError((error) => {
              // Agregar manejo de errores más detallado
              console.error('Error en la solicitud al obtener el rol:', error);

              // Aquí podrías agregar un Toast para informar al usuario si ocurre un error
              // this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el rol.' });

              return of(null);  // Retorna null si hay un error
            })
          );
        } else {
          console.log('Token no disponible');
          return of(null); // Retorna null si no hay token
        }
      }


    // Registrar rol
    registrarRol(data: any) {
      this.isLoadingSubject.next(true);

      let token = this.authservice.obtenerToken();

      if (token) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(this.rutaApi, data, { headers }).pipe(
          finalize(() => this.isLoadingSubject.next(false)),
          catchError((error) => {
            console.error('Error en la solicitud', error);
            return of(null); // Devuelve un valor por defecto si hay error
          })
        );
      } else {
        console.log('Token no disponible');
        this.isLoadingSubject.next(false);
        return of(null); // Devuelve un valor por defecto si no hay token
      }
    }

    // Listar roles
    ListarRoles(page = 1, search: string = '') {
      this.isLoadingSubject.next(true);

      let headers = new HttpHeaders().set('Authorization', `Bearer ${this.authservice.obtenerToken()}`);
      let url = `${this.rutaApi}?page=${page}&search=${search}`;
      return this.http.get<any>(url, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false))
      );
    }

    // Actualizar rol
    actualizarRol(id: number, data: any) {
      this.isLoadingSubject.next(true);

      let token = this.authservice.obtenerToken();

      if (token) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.rutaApi}/${id}`, data, { headers }).pipe(
          finalize(() => this.isLoadingSubject.next(false)),
          catchError((error) => {
            console.error('Error en la solicitud', error);
            return of(null); // Devuelve un valor por defecto si hay error
          })
        );
      } else {
        console.log('Token no disponible');
        this.isLoadingSubject.next(false);
        return of(null); // Devuelve un valor por defecto si no hay token
      }
    }

    // Eliminar rol
    eliminarRol(id: number) {
      this.isLoadingSubject.next(true);

      let token = this.authservice.obtenerToken();

      if (token) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.rutaApi}/${id}`, { headers }).pipe(
          finalize(() => this.isLoadingSubject.next(false)),
          catchError((error) => {
            console.error('Error en la solicitud', error);
            return of(null); // Devuelve un valor por defecto si hay error
          })
        );
      } else {
        console.log('Token no disponible');
        this.isLoadingSubject.next(false);
        return of(null); // Devuelve un valor por defecto si no hay token
      }
    }


    updateRol(id: string, data: any) {
        this.isLoadingSubject.next(true);

        let token = this.authservice.obtenerToken();

        if (token) {
          let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          return this.http.put(`${this.rutaApi}/${id}`, data, { headers }).pipe(
            finalize(() => this.isLoadingSubject.next(false)),
            catchError((error) => {
              console.error('Error en la solicitud', error);
              return of(null); // Devuelve un valor por defecto si hay error
            })
          );
        } else {
          console.log('Token no disponible');
          this.isLoadingSubject.next(false);
          return of(null); // Devuelve un valor por defecto si no hay token
        }
      }
  }
