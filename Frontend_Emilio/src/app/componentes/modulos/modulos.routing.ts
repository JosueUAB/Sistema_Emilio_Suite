import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


@NgModule({
    imports: [RouterModule.forChild([
        { path: 'configuracion', data: { breadcrumb: 'configuracion' }, loadChildren: () => import('./configuracion/configuracion.module').then(m => m.ConfiguracionModule) },
        { path: 'habitaciones', data: { breadcrumb: 'habitaciones' }, loadChildren: () => import('./habitaciones/habitaciones.module').then(m => m.HabitacionesModule) },
        { path: 'huespedes', data: { breadcrumb: 'huespedes' }, loadChildren: () => import('./huespedes/huespedes.module').then(m => m.HuespedesModule) },
        { path: 'ingresos-egresos', data: { breadcrumb: 'ingresos-egresos' }, loadChildren: () => import('./ingresos-egresos/ingresos-egresos.module').then(m => m.IngresosEgresosModule) },
        { path: 'recordatorios', data: { breadcrumb: 'recordatorios' }, loadChildren: () => import('./recordatorios/recordatorios.module').then(m => m.RecordatoriosModule) },
        { path: 'reportes', data: { breadcrumb: 'reportes' }, loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule) },
        { path: 'reservas', data: { breadcrumb: 'reservas' }, loadChildren: () => import('./reservas/reservas.module').then(m => m.ReservasModule) },
        { path: 'usuarios', data: { breadcrumb: 'usuarios' }, loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule) },
        { path: 'roles', data: { breadcrumb: 'roles' }, loadChildren: () => import('./roles/roles.module').then(m => m.RolesModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class ModulosRoutingModule { }
