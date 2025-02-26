import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HuespedService {
  private rutaApi = `${environment.URL_SERVICIOS}/huesped`;

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    public authservice: AuthService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // Listar huéspedes
  listarHuespedes(page = 1, search: string = ''): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const url = `${this.rutaApi}?page=${page}&search=${search}`;
      return this.http.get<any>(url, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => {
          console.error('Error en la solicitud al listar los huéspedes:', error);
          return of(null); // Devuelve null en caso de error
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener huésped por ID
  getHuespedById(id: number): Observable<any> {
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(`${this.rutaApi}/${id}`, { headers }).pipe(
        catchError((error) => {
          console.error('Error en la solicitud al obtener el huésped:', error);
          return of(null); // Devuelve null si ocurre un error
        })
      );
    } else {
      console.log('Token no disponible');
      return of(null);
    }
  }


registrarHuesped(data: any): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post(this.rutaApi, data, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en la solicitud para registrar el huésped:', error);

          // Propaga el error completo para que el componente pueda acceder a error.error.msg
          return throwError(() => error);
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }


  // Actualizar huésped
  actualizarHuesped(id: number, data: any): Observable<any> {
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
        console.error('Error en la solicitud para actualizar el huésped:', error);

        // Propagar el error completo para que el componente pueda acceder a error.error.msg
        return throwError(() => error);
      }),
      finalize(() => this.isLoadingSubject.next(false)) // Indicar que la solicitud ha terminado
    );
  }

  // Eliminar huésped
  eliminarHuesped(id: number): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.delete(`${this.rutaApi}/${id}`, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => {
          console.error('Error en la solicitud al eliminar el huésped:', error);
          return of(null); // Retornar null si hay un error
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }
}
