import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
    private rutaApi = `${environment.URL_SERVICIOS}/roles`;

    isLoading$: Observable<boolean>;
    isLoadingSubject: BehaviorSubject<boolean>;

    constructor(
      private http: HttpClient,
      public authservice: AuthService,
    ) {
      this.isLoadingSubject = new BehaviorSubject<boolean>(false);
      this.isLoading$ = this.isLoadingSubject.asObservable();
    }



registrarRol(data: any) {
    this.isLoadingSubject.next(true);

    let token = this.authservice.obtenerToken();

    if (token) {
      console.log('Token:', token);

      let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      console.log('Headers:', headers);

      return this.http.post(this.rutaApi, data, { headers: headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false)),
        catchError((error) => {
          console.error('Error en la solicitud', error);
          this.isLoadingSubject.next(false); // Finaliza la carga incluso si hay error
          return of(null); // Devuelve un valor por defecto si hay error
        })
      );
    } else {
      console.log('Token no disponible');
      this.isLoadingSubject.next(false);
      return of(null); // Devuelve un valor por defecto si no hay token
    }
  }
  //* obtener roles  **//

  ListarRoles(page=1,search:string='')
  {
    this.isLoadingSubject.next(true);

    let headers = new HttpHeaders().set('Authorization', `Bearer ${this.authservice.obtenerToken()}`);
    let url = `${this.rutaApi}?page=${page}&search=${search}`;
    return this.http.get<any>(url, { headers: headers }).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );

  }


  actualizarRol(id: number, data: any) {
    this.isLoadingSubject.next(true);

    let token = this.authservice.obtenerToken();

    if (token) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.rutaApi}/${id}`, data, { headers: headers }).pipe(
            finalize(() => this.isLoadingSubject.next(false)),
            catchError((error) => {
                console.error('Error en la solicitud', error);
                this.isLoadingSubject.next(false);
                return of(null);
            })
        );
    } else {
        console.log('Token no disponible');
        this.isLoadingSubject.next(false);
        return of(null);
    }
}

eliminarRol(id: number) {
    this.isLoadingSubject.next(true);

    let token = this.authservice.obtenerToken();

    if (token) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.rutaApi}/${id}`, { headers: headers }).pipe(
            finalize(() => this.isLoadingSubject.next(false)),
            catchError((error) => {
                console.error('Error en la solicitud', error);
                this.isLoadingSubject.next(false);
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
