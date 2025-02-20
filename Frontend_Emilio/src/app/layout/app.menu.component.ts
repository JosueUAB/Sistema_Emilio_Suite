import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];
    user: any;

    constructor(public layoutService: LayoutService,
                        private _authservice: AuthService,
    ) { }

    ngOnInit() {


        this.user=this._authservice.getUser();
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Tablero', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                ]
            },
            {
                label: 'Modulos',
                items: [
                    { label: 'Habitaciones', icon: 'pi pi-fw pi-id-card', routerLink: ['/modulo/habitaciones'] },
                    { label: 'Huespedes', icon: 'pi pi-fw pi-check-square', routerLink: ['/modulo/huespedes'] },
                    { label: 'Reservas', icon: 'pi pi-fw pi-bookmark', routerLink: ['/modulo/reservas'] },
                    { label: 'Recordatorios', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/modulo/recordatorios'] },
                    { label: 'Ingresos/Egresos', icon: 'pi pi-fw pi-box', routerLink: ['/modulo/ingresos-egresos'] },
                    { label: 'Reportes', icon: 'pi pi-fw pi-table', routerLink: ['/modulo/reportes'] },
                    { label: 'Usuarios', icon: 'pi pi-fw pi-list', routerLink: ['/modulo/usuarios'] },
                    { label: 'roles', icon: 'pi pi-fw pi-list', routerLink: ['/modulo/roles'] },
                    { label: 'Configuracion', icon: 'pi pi-fw pi-cog', routerLink: ['/modulo/configuracion'] },

                ]
            },

        
        ];
    }



    showmenu(permisos:any){
        let permissions= this.user.permissions;
        let is_show=false;
        permisos.forEach((permiso:any)=>{
            if(permissions.includes(permiso)){
                is_show=true;

            }
        });
        return is_show;
    }
}
