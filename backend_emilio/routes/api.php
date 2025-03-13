<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Configuracion\descuentoController;
use App\Http\Controllers\Configuracion\tarifaController;
use App\Http\Controllers\Configuracion\tipo_habitacionController;
use App\Http\Controllers\HabitacionesController;
use App\Http\Controllers\HuespedController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\UserAccessController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group([

    // 'middleware' => 'api:',
    'prefix' => 'auth',
    // 'middleware' => ['auth:api']

], function ($router) {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
    Route::post('/me', [AuthController::class, 'me'])->name('me');
});


Route::group([

    'middleware' => 'auth:api',

    // 'middleware' => ['auth:api']

], function ($router) {
    Route::resource("roles",RolePermissionController::class);
    Route::post('/users/{id}', [UserAccessController::class, 'update']);
    Route::resource("users",UserAccessController::class);



    //! reportes dashboard */
    Route::get('reportes-dashboard', [ReportesController::class, 'obtenerReportesDashboard']);
    Route::get('huespedes-por-nacionalidad', [ReportesController::class, 'obtenerHuespedesPorNacionalidad']);
    Route::get('clientes-ingresos-mensuales', [ReportesController::class, 'obtenerClientesPorMesYIngresosMensuales']);

    Route::get('clientes-ingresos-diarios', [ReportesController::class, 'obtenerClientesPorDiaYIngresosDiarios']);

    Route::get('cobroshoy', [ReportesController::class, 'obtenerCobroHoy']);



    //! Configuraciones */

    Route::resource("tarifas",tarifaController::class);
    Route::resource("descuentos",descuentoController::class);
    Route::resource("tipo_habitacion",tipo_habitacionController::class);



    //**modulos */

    Route::resource("huesped",HuespedController::class);

    Route::resource("habitacion",HabitacionesController::class);
    Route::resource("reserva", ReservaController::class);
    // !Rutas adicionales
    Route::post('reserva/checkin/{id}', [ReservaController::class, 'checkin']);
    Route::post('reserva/checkin-directo', [ReservaController::class, 'checkinDirecto']);
    Route::post('reserva/checkout/{id}', [ReservaController::class, 'checkout']);
    Route::post('reserva/habitaciones-disponibles', [ReservaController::class, 'habitacionesDisponibles']);
    Route::post('reserva/reservas-por-fecha', [ReservaController::class, 'reservasPorFecha']);
    Route::post('reserva/reservas-para-hoy-manana', [ReservaController::class, 'reservasParaHoyYManana']);
    Route::post('reserva/habitaciones-para-checkout', [ReservaController::class, 'habitacionesOcupadasParaCheckout']);
    Route::post('reserva/habitacion-para-check-out/{id}', [ReservaController::class, 'habitacionOcupadaPorIdReserva']);
    Route::post('reserva/listarHabitaciones-disponibles-hoy', [ReservaController::class, 'listarHabitacionesDisponiblesHoy']);
    Route::post('reserva/obtener-reserva-id-habitacion/{id}', [ReservaController::class, 'obtenerReservaPendienteHoyPorID']);
    Route::post('reserva/completar-pago/{id}', [ReservaController::class, 'completarPago']);

    Route::post('reserva/obtener-checkout-id-habitacion/{id}', [ReservaController::class, 'obtenerCheckoutPorHabitacionId']);

});
