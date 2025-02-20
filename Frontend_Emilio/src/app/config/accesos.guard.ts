import { Injectable } from '@angular/core';
import type { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
    router: any;

    constructor(private  _authservice: AuthService){}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this._authservice.obtenerUsuario();
        const currentUserToken = this._authservice.obtenerToken();

        console.log('Revisando token...');

        // Si no hay un usuario o un token, cerrar sesión y redirigir al login
        if (!currentUser || !currentUserToken) {
            console.log('No hay token o usuario, cerrando sesión...');
            this._authservice.cerrarSesion();  // Esto debería limpiar la sesión
            this.router.navigate(['/login']);  // Redirige a login
            return false;  // Esto evita la navegación a la ruta protegida
        }

        let token = currentUserToken;  // Usamos el token obtenido del servicio
        if (!token) {
            // Si el token es null o no existe, cerrar sesión
            console.log('Token no existe, cerrando sesión...');
            this._authservice.cerrarSesion();
            this.router.navigate(['/login']);  // Redirige a login
            return false;  // Evitar navegación
        }

        let expiresIn = (JSON.parse(atob(token.split('.')[1]))).exp;

        // Verificar si el token ha expirado
        if (Math.floor(new Date().getTime() / 1000) >= expiresIn) {
            // Si ha expirado, cerrar sesión
            console.log('Token ha expirado, cerrando sesión...');
            this._authservice.cerrarSesion();
            this.router.navigate(['/login']);  // Redirige a login
            return false;  // Evitar navegación
        }

        return true;  // Permitir la navegación si todo es correcto
    }



}
