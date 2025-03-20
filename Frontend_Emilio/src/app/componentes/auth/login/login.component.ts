import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'primeng/api';
import swall from 'sweetalert2'
import { environment } from 'src/environments/environment';
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
    ToastModule,
    ReactiveFormsModule


  ],

  templateUrl: './login.component.html',
  providers: [MessageService],
})
export class LoginComponent {

    img=environment.logo_dark;






    email: string = '';
    password: string = '';
    rememberMe: boolean = false;
    loginForm: FormGroup;

    constructor(private _authService: AuthService, private router: Router,
        private toast : MessageService,
        private fb: FormBuilder
    ) {}
    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
            rememberMe: [false]
          });
          const originalConsoleWarn = console.warn;
  console.warn = (message: any) => {
    if (typeof message === 'string' && message.includes('touchstart')) {
      return; // Suprimir la advertencia
    }
    originalConsoleWarn.apply(console, arguments);
  };

    }

    onSignIn() {
        if (this.loginForm.valid) {
          const { email, password } = this.loginForm.value;

          this._authService.acceso(email, password).subscribe({
            next: (data) => {
              console.log('Login successful', data);  // Imprime la respuesta completa

              if (data && data.access_token) {
                this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Bienvenido al Sistema' });
                swall.fire({
                  title: "Bienvenido al Sistema",
                  icon: "success",
                  draggable: true,
                  timer: 1000,
                  timerProgressBar: true,
                  showConfirmButton: false
                });

                this.router.navigate(['']); // Redirigir al dashboard
              } else {
                console.error('No access token received or invalid data.');
                this.toast.add({ severity: 'error', summary: 'Error', detail: 'Usuario o Contraseña Invalidos' });
              }
            },
            error: (err) => {
              console.error('Login failed', err);
            }
          });
        } else {
          console.error('Formulario no válido');
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor complete los campos correctamente' });
        }
      }


    //   onSubmit() {
    //     if (this.email && this.password) {
    //       this._authService.acceso(this.email, this.password).subscribe({
    //         next: (response: any) => {
    //           // Si la autenticación es exitosa
    //           if (response && response.access_token) {
    //             // Guardamos el token en sessionStorage
    //             sessionStorage.setItem('token', response.access_token);

    //             // Guardamos los datos del usuario (sin el campo email=> incorrecto)
    //             const user = {
    //               fullname: response.user.fullname,
    //               email: response.user.email // Corregido para que "email=>" sea solo "email"
    //             };

    //             // Guardamos el usuario en localStorage
    //             localStorage.setItem('user', JSON.stringify(user));

    //             // Si "remember me" está activado, guardar el email en localStorage
    //             if (this.rememberMe) {
    //               localStorage.setItem('email', this.email);
    //             }


    //             // Redirigimos al dashboard o página principal
    //             this.router.navigate(['/dashboard']);
    //           }
    //         },
    //         error: (err) => {
    //           console.error('Error during login:', err);
    //           alert('Login failed, please check your credentials.');
    //         }
    //       });
    //     } else {
    //       alert('Please fill in all fields.');
    //     }
    //   }

    onSubmit() {
        // Verificamos que el formulario sea válido
        if (this.loginForm.valid) {
          const { email, password, rememberMe } = this.loginForm.value;

          // Llamada al servicio de autenticación
          this._authService.acceso(email, password).subscribe({
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
                if (rememberMe) {
                  localStorage.setItem('email', email);
                }

                // Redirigimos al dashboard o página principal
                this.router.navigate(['/dashboard']);
              } else {
                console.error('No access token received or invalid data.');
                this.toast.add({ severity: 'error', summary: 'Error', detail: 'Usuario o Contraseña Invalidos' });
              }
            },
            error: (err) => {
              console.error('Error during login:', err);
              alert('Login failed, please check your credentials.');
            }
          });
        } else {
          // Si el formulario no es válido, mostramos un mensaje de error
          console.error('Formulario no válido');
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor complete los campos correctamente' });
        }
      }






}
