import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class Tipo_habitacionService {

  private rutaApi = `${environment.URL_SERVICIOS}/tipo_habitacion`; // Ruta API

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    public authservice: AuthService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // Listar tipos de habitación
  listarTipoHabitaciones(page = 1, search: string = ''): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const url = `${this.rutaApi}?page=${page}&search=${search}`;
      return this.http.get<any>(url, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => {
          console.error('Error al listar los tipos de habitación:', error);
          return of(null);
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener tipo de habitación por ID
  getTipoHabitacionById(id: number): Observable<any> {
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(`${this.rutaApi}/${id}`, { headers }).pipe(
        catchError((error) => {
          console.error('Error al obtener el tipo de habitación:', error);
          return of(null);
        })
      );
    } else {
      console.log('Token no disponible');
      return of(null);
    }
  }

  // Registrar tipo de habitación
  registrarTipoHabitacion(data: any): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();
  
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post(this.rutaApi, data, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al registrar el tipo de habitación:', error);
  
          // Verificar si el error es un 403 y si el mensaje está disponible en la respuesta del backend
          if (error.status === 403 && error.error && error.error.message) {
            // Retornar el mensaje específico del error del backend
            return throwError(() => new Error(error.error.message || 'Error desconocido'));
          }
          // Devolver un mensaje genérico en caso de otro error
          return throwError(() => new Error(error.message || 'Error en la solicitud al servidor'));
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }
  
  

  // Actualizar tipo de habitación
  actualizarTipoHabitacion(id: number, data: any): Observable<any> {
    this.isLoadingSubject.next(true); // Indicar que la solicitud está en progreso
    const token = this.authservice.obtenerToken();
  
    if (!token) {
      console.error('Token no disponible');
      this.isLoadingSubject.next(false); // Indicar que la solicitud ha terminado
      return throwError(() => new Error('Token no disponible'));
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.rutaApi}/${id}`;
  
    return this.http.put(url, data, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al actualizar el tipo de habitación:', error);
  
        // Verifica si es un error 403 y si existe un mensaje en el cuerpo del error
        if (error.status === 403 && error.error && error.error.message) {
          return throwError(() => new Error(error.error.message)); // Devuelve el mensaje del backend
        }
  
        return throwError(() => new Error(error.error.message || 'Error en la solicitud al servidor'));
      }),
      finalize(() => this.isLoadingSubject.next(false)) // Indicar que la solicitud ha terminado
    );
  }
  

  // Eliminar tipo de habitación
  eliminarTipoHabitacion(id: number): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.delete(`${this.rutaApi}/${id}`, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => {
          console.error('Error al eliminar el tipo de habitación:', error);
          return of(null);
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }
}
