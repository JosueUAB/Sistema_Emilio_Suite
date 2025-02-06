// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  app_title: 'Emilio Suite',
  app_footer: '@Isra Dev 2025',
  api_backend: 'http://127.0.0.1:8000/api/auth',

  URL_BACKEND :'http://127.0.0.1:8000',
  URL_SERVICIOS:'http://127.0.0.1:8000/api',
  URL_fRONTEND:'http://127.0.0.1:4200',
  token: 'token',

}


export const SIDEBAR:any = [
    {
      'name': 'Configuración',
      'permisos': [
        { name: 'Editar configuración', permiso: 'editar_configuracion' },
        { name: 'Ver configuración', permiso: 'ver_configuracion' },
      ]
    },
    {
      'name': 'Habitaciones',
      'permisos': [
        { name: 'Registrar habitación', permiso: 'registrar_habitacion' },
        { name: 'Editar habitación', permiso: 'editar_habitacion' },
        { name: 'Eliminar habitación', permiso: 'eliminar_habitacion' },
        { name: 'Ver habitación', permiso: 'ver_habitacion' },
      ]
    },
    {
      'name': 'Huéspedes',
      'permisos': [
        { name: 'Registrar huésped', permiso: 'registrar_huesped' },
        { name: 'Editar huésped', permiso: 'editar_huesped' },
        { name: 'Eliminar huésped', permiso: 'eliminar_huesped' },
        { name: 'Ver huésped', permiso: 'ver_huesped' },
      ]
    },
    {
      'name': 'Ingresos y Egresos',
      'permisos': [
        { name: 'Registrar ingreso/egreso', permiso: 'registrar_ingreso_egreso' },
        { name: 'Ver ingreso/egreso', permiso: 'ver_ingreso_egreso' },
        { name: 'Editar ingreso/egreso', permiso: 'editar_ingreso_egreso' },
        { name: 'Eliminar ingreso/egreso', permiso: 'eliminar_ingreso_egreso' },
      ]
    },
    {
      'name': 'Recordatorios',
      'permisos': [
        { name: 'Registrar recordatorio', permiso: 'registrar_recordatorio' },
        { name: 'Ver recordatorio', permiso: 'ver_recordatorio' },
      ]
    },
    {
      'name': 'Reportes',
      'permisos': [
        { name: 'Ver reportes', permiso: 'ver_reportes' },
      ]
    },
    {
      'name': 'Reservas',
      'permisos': [
        { name: 'Registrar reserva', permiso: 'registrar_reserva' },
        { name: 'Editar reserva', permiso: 'editar_reserva' },
        { name: 'Eliminar reserva', permiso: 'eliminar_reserva' },
        { name: 'Ver reserva', permiso: 'ver_reserva' },
      ]
    },
    {
      'name': 'Parqueo',
      'permisos': [
        { name: 'Registrar espacio de parqueo', permiso: 'registrar_parqueo' },
        { name: 'Editar espacio de parqueo', permiso: 'editar_parqueo' },
        { name: 'Eliminar espacio de parqueo', permiso: 'eliminar_parqueo' },
        { name: 'Ver parqueo', permiso: 'ver_parqueo' },
      ]
    },
    {
      'name': 'Ventas',
      'permisos': [
        { name: 'Registrar venta', permiso: 'registrar_venta' },
        { name: 'Editar venta', permiso: 'editar_venta' },
        { name: 'Eliminar venta', permiso: 'eliminar_venta' },
        { name: 'Ver venta', permiso: 'ver_venta' },
      ]
    },
    {
      'name': 'Usuarios',
      'permisos': [
        { name: 'Registrar usuario', permiso: 'registrar_usuario' },
        { name: 'Editar usuario', permiso: 'editar_usuario' },
        { name: 'Eliminar usuario', permiso: 'eliminar_usuario' },
        { name: 'Ver usuario', permiso: 'ver_usuario' },
        { name: 'Asignar roles', permiso: 'asignar_roles' },
      ]
    },
];

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
