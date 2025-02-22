import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TarifasService {
  private rutaApi = `${environment.URL_SERVICIOS}/tarifas`;

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    public authservice: AuthService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // Listar tarifas
  listarTarifas(page = 1, search: string = ''): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const url = `${this.rutaApi}?page=${page}&search=${search}`;
      return this.http.get<any>(url, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => {
          console.error('Error en la solicitud al listar las tarifas:', error);
          return of(null);
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Obtener tarifa por ID
  getTarifaById(id: number): Observable<any> {
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(`${this.rutaApi}/${id}`, { headers }).pipe(
        catchError((error) => {
          console.error('Error en la solicitud al obtener la tarifa:', error);
          return of(null);
        })
      );
    } else {
      console.log('Token no disponible');
      return of(null);
    }
  }

  // Registrar tarifa
  
  registrarTarifa(data: any): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(this.rutaApi, data, { headers }).pipe(
            finalize(() => this.isLoadingSubject.next(false)),
            catchError((error: HttpErrorResponse) => {
                console.error('Error en la solicitud para registrar la tarifa:', error);
                // Aquí estamos verificando si el error es 403
                if (error.status === 403) {
                    // Si es el error 403, devolvemos el mensaje adecuado
                    return throwError(() => new Error('Este nombre de tarifa ya existe. Por favor elige otro.'));
                }
                // Si hay cualquier otro error, también se maneja
                return throwError(() => new Error(error.message || 'Error en la solicitud al servidor'));
            })
        );
    } else {
        console.log('Token no disponible');
        this.isLoadingSubject.next(false);
        return of(null);
    }
}

  // Actualizar tarifa
  actualizarTarifa(id: number, data: any): Observable<any> {
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
        console.error('Error en la solicitud para actualizar la tarifa:', error);
        
        // Devolver un objeto que contenga un mensaje de error específico
        return throwError(() => ({
          success: false,
          message: error.error.message || 'Error en la solicitud al servidor',
          message_text: error.error.message_text || 'Hubo un problema al actualizar la tarifa. Intenta nuevamente.',
          status: error.status,
        }));
      }),
      finalize(() => this.isLoadingSubject.next(false)) // Indicar que la solicitud ha terminado
    );
  }
  

  // Eliminar tarifa
  eliminarTarifa(id: number): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.delete(`${this.rutaApi}/${id}`, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => {
          console.error('Error en la solicitud al eliminar la tarifa:', error);
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
