import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RolePermissionGuard } from 'src/app/config/role-permission.guard';


// @NgModule({
//     imports: [RouterModule.forChild([
//         { path: 'configuracion', data: { breadcrumb: 'configuracion' }, loadChildren: () => import('./configuracion/configuracion.module').then(m => m.ConfiguracionModule) },
//         { path: 'habitaciones', data: { breadcrumb: 'habitaciones' }, loadChildren: () => import('./habitaciones/habitaciones.module').then(m => m.HabitacionesModule) },
//         { path: 'huespedes', data: { breadcrumb: 'huespedes' }, loadChildren: () => import('./huespedes/huespedes.module').then(m => m.HuespedesModule) },
//         { path: 'ingresos-egresos', data: { breadcrumb: 'ingresos-egresos' }, loadChildren: () => import('./ingresos-egresos/ingresos-egresos.module').then(m => m.IngresosEgresosModule) },
//         { path: 'recordatorios', data: { breadcrumb: 'recordatorios' }, loadChildren: () => import('./recordatorios/recordatorios.module').then(m => m.RecordatoriosModule) },
//         { path: 'reportes', data: { breadcrumb: 'reportes' }, loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule) },
//         { path: 'reservas', data: { breadcrumb: 'reservas' }, loadChildren: () => import('./reservas/reservas.module').then(m => m.ReservasModule) },
//         { path: 'usuarios', data: { breadcrumb: 'usuarios' }, loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule) },
//         { path: 'roles', data: { breadcrumb: 'roles' }, loadChildren: () => import('./roles/roles.module').then(m => m.RolesModule) },
//         { path: '**', redirectTo: '/notfound' }
//     ])],
//     exports: [RouterModule]
// })


@NgModule({
    imports: [RouterModule.forChild([
        {
            path: 'configuracion',
            data: { breadcrumb: 'configuracion', permissions: ['editar_configuracion', 'ver_configuracion'] },  // Agrega permisos aquí
            loadChildren: () => import('./configuracion/configuracion.module').then(m => m.ConfiguracionModule),
            canActivate: [RolePermissionGuard]  // Aplica el guard aquí
        },
        {
            path: 'habitaciones',
            data: { breadcrumb: 'habitaciones', permissions: ['registrar_habitacion', 'editar_habitacion', 'ver_habitacion'] },
            loadChildren: () => import('./habitaciones/habitaciones.module').then(m => m.HabitacionesModule),
            canActivate: [RolePermissionGuard]
        },
        {
            path: 'huespedes',
            data: { breadcrumb: 'huespedes', permissions: ['registrar_huesped', 'editar_huesped', 'ver_huesped'] },
            loadChildren: () => import('./huespedes/huespedes.module').then(m => m.HuespedesModule),
            canActivate: [RolePermissionGuard]
        },
        {
            path: 'ingresos-egresos',
            data: { breadcrumb: 'ingresos-egresos', permissions: ['registrar_ingreso_egreso', 'ver_ingreso_egreso'] },
            loadChildren: () => import('./ingresos-egresos/ingresos-egresos.module').then(m => m.IngresosEgresosModule),
            canActivate: [RolePermissionGuard]
        },
        {
            path: 'recordatorios',
            data: { breadcrumb: 'recordatorios', permissions: ['registrar_recordatorio', 'ver_recordatorio'] },
            loadChildren: () => import('./recordatorios/recordatorios.module').then(m => m.RecordatoriosModule),
            canActivate: [RolePermissionGuard]
        },
        {
            path: 'reportes',
            data: { breadcrumb: 'reportes', permissions: ['ver_reportes'] },
            loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule),
            canActivate: [RolePermissionGuard]
        },
        {
            path: 'reservas',
            data: { breadcrumb: 'reservas', permissions: ['registrar_reserva', 'ver_reserva'] },
            loadChildren: () => import('./reservas/reservas.module').then(m => m.ReservasModule),
            canActivate: [RolePermissionGuard]
        },
        {
            path: 'usuarios',
            data: { breadcrumb: 'usuarios', permissions: ['registrar_usuario', 'ver_usuario', 'editar_usuario'] },
            loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule),
            canActivate: [RolePermissionGuard]
        },
        {
            path: 'ventas',
            data: { breadcrumb: 'ventas', permissions: ['ver_venta', 'editar_venta'] },
            loadChildren: () => import('./ventas/ventas.module').then(m => m.VentasModule),
            canActivate: [RolePermissionGuard]
        },
        {
            path: 'parqueo',
            data: { breadcrumb: 'parqueo', permissions: ['ver_parqueo', 'editar_parqueo'] },
            loadChildren: () => import('./parqueo/parqueo.module').then(m => m.ParqueoModule),
            canActivate: [RolePermissionGuard]
        },
        {
            path: 'roles',
            data: { breadcrumb: 'roles', permissions: ['ver_roles', 'editar_roles'] },
            loadChildren: () => import('./roles/roles.module').then(m => m.RolesModule),
            canActivate: [RolePermissionGuard]
        },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})





export class ModulosRoutingModule { }
