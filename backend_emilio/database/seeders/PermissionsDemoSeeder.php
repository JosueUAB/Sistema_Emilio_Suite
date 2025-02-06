<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionsDemoSeeder extends Seeder
{
    /**
     * Create the initial roles and permissions.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        Permission::create(['guard_name' => 'api', 'name' => 'editar_configuracion']);
        Permission::create(['guard_name' => 'api', 'name' => 'ver_configuracion']);

        Permission::create(['guard_name' => 'api', 'name' => 'registrar_habitacion']);
        Permission::create(['guard_name' => 'api', 'name' => 'editar_habitacion']);
        Permission::create(['guard_name' => 'api', 'name' => 'eliminar_habitacion']);
        Permission::create(['guard_name' => 'api', 'name' => 'ver_habitacion']);

        Permission::create(['guard_name' => 'api', 'name' => 'registrar_huesped']);
        Permission::create(['guard_name' => 'api', 'name' => 'editar_huesped']);
        Permission::create(['guard_name' => 'api', 'name' => 'eliminar_huesped']);
        Permission::create(['guard_name' => 'api', 'name' => 'ver_huesped']);

        Permission::create(['guard_name' => 'api', 'name' => 'registrar_ingreso_egreso']);
        Permission::create(['guard_name' => 'api', 'name' => 'ver_ingreso_egreso']);
        Permission::create(['guard_name' => 'api', 'name' => 'editar_ingreso_egreso']);
        Permission::create(['guard_name' => 'api', 'name' => 'eliminar_ingreso_egreso']);

        Permission::create(['guard_name' => 'api', 'name' => 'registrar_recordatorio']);
        Permission::create(['guard_name' => 'api', 'name' => 'ver_recordatorio']);

        Permission::create(['guard_name' => 'api', 'name' => 'ver_reportes']);

        Permission::create(['guard_name' => 'api', 'name' => 'registrar_reserva']);
        Permission::create(['guard_name' => 'api', 'name' => 'editar_reserva']);
        Permission::create(['guard_name' => 'api', 'name' => 'eliminar_reserva']);
        Permission::create(['guard_name' => 'api', 'name' => 'ver_reserva']);

        Permission::create(['guard_name' => 'api', 'name' => 'registrar_parqueo']);
        Permission::create(['guard_name' => 'api', 'name' => 'editar_parqueo']);
        Permission::create(['guard_name' => 'api', 'name' => 'eliminar_parqueo']);
        Permission::create(['guard_name' => 'api', 'name' => 'ver_parqueo']);

        Permission::create(['guard_name' => 'api', 'name' => 'registrar_venta']);
        Permission::create(['guard_name' => 'api', 'name' => 'editar_venta']);
        Permission::create(['guard_name' => 'api', 'name' => 'eliminar_venta']);
        Permission::create(['guard_name' => 'api', 'name' => 'ver_venta']);

        Permission::create(['guard_name' => 'api', 'name' => 'registrar_usuario']);
        Permission::create(['guard_name' => 'api', 'name' => 'editar_usuario']);
        Permission::create(['guard_name' => 'api', 'name' => 'eliminar_usuario']);
        Permission::create(['guard_name' => 'api', 'name' => 'ver_usuario']);
        Permission::create(['guard_name' => 'api', 'name' => 'asignar_roles']);

        // Crear roles y asignar permisos

        // Super-Admin: tiene todos los permisos
        $superAdmin = Role::create(['guard_name' => 'api', 'name' => 'Super-Admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Recepcionista: permisos para reservas, asignaciones, recordatorios, ventas y parqueo
        $recepcionista = Role::create(['guard_name' => 'api', 'name' => 'Recepcionista']);
        $recepcionista->givePermissionTo([
            'registrar_reserva',
            'editar_reserva',
            'eliminar_reserva',
            'ver_reserva',

            'registrar_recordatorio',
            'ver_recordatorio',

            'registrar_venta',
            'editar_venta',
            'eliminar_venta',
            'ver_venta',

            'registrar_parqueo',
            'editar_parqueo',
            'eliminar_parqueo',
            'ver_parqueo',
        ]);

        // Ventas: permisos para ventas
        $ventas = Role::create(['guard_name' => 'api', 'name' => 'Ventas']);
        $ventas->givePermissionTo([
            'registrar_venta',
            'editar_venta',
            'eliminar_venta',
            'ver_venta',
        ]);

        // Parqueo: permisos solo para gestionar parqueo
        $parqueo = Role::create(['guard_name' => 'api', 'name' => 'Parqueo']);
        $parqueo->givePermissionTo([
            'registrar_parqueo',
            'editar_parqueo',
            'eliminar_parqueo',
            'ver_parqueo',
        ]);

        // Crear usuarios demo

        // Super-Admin User
        $user = \App\Models\User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'password' => bcrypt('12345678'),
        ]);
        $user->assignRole($superAdmin);

        // Recepcionista User
        $user = \App\Models\User::factory()->create([
            'name' => 'Recepcionista',
            'email' => 'recepcionista@example.com',
            'password' => bcrypt('12345678'),
        ]);
        $user->assignRole($recepcionista);

        // Ventas User
        $user = \App\Models\User::factory()->create([
            'name' => 'Ventas',
            'email' => 'ventas@example.com',
            'password' => bcrypt('12345678'),
        ]);
        $user->assignRole($ventas);

        // Parqueo User
        $user = \App\Models\User::factory()->create([
            'name' => 'Parqueo',
            'email' => 'parqueo@example.com',
            'password' => bcrypt('12345678'),
        ]);
        $user->assignRole($parqueo);
    }
}
