// import { Injectable } from '@angular/core';
// import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
// import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
// import { catchError, finalize, map, tap } from 'rxjs/operators';
// import { environment } from 'src/environments/environment';
// import { AuthService } from 'src/app/services/auth.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class ReservasService {
//   private rutaApi = `${environment.URL_SERVICIOS}/reserva`;

//   isLoading$: Observable<boolean>;
//   isLoadingSubject: BehaviorSubject<boolean>;

//   constructor(private http: HttpClient, private authservice: AuthService) {
//     this.isLoadingSubject = new BehaviorSubject<boolean>(false);
//     this.isLoading$ = this.isLoadingSubject.asObservable();
//   }

//   // Obtener todas las reservas
//   obtenerReservas(): Observable<any> {
//     this.isLoadingSubject.next(true);
//     const token = this.authservice.obtenerToken();

//     if (token) {
//       const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//       return this.http.get<any>(this.rutaApi, { headers }).pipe(
//         finalize(() => this.isLoadingSubject.next(false)),
//         catchError((error) => this.manejarError(error, 'Error al obtener las reservas'))
//       );
//     } else {
//       console.log('Token no disponible');
//       this.isLoadingSubject.next(false);
//       return of(null);
//     }
//   }

//   // Obtener una reserva por su ID
//   obtenerReservaPorId(id: number): Observable<any> {
//     const token = this.authservice.obtenerToken();

//     if (token) {
//       const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//       return this.http.get<any>(`${this.rutaApi}/${id}`, { headers }).pipe(
//         catchError((error) => this.manejarError(error, 'Error al obtener la reserva'))
//       );
//     } else {
//       console.log('Token no disponible');
//       return of(null);
//     }
//   }

// registrarReserva(data: any): Observable<any> {
//     this.isLoadingSubject.next(true);
//     const token = this.authservice.obtenerToken();

//     if (token) {
//         const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//         return this.http.post<any>(this.rutaApi, data, { headers }).pipe(
//             map(response => {
//                 // Asegúrate de que la respuesta tenga la estructura esperada
//                 if (response && response.status && response.detalles_pago) {
//                     return response;
//                 } else {
//                     throw new Error('Respuesta del servidor no válida');
//                 }
//             }),
//             finalize(() => this.isLoadingSubject.next(false)),
//             catchError((error) => this.manejarError(error, 'Error al crear la reserva'))
//         );
//     } else {
//         console.log('Token no disponible');
//         this.isLoadingSubject.next(false);
//         return of(null);
//     }
// }
//   // Actualizar una reserva
//   actualizarReserva(id: number, data: any): Observable<any> {
//     this.isLoadingSubject.next(true);
//     const token = this.authservice.obtenerToken();

//     if (token) {
//       const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//       return this.http.put<any>(`${this.rutaApi}/${id}`, data, { headers }).pipe(
//         finalize(() => this.isLoadingSubject.next(false)),
//         catchError((error) => this.manejarError(error, 'Error al actualizar la reserva'))
//       );
//     } else {
//       console.log('Token no disponible');
//       this.isLoadingSubject.next(false);
//       return of(null);
//     }
//   }

//   // Eliminar una reserva
//   eliminarReserva(id: number): Observable<any> {
//     this.isLoadingSubject.next(true);
//     const token = this.authservice.obtenerToken();

//     if (token) {
//       const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//       return this.http.delete<any>(`${this.rutaApi}/${id}`, { headers }).pipe(
//         finalize(() => this.isLoadingSubject.next(false)),
//         catchError((error) => this.manejarError(error, 'Error al eliminar la reserva'))
//       );
//     } else {
//       console.log('Token no disponible');
//       this.isLoadingSubject.next(false);
//       return of(null);
//     }
//   }

//    // Check-in de reserva
//    checkin(id: number): Observable<any> {
//     this.isLoadingSubject.next(true);
//     const token = this.authservice.obtenerToken();
//     if (token) {
//       const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//       return this.http.post<any>(`${this.rutaApi}/checkin/${id}`, {}, { headers }).pipe(
//         finalize(() => this.isLoadingSubject.next(false)),
//         catchError((error) => this.manejarError(error, 'Error al realizar el check-in'))
//       );
//     } else {
//       console.log('Token no disponible');
//       this.isLoadingSubject.next(false);
//       return of(null);
//     }
//   }

//   // Check-in directo
//   checkinDirecto(data: any): Observable<any> {
//     this.isLoadingSubject.next(true);
//     const token = this.authservice.obtenerToken();
//     if (token) {
//       const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//       return this.http.post<any>(`${this.rutaApi}/checkin-directo`, data, { headers }).pipe(
//         finalize(() => this.isLoadingSubject.next(false)),
//         catchError((error) => this.manejarError(error, 'Error al realizar el check-in directo'))
//       );
//     } else {
//       console.log('Token no disponible');
//       this.isLoadingSubject.next(false);
//       return of(null);
//     }
//   }

//   // Checkout de reserva
//   checkout(id: number): Observable<any> {
//     this.isLoadingSubject.next(true);
//     const token = this.authservice.obtenerToken();
//     if (token) {
//       const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//       return this.http.post<any>(`${this.rutaApi}/checkout/${id}`, {}, { headers }).pipe(
//         finalize(() => this.isLoadingSubject.next(false)),
//         catchError((error) => this.manejarError(error, 'Error al realizar el check-out'))
//       );
//     } else {
//       console.log('Token no disponible');
//       this.isLoadingSubject.next(false);
//       return of(null);
//     }
//   }

//   // Manejo de errores global
//   private manejarError(error: HttpErrorResponse, mensaje: string): Observable<never> {
//     console.error(mensaje, error);
//     if (error.error instanceof ErrorEvent) {
//       // Error de cliente o conexión
//       return throwError(() => new Error('Ocurrió un error en la conexión.'));
//     } else {
//       // Error del servidor
//       if (error.status === 400) {
//         return throwError(() => new Error('Datos incorrectos. Verifica la entrada.'));
//       } else if (error.status === 404) {
//         return throwError(() => new Error('Recurso no encontrado.'));
//       } else if (error.status === 409) {
//         return throwError(() => new Error('Conflicto con los datos proporcionados.'));
//       } else if (error.status === 500) {
//         return throwError(() => new Error('Error interno del servidor.'));
//       }
//       return throwError(() => new Error('Ocurrió un error inesperado.'));
//     }
//   }
// }


import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private rutaApi = `${environment.URL_SERVICIOS}/reserva`;

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(private http: HttpClient, private authservice: AuthService) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // Obtener todas las reservas
  obtenerReservas(): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(this.rutaApi, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al obtener las reservas'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener una reserva por su ID
  obtenerReservaPorId(id: number): Observable<any> {
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(`${this.rutaApi}/${id}`, { headers }).pipe(
        catchError((error) => this.manejarError(error, 'Error al obtener la reserva'))
      );
    } else {
      console.log('Token no disponible');
      return of(null);
    }
  }

  // Registrar una nueva reserva
  registrarReserva(data: any): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(this.rutaApi, data, { headers }).pipe(
        map((response) => {
          // Asegúrate de que la respuesta tenga la estructura esperada
          if (response && response.status && response.detalles_pago) {
            return response;
          } else {
            throw new Error('Respuesta del servidor no válida');
          }
        }),
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al crear la reserva'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Actualizar una reserva
  actualizarReserva(id: number, data: any): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.put<any>(`${this.rutaApi}/${id}`, data, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al actualizar la reserva'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Eliminar una reserva
  eliminarReserva(id: number): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.delete<any>(`${this.rutaApi}/${id}`, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al eliminar la reserva'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

 // Método para obtener habitaciones disponibles entre fechas
 obtenerHabitacionesDisponibles(fechaInicio: string, fechaFin: string): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.rutaApi}/habitaciones-disponibles`, { fecha_inicio: fechaInicio, fecha_fin: fechaFin }, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al obtener habitaciones disponibles'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener reservas por fecha
  obtenerReservasPorFecha(fecha: string): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.rutaApi}/reservas-por-fecha`, { fecha }, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al obtener las reservas por fecha'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener reservas para hoy y mañana
  obtenerReservasParaHoyYManana(): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.rutaApi}/reservas-para-hoy-manana`, {}, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al obtener las reservas para hoy y mañana'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener habitaciones ocupadas para checkout
  obtenerHabitacionesOcupadasParaCheckout(): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.rutaApi}/habitaciones-para-checkout`, {}, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al obtener habitaciones ocupadas para checkout'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Listar habitaciones disponibles hoy
  listarHabitacionesDisponiblesHoy(): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.rutaApi}/listarHabitaciones-disponibles-hoy`, {}, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al listar habitaciones disponibles hoy'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Check-in de reserva
//   checkin(id: number): Observable<any> {
//     this.isLoadingSubject.next(true);
//     const token = this.authservice.obtenerToken();
//     if (token) {
//       const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//       return this.http.post<any>(`${this.rutaApi}/checkin/${id}`, {}, { headers }).pipe(
//         finalize(() => this.isLoadingSubject.next(false)),
//         catchError((error) => this.manejarError(error, 'Error al realizar el check-in'))
//       );
//     } else {
//       console.log('Token no disponible');
//       this.isLoadingSubject.next(false);
//       return of(null);
//     }
//   }
checkin(id: number): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.rutaApi}/checkin/${id}`, {}, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al realizar el check-in')) // Aquí pasas el mensaje adicional
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }



  // Check-in directo
  checkinDirecto(data: any): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.rutaApi}/checkin-directo`, data, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al realizar el check-in directo'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Checkout de reserva
  checkout(id: number): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.rutaApi}/checkout/${id}`, {}, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al realizar el check-out'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }
  // En ReservasService

obtenerReservaPendienteHoyPorId(habitacionId: number): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.rutaApi}/obtener-reserva-id-habitacion/${habitacionId}`, {}, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => this.manejarError(error, 'Error al obtener la reserva pendiente para la habitación'))
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }


  // Manejo de errores global
//   private manejarError(error: HttpErrorResponse, mensaje: string): Observable<never> {
//     console.error(mensaje, error);
//     let errorMessage = 'Ocurrió un error inesperado.';
//     if (error.error instanceof ErrorEvent) {
//       // Error de cliente o conexión
//       errorMessage = 'Ocurrió un error en la conexión.';
//     } else {
//       // Error del servidor
//       switch (error.status) {
//         case 400:
//           errorMessage = 'Datos incorrectos. Verifica la entrada.';
//           break;
//         case 404:
//           errorMessage = 'Recurso no encontrado.';
//           break;
//         case 409:
//           errorMessage = 'Conflicto con los datos proporcionados.';
//           break;
//         case 500:
//           errorMessage = 'Error interno del servidor.';
//           break;
//       }
//     }
//     return throwError(() => new Error(errorMessage));
//   }
private manejarError(error: HttpErrorResponse, mensaje: string): Observable<never> {
    console.error(mensaje, error);
    let errorMessage = 'Ocurrió un error inesperado.';

    if (error.error instanceof ErrorEvent) {
      // Error de cliente o conexión
      errorMessage = 'Ocurrió un error en la conexión.';
    } else {
      // Error del servidor
      if (error.error && error.error.mensaje) {
        errorMessage = error.error.mensaje; // Mensaje específico del error
      } else {
        // Mensaje genérico basado en el código de estado
        switch (error.status) {
          case 400:
            errorMessage = 'Datos incorrectos. Verifica la entrada.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 409:
            errorMessage = 'Conflicto con los datos proporcionados.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor.';
            break;
          default:
            errorMessage = 'Ocurrió un error inesperado.';
            break;
        }
      }
    }

    // Puedes incluir el código de estado en el mensaje si lo deseas
    errorMessage += ` (Código de estado: ${error.status})`;

    return throwError(() => new Error(errorMessage));
  }

  // Completar el pago de una reserva
  completarPago(pagoId: number, montoPagado: number, metodoDePago: string): Observable<any> {
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const body = {
        monto_pagado: montoPagado,
        metodo_de_pago: metodoDePago,
      };

      return this.http.post<any>(`${this.rutaApi}/completar-pago/${pagoId}`, body, { headers }).pipe(
        catchError((error) => this.manejarError(error, 'Error al completar el pago'))
      );
    } else {
      console.log('Token no disponible');
      return of(null);
    }
  }
}
