import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
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

  // Crear una nueva reserva
//   registrarReserva(data: any): Observable<any> {
//     this.isLoadingSubject.next(true);
//     const token = this.authservice.obtenerToken();

//     if (token) {
//         const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//         return this.http.post<any>(this.rutaApi, data, { headers }).pipe(
//             tap(response => {
//                 console.log('Respuesta del servidor:', response);
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
registrarReserva(data: any): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<any>(this.rutaApi, data, { headers }).pipe(
            map(response => {
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

  // Manejo de errores global
  private manejarError(error: HttpErrorResponse, mensaje: string): Observable<never> {
    console.error(mensaje, error);
    if (error.error instanceof ErrorEvent) {
      // Error de cliente o conexión
      return throwError(() => new Error('Ocurrió un error en la conexión.'));
    } else {
      // Error del servidor
      if (error.status === 400) {
        return throwError(() => new Error('Datos incorrectos. Verifica la entrada.'));
      } else if (error.status === 404) {
        return throwError(() => new Error('Recurso no encontrado.'));
      } else if (error.status === 409) {
        return throwError(() => new Error('Conflicto con los datos proporcionados.'));
      } else if (error.status === 500) {
        return throwError(() => new Error('Error interno del servidor.'));
      }
      return throwError(() => new Error('Ocurrió un error inesperado.'));
    }
  }
}
