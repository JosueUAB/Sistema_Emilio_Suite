import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PasswordModule,
    InputTextModule,
    ButtonModule


  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {






    email: string = '';
    password: string = '';
    rememberMe: boolean = false;

    constructor(private _authService: AuthService, private router: Router) {}

    onSignIn() {
        this._authService.acceso(this.email, this.password).subscribe({
          next: (data) => {
            console.log('Login successful', data);  // Imprime la respuesta completa

            if (data && data.access_token) {
              this.router.navigate(['']); // Redirigir al dashboard
            } else {
              console.error('No access token received or invalid data.');
            }
          },
          error: (err) => {
            console.error('Login failed', err);
          }
        });
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
