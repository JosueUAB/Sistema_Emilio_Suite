<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Configuracion\descuentoController;
use App\Http\Controllers\Configuracion\tarifaController;
use App\Http\Controllers\Configuracion\tipo_habitacionController;
use App\Http\Controllers\HuespedController;
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

    //! Configuraciones */

    Route::resource("tarifas",tarifaController::class);
    Route::resource("descuentos",descuentoController::class);
    Route::resource("tipo_habitacion",tipo_habitacionController::class);



    //**modulos */

    Route::resource("huesped",HuespedController::class);

});
