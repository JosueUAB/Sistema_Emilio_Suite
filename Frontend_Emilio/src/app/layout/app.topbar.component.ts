import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { environment } from "src/environments/environment";
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../services/auth.service';
@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent {

    items!: MenuItem[];

    fullname: string = '';
    email: string = '';
    avatar: string = '';
    role:string = '';
    valores: MenuItem[] | undefined;
    private_logo_dark:string= environment.logo_dark;
    private_logo_white:string= environment.logo_white;

    titulo_aplicacion:string=environment.app_title;

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService,
                private _authService: AuthService
    ) { }

    ngOnInit(): void {
       this.cargarUsuario();
        this.valores = [
            {
                label: 'Opciones',
                items: [
                    {
                        label: 'Configuracion',
                        icon: 'pi pi-cog'
                    },
                    {
                        label: 'perfil',
                        icon: 'pi pi-user-edit'
                    },
                    {
                        label: 'salir',
                        icon: 'pi pi-sign-out',
                        command:()=>this.cerrarSesion()
                    }
                ]
            }
        ];
    }

    cargarUsuario(): void {
        // Acceder al valor almacenado en localStorage
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          // Parsear el JSON y asignar los valores a las variables
          const user = JSON.parse(storedUser);
          this.fullname = user.fullname;
          this.email = user.email;
          this.avatar = user.avatar;
          this.role = user.role_name;
          console.log(this.avatar)
        }
      }

      //** cerrar sesion */
      cerrarSesion(){
        this._authService.cerrarSesion();
      }



}
