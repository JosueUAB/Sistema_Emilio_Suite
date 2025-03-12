// import { OnInit } from '@angular/core';
// import { Component } from '@angular/core';
// import { LayoutService } from './service/app.layout.service';
// import { AuthService } from '../services/auth.service';

// @Component({
//     selector: 'app-menu',
//     templateUrl: './app.menu.component.html'
// })
// export class AppMenuComponent implements OnInit {

//     model: any[] = [];
//     user: any;

//     constructor(public layoutService: LayoutService,
//                         private _authservice: AuthService,
//     ) { }

//     ngOnInit() {


//         this.user=this._authservice.getUser();
//         this.model = [
//             {
//                 label: 'Home',
//                 items: [
//                     { label: 'Tablero', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
//                 ]
//             },
//             {
//                 label: 'Modulos',
//                 items: [
//                     { label: 'Habitaciones', icon: 'pi pi-fw pi-id-card', routerLink: ['/modulo/habitaciones'] },
//                     { label: 'Huespedes', icon: 'pi pi-fw pi-check-square', routerLink: ['/modulo/huespedes'] },
//                     { label: 'Reservas', icon: 'pi pi-fw pi-bookmark', routerLink: ['/modulo/reservas'] },
//                     { label: 'Recordatorios', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/modulo/recordatorios'] },
//                     { label: 'Ingresos/Egresos', icon: 'pi pi-fw pi-box', routerLink: ['/modulo/ingresos-egresos'] },
//                     { label: 'Reportes', icon: 'pi pi-fw pi-table', routerLink: ['/modulo/reportes'] },
//                     { label: 'Usuarios', icon: 'pi pi-fw pi-list', routerLink: ['/modulo/usuarios'] },
//                     { label: 'roles', icon: 'pi pi-fw pi-list', routerLink: ['/modulo/roles'] },
//                     { label: 'Configuracion', icon: 'pi pi-fw pi-cog', routerLink: ['/modulo/configuracion'] },

//                 ]
//             },


//         ];
//     }



//     showmenu(permisos:any){
//         let permissions= this.user.permissions;
//         let is_show=false;
//         permisos.forEach((permiso:any)=>{
//             if(permissions.includes(permiso)){
//                 is_show=true;

//             }
//         });
//         return is_show;
//     }
// }








import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../services/auth.service';

// Definimos la interfaz para los ítems del menú
interface MenuItem {
    label: string;
    icon: string;
    routerLink: string[];
    permisos?: string[]; // Esta propiedad es opcional
    roles?: string[]; // Esta propiedad es opcional para el caso de roles
    items?: MenuItem[]; // Agregamos la propiedad items para los submenús
}

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];
    user: any;

    constructor(public layoutService: LayoutService,
                private _authservice: AuthService) { }

    ngOnInit() {
        this.user = this._authservice.getUser();
        this.model = this.getMenuItems();
    }

    // Esta función genera el menú basado en los permisos y roles del usuario
    getMenuItems() {
        const menuItems: { label: string, items: MenuItem[] }[] = [  // Definimos el tipo adecuado para menuItems
            {
                label: 'Home',
                items: [
                    { label: 'Tablero', icon: 'pi pi-fw pi-home', routerLink: ['/'] } // No tiene permisos
                ]
            },
            {
                label: 'Modulos',
                items: [
                    { label: 'Habitaciones', icon: 'pi pi-fw pi-id-card', routerLink: ['/modulo/habitaciones'], permisos: ['registrar_habitacion', 'editar_habitacion', 'eliminar_habitacion', 'ver_habitacion'] },
                    { label: 'Huespedes', icon: 'pi pi-fw pi-check-square', routerLink: ['/modulo/huespedes'], permisos: ['registrar_huesped', 'editar_huesped', 'eliminar_huesped', 'ver_huesped'] },
                    // { label: 'Reservas', icon: 'pi pi-fw pi-bookmark', routerLink: ['/modulo/reservas'], permisos: ['registrar_reserva', 'editar_reserva', 'eliminar_reserva', 'ver_reserva'] },
                    {
                        label: 'Reservas',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: 'Administrar Reservas', icon: 'pi pi-fw pi-list', routerLink: ['/modulo/reservas/administrar-reservas'], permisos: ['registrar_reserva', 'editar_reserva', 'eliminar_reserva', 'ver_reserva'] },
                            { label: 'Check-In', icon: 'pi pi-fw pi-check', routerLink: ['/modulo/reservas/check-in'], permisos: ['registrar_reserva', 'ver_reserva'] },
                            { label: 'Check-Out', icon: 'pi pi-fw pi-sign-out', routerLink: ['/modulo/reservas/check-out'], permisos: ['registrar_reserva', 'ver_reserva'] }
                        ],
                        routerLink: ['/modulo/reservas'], // Ruta base para el módulo de reservas
                        permisos: ['registrar_reserva', 'editar_reserva', 'eliminar_reserva', 'ver_reserva']
                    },
                    { label: 'Recordatorios', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/modulo/recordatorios'], permisos: ['registrar_recordatorio', 'ver_recordatorio'] },
                    { label: 'ventas', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/modulo/ventas'], permisos: ['egistrar_venta', 'ver_venta'] },
                    { label: 'parqueo', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/modulo/parqueo'], permisos: ['registrar_parqueo', 'ver_parqueo'] },
                    { label: 'Ingresos/Egresos', icon: 'pi pi-fw pi-box', routerLink: ['/modulo/ingresos-egresos'], permisos: ['registrar_ingreso_egreso', 'ver_ingreso_egreso', 'editar_ingreso_egreso', 'eliminar_ingreso_egreso'] },
                    { label: 'Reportes', icon: 'pi pi-fw pi-table', routerLink: ['/modulo/reportes'], permisos: ['ver_reportes'] },
                    { label: 'Usuarios', icon: 'pi pi-fw pi-list', routerLink: ['/modulo/usuarios'], permisos: ['registrar_usuario', 'editar_usuario', 'eliminar_usuario', 'ver_usuario', 'asignar_roles'] },
                    {
                        label: 'Configuracion',
                        icon: 'pi pi-fw pi-cog',
                        items: [
                            { label: 'Tarifas', icon: 'pi pi-fw pi-dollar', routerLink: ['/modulo/configuracion/tarifas'], permisos: ['editar_tarifas', 'ver_tarifas'] },
                            { label: 'Descuentos', icon: 'pi pi-fw pi-dollar', routerLink: ['/modulo/configuracion/descuentos'], permisos: ['editar_descuentos', 'ver_descuentos'] },
                            { label: 'Tipos de Habitación', icon: 'pi pi-fw pi-home', routerLink: ['/modulo/configuracion/tipos-habitacion'], permisos: ['editar_tipos_habitacion', 'ver_tipos_habitacion'] }
                        ],
                        routerLink: ['/modulo/configuracion'],
                        permisos: ['editar_configuracion', 'ver_configuracion']
                         },

                ]

            }
        ];

        // Verificar si el usuario es Super-Admin y agregar el menú de Roles solo para él
        if (this.user.role_name === 'Super-Admin') {
            menuItems.push({
                label: 'Roles',
                items: [
                    { label: 'Roles', icon: 'pi pi-fw pi-list', routerLink: ['/modulo/roles'] }
                ]
            });
        }

        return menuItems.map(menu => {
            // Filtramos los items del menú según los permisos del usuario
            const filteredItems = menu.items.filter(item => {
                // Verifica si el item tiene permisos y si el usuario tiene acceso a alguno de ellos
                return item.permisos ? this.hasPermission(item.permisos) : true;
            });
            return { ...menu, items: filteredItems };
        });
    }

    // Esta función verifica si el usuario tiene al menos un permiso del array de permisos
    hasPermission(permisos: string[]): boolean {
        return permisos.some(permiso => this.user.permissions.includes(permiso));
    }
}
