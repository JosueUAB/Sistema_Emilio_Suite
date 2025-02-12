import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PasswordModule,
    InputTextModule,
    ButtonModule,
    ToastModule


  ],

  templateUrl: './login.component.html',
  providers: [MessageService],
})
export class LoginComponent {






    email: string = '';
    password: string = '';
    rememberMe: boolean = false;

    constructor(private _authService: AuthService, private router: Router,
        private toast : MessageService,
    ) {}

    onSignIn() {
        this._authService.acceso(this.email, this.password).subscribe({
          next: (data) => {
            console.log('Login successful', data);  // Imprime la respuesta completa


            if (data && data.access_token) {
                this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Bienvenido al Sistema' });
              this.router.navigate(['']); // Redirigir al dashboard
            } else {
              console.error('No access token received or invalid data.');
              this.toast.add({ severity: 'error', summary: 'Error', detail: 'Usuario o Contraseña Invalidos' });
            }
          },

          error: (err) => {
            console.error('Login failed', err);

        //     this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol eliminado con éxito' });
        //     this.listarRoles(); // Recargar los roles después de la eliminación
        //   } else {
        //     this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el rol' });
          }

        }
    );
      }



    // onSubmit() {
    //   if (this.email && this.password) {
    //     this.authService.acceso(this.email, this.password).subscribe({
    //       next: (response: any) => {
    //         // Guardamos el token en sessionStorage si la autenticación es exitosa
    //         if (response && response.token) {
    //           sessionStorage.setItem('token', response.token);
    //           if (this.rememberMe) {
    //             localStorage.setItem('email', this.email); // Guardar email si "remember me" está activado
    //           }
    //           this.router.navigate(['/dashboard']); // Redirige al dashboard o página de inicio
    //         }
    //       },
    //       error: (err) => {
    //         console.error('Error during login:', err);
    //         alert('Login failed, please check your credentials.');
    //       }
    //     });
    //   } else {
    //     alert('Please fill in all fields.');
    //   }
    // }
    onSubmit() {
        if (this.email && this.password) {
          this._authService.acceso(this.email, this.password).subscribe({
            next: (response: any) => {
              // Si la autenticación es exitosa
              if (response && response.access_token) {
                // Guardamos el token en sessionStorage
                sessionStorage.setItem('token', response.access_token);

                // Guardamos los datos del usuario (sin el campo email=> incorrecto)
                const user = {
                  fullname: response.user.fullname,
                  email: response.user.email // Corregido para que "email=>" sea solo "email"
                };

                // Guardamos el usuario en localStorage
                localStorage.setItem('user', JSON.stringify(user));

                // Si "remember me" está activado, guardar el email en localStorage
                if (this.rememberMe) {
                  localStorage.setItem('email', this.email);
                }


                // Redirigimos al dashboard o página principal
                this.router.navigate(['/dashboard']);
              }
            },
            error: (err) => {
              console.error('Error during login:', err);
              alert('Login failed, please check your credentials.');
            }
          });
        } else {
          alert('Please fill in all fields.');
        }
      }



}
