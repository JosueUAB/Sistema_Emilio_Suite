import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CobroService {
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

      // Concatenar la ruta completa correctamente
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

}
