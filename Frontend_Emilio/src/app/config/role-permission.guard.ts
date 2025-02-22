import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Asegúrate de importar tu servicio de autenticación

// @Injectable({
//   providedIn: 'root'
// })
// export class RolePermissionGuard implements CanActivate {

//   constructor(private _authservice: AuthService, private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): boolean {

//     // Aquí puedes obtener el usuario desde el servicio de autenticación
//     const user = this._authservice.getUser();

//     // Verifica si el usuario es Super-Admin
//     if (user.role_name !== 'Super-Admin') {
//       this.router.navigate(['/unauthorized']); // Redirigir a una página de acceso no autorizado
//       return false;
//     }

//     // Si el usuario es Super-Admin, entonces verificamos los permisos
//     const requiredPermissions = next.data['permissions'] as string[];

//     // Verificar si el usuario tiene al menos uno de los permisos necesarios
//     if (requiredPermissions && requiredPermissions.some(permiso => user.permissions.includes(permiso))) {
//       return true; // Permitir acceso
//     } else {
//       this.router.navigate(['/unauthorized']); // Redirigir si no tiene permisos
//       return false; // Bloquear acceso
//     }
//   }
// }

@Injectable({
    providedIn: 'root'
  })
  export class RolePermissionGuard implements CanActivate {

    constructor(private _authservice: AuthService, private router: Router) {}

    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): boolean {

      const user = this._authservice.getUser();  // Obtiene el usuario desde el servicio
      console.log('rol asignado : ',user.role_name)

     
      if (user.role_name === 'Super-Admin') {
         // Redirige si no es Super-Admin
        return true;
      }

      // Si es Super-Admin, verifica los permisos
      const requiredPermissions = next.data['permissions'] as string[];

      // Verificar si el usuario tiene al menos uno de los permisos necesarios
      if (requiredPermissions && requiredPermissions.some(permiso => user.permissions.includes(permiso))) {
        return true;  // Permite el acceso si tiene permisos
      } else {
        this.router.navigate(['/unauthorized']);  // Redirige si no tiene permisos
        return false;  // Bloquea el acceso si no tiene permisos
      }
    }
  }
