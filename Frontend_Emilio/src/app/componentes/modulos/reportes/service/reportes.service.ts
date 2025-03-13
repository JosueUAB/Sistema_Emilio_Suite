import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private rutaApi = `${environment.URL_SERVICIOS}`;

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    public authservice: AuthService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // Obtener el monto total recaudado hoy
  obtenerCobroHoy(): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.get<any>(`${this.rutaApi}/cobroshoy`, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en la solicitud al obtener el cobro de hoy:', error);
          return throwError(() => new Error(error.message || 'Error en la solicitud al servidor'));
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener los reportes del dashboard
  obtenerReportesDashboard(): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.get<any>(`${this.rutaApi}/reportes-dashboard`, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en la solicitud al obtener los reportes del dashboard:', error);
          return throwError(() => new Error(error.message || 'Error en la solicitud al servidor'));
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener los huéspedes por nacionalidad
  obtenerHuespedesPorNacionalidad(): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.get<any>(`${this.rutaApi}/huespedes-por-nacionalidad`, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en la solicitud al obtener los huéspedes por nacionalidad:', error);
          return throwError(() => new Error(error.message || 'Error en la solicitud al servidor'));
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener clientes e ingresos diarios
  obtenerClientesPorDiaYIngresosDiarios(): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.get<any>(`${this.rutaApi}/clientes-ingresos-diarios`, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en la solicitud al obtener clientes e ingresos diarios:', error);
          return throwError(() => new Error(error.message || 'Error en la solicitud al servidor'));
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener clientes e ingresos semanales
  obtenerClientesPorSemanaYIngresosMensuales(): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      return this.http.get<any>(`${this.rutaApi}/clientes-ingresos-mensuales`, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en la solicitud al obtener clientes e ingresos semanales:', error);
          return throwError(() => new Error(error.message || 'Error en la solicitud al servidor'));
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }
}
