import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private rutaApi = `${environment.URL_SERVICIOS}/users`;

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    public authservice: AuthService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // Obtener usuario por ID
  getUsuarioById(id: number): Observable<any> {
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(`${this.rutaApi}/${id}`, { headers }).pipe(
        catchError((error) => {
          console.error('Error en la solicitud al obtener el usuario:', error);
          return of(null);
        })
      );
    } else {
      console.log('Token no disponible');
      return of(null);
    }
  }

  // Registrar usuario
  registrarUsuario(data: any): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post(this.rutaApi, data, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => {
          console.error('Error en la solicitud', error);
          return of(null);
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }

  // Listar usuarios
  listarUsuarios(page = 1, search: string = ''): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const url = `${this.rutaApi}?page=${page}&search=${search}`;
      return this.http.get<any>(url, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return of(null);
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null);
    }
  }


 // Actualizar usuario utilizando el método POST
 actualizarUsuario(id: number, data: any): Observable<any> {
  this.isLoadingSubject.next(true); // Indicar que la solicitud está en progreso
  const token = this.authservice.obtenerToken();

  if (!token) {
    console.error('Token no disponible');
    this.isLoadingSubject.next(false); // Indicar que la solicitud ha terminado
    return throwError(() => new Error('Token no disponible'));
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.rutaApi}/${id}`; // Construye la URL

  console.log('URL de la solicitud:', url); // Verifica la URL en la consola

  // Si los datos contienen una imagen, usar FormData
  let formData = new FormData();
  for (let key in data) {
    formData.append(key, data[key]);
  }

  // Usamos el método POST, ya que en el backend estás usando POST para actualizar
  return this.http.post(url, formData, { headers }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error en la solicitud:', error);
      return throwError(() => ({
        success: false,
        message: error.message || 'Error en la solicitud al servidor',
      }));
    }),
    finalize(() => this.isLoadingSubject.next(false)) // Indicar que la solicitud ha terminado
  );
}







  // Eliminar usuario
  eliminarUsuario(id: number): Observable<any> {
    this.isLoadingSubject.next(true);
    const token = this.authservice.obtenerToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.delete(`${this.rutaApi}/${id}`, { headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => {
          console.error('Error en la solicitud', error);
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
