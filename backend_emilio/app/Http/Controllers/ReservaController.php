<?php
namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Pago;
use App\Models\Huesped;
use App\Models\Reserva;
use App\Models\Habitaciones;
use Illuminate\Http\Request;
use App\Events\HabitacionCheckout;
use App\Models\Configuracion\descuento;
use App\Notifications\NotificarCheckout;
use App\Models\Configuracion\descuento as ConfiguracionDescuento;
use Illuminate\Support\Facades\Log;  // Asegúrate de importar Log

class ReservaController extends Controller

{
    public function index()
    {
        // Obtener todas las reservas con relaciones (huesped, habitacion, descuento y pago)
        $reservas = Reserva::with(['huesped', 'habitacion', 'descuento', 'pago'])->get();

        return response()->json([
            'mensaje' => 'Lista de reservas obtenida exitosamente.',
            'reservas' => $reservas
        ], 200);
    }

    /**
     * Almacenar una nueva reserva.
     */




public function store(Request $request)
{
    try {
        // Validar los datos de la solicitud
        $request->validate([
            'huesped_id' => 'required|exists:huesped,id',
            'habitacion_id' => 'required|exists:habitaciones,id',
            'descuento_id' => 'nullable|exists:descuento,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'metodo_de_pago' => 'required|in:qr,efectivo',
            'monto_pagado' => 'required|numeric|min:0',
        ]);

        // Obtener el usuario autenticado
        $usuario = auth()->user();

        // Obtener la habitación y el huésped seleccionados
        $habitacion = Habitaciones::find($request->habitacion_id);
        $huesped = Huesped::find($request->huesped_id);

        // Verificar si la habitación y el huésped existen
        if (!$huesped) {
            return response()->json(['mensaje' => 'El huésped no existe.'], 404);
        }

        if (!$habitacion) {
            return response()->json(['mensaje' => 'La habitación no existe.'], 404);
        }

        // Parsear fechas con horas
        $checkin = Carbon::parse($request->fecha_inicio)->setTime(12, 0, 0); // Forzar check-in a las 12:00 PM
        $checkout = Carbon::parse($request->fecha_fin)->setTime(12, 0, 0); // Forzar check-out a las 12:00 PM

        // Verificar si el check-out es después del check-in
        if ($checkout->lte($checkin)) {
            return response()->json([
                'mensaje' => 'La fecha de salida debe ser después de la fecha de entrada.'
            ], 400);
        }

        // Verificar si ya existe una reserva para esta habitación en estas fechas
        $reservaExistente = Reserva::where('habitacion_id', $request->habitacion_id)
            ->where(function($query) use ($checkin, $checkout) {
                $query->where(function($q) use ($checkin, $checkout) {
                        $q->where('fecha_inicio', '<', $checkout)
                          ->where('fecha_fin', '>', $checkin);
                    });
            })
            ->first(); // Obtener la primera reserva que cause conflicto

        if ($reservaExistente) {
            return response()->json([
                'mensaje' => 'Ya existe una reserva para esta habitación en las fechas seleccionadas.',
                'reserva_existente' => [
                    'fecha_inicio' => $reservaExistente->fecha_inicio,
                    'fecha_fin' => $reservaExistente->fecha_fin,
                ],
                'status' => 409
            ], 409);
        }

        // Calcular la duración de la estancia en días
        $duracion = $checkin->diffInDays($checkout);

        // Calcular el costo total según el costo de la habitación y la duración
        $costoTotalSinDescuento = $habitacion->costo * $duracion;

        // Aplicar descuento si existe
        $descuento = null;
        $montoDescuento = 0;
        if ($request->descuento_id) {
            $descuento = ConfiguracionDescuento::find($request->descuento_id);
            if (!$descuento) {
                return response()->json([
                    'mensaje' => 'El descuento no existe.',
                    'status' => 404
                ], 404);
            }
            $montoDescuento = ($costoTotalSinDescuento * $descuento->porcentaje) / 100;
        }

        // Calcular el total después de aplicar el descuento
        $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

        // Verificar si el monto pagado es mayor que el total
        if ($request->monto_pagado > $totalConDescuento) {
            return response()->json([
                'mensaje' => 'El monto pagado no puede ser mayor que el total de la reserva.',
                'status' => 403
            ], 403);
        }

        // Crear la reserva
        $reserva = Reserva::create([
            'huesped_id' => $huesped->id,
            'habitacion_id' => $habitacion->id,
            'descuento_id' => $descuento ? $descuento->id : null,
            'usuario_id' => $usuario->id,
            'total' => $totalConDescuento,
            'fecha_inicio' => $checkin->format('Y-m-d H:i:s'), // Guardar en formato datetime
            'fecha_fin' => $checkout->format('Y-m-d H:i:s'), // Guardar en formato datetime
            'estado' => 'pendiente',
        ]);

        // Crear el pago asociado a la reserva
        $pago = Pago::create([
            'reserva_id' => $reserva->id,
            'usuario_id' => $usuario->id, // Asignar el usuario que realiza el pago
            'monto_pagado' => $request->monto_pagado,
            'saldo' => $totalConDescuento - $request->monto_pagado,
            'metodo_de_pago' => $request->metodo_de_pago,
            'estado_pago' => ($request->monto_pagado >= $totalConDescuento) ? 'completado' : 'deuda',
            'fecha_de_pago' => now(),
        ]);

        // Actualizar el estado de la habitación a 'reservado'
        $habitacion->update(['estado' => 'reservado']);

        // // Si el check-in es hoy, actualizamos el estado del huésped a 'activo'
        // if ($checkin->isToday()) {
        //     $huesped->update(['estado' => 'activo']);
        // }

        // Cargar relaciones para la respuesta
        $reserva->load('huesped', 'habitacion', 'descuento', 'pago');

        // Respuesta con detalles adicionales
        return response()->json([
            'mensaje' => 'Reserva creada exitosamente.',
            'reserva' => $reserva,
            'pago' => $pago,
            'huesped' => $huesped, // Detalles del huésped
            'habitacion' => $habitacion, // Detalles de la habitación
            'descuento' => $descuento, // Detalles del descuento (si aplica)
            'detalles_pago' => [
                'dias_hospedaje' => $duracion, // Días de hospedaje
                'costo_por_noche' => $habitacion->costo, // Costo por noche
                'costo_total_sin_descuento' => $costoTotalSinDescuento, // Costo total sin descuento
                'monto_descuento' => $montoDescuento, // Monto del descuento en dinero
                'total_con_descuento' => $totalConDescuento // Total a pagar con descuento
            ],
            'status' => 201
        ], 201);

    } catch (\Exception $e) {
        // Capturar cualquier excepción no manejada
        Log::error('Error al crear la reserva:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al crear la reserva.',
            'status' => 500,
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Mostrar los detalles de una reserva específica.
     */
    public function show($id)
    {
        try {
            // Obtener la reserva con relaciones (huesped, habitacion, descuento y pago)
            $reserva = Reserva::with(['huesped', 'habitacion', 'descuento', 'pago'])->find($id);

            // Verificar si la reserva existe
            if (!$reserva) {
                return response()->json([
                    'mensaje' => 'Reserva no encontrada.',
                    'status' => 404
                ], 404);
            }

            // Respuesta con detalles de la reserva
            return response()->json([
                'mensaje' => 'Reserva obtenida exitosamente.',
                'reserva' => $reserva,
                'status' => 200
            ], 200);

        } catch (\Exception $e) {
            // Capturar cualquier excepción no manejada
            Log::error('Error al obtener la reserva:', ['error' => $e->getMessage()]);
            return response()->json([
                'mensaje' => 'Ocurrió un error al obtener la reserva.',
                'status' => 500,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Actualizar una reserva existente.
     */
    // public function update(Request $request, $id)
    // {
    //     try {
    //         Log::info('Buscando reserva con ID:', ['id' => $id]);

    //         // Buscar la reserva
    //         $reserva = Reserva::with('pago')->find($id);

    //         if (!$reserva) {
    //             Log::error('Reserva no encontrada con ID:', ['id' => $id]);
    //             return response()->json([
    //                 'mensaje' => 'Reserva no encontrada.',
    //             ], 404);
    //         }

    //         // Validar los datos de la solicitud
    //         $request->validate([
    //             'huesped_id' => 'sometimes|required|exists:huesped,id',
    //             'habitacion_id' => 'sometimes|required|exists:habitaciones,id',
    //             'descuento_id' => 'nullable|exists:descuento,id',
    //             'fecha_inicio' => 'sometimes|required|date',
    //             'fecha_fin' => 'sometimes|required|date|after:fecha_inicio',
    //             'metodo_de_pago' => 'sometimes|required|in:qr,efectivo',
    //             'monto_pagado' => 'sometimes|required|numeric|min:0',
    //         ]);

    //         // Actualizar el pago si se proporciona
    //         if ($request->has('monto_pagado')) {
    //             $reserva->pago->monto_pagado = $request->monto_pagado;
    //             $reserva->pago->saldo = $reserva->total - $request->monto_pagado;
    //             $reserva->pago->estado_pago = ($request->monto_pagado >= $reserva->total) ? 'completado' : 'deuda';
    //             $reserva->pago->save();
    //         }

    //         // Guardar los cambios en la reserva
    //         $reserva->save();

    //         // Cargar relaciones para la respuesta
    //         $reserva->load('huesped', 'habitacion', 'descuento', 'pago');

    //         return response()->json([
    //             'mensaje' => 'Reserva actualizada exitosamente.',
    //             'reserva' => $reserva
    //         ], 200);

    //     } catch (\Exception $e) {
    //         Log::error('Error al actualizar la reserva:', ['error' => $e->getMessage()]);
    //         return response()->json([
    //             'mensaje' => 'Ocurrió un error al actualizar la reserva.',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    public function update(Request $request, $id)
{
    try {
        Log::info('Buscando reserva con ID:', ['id' => $id]);

        // Buscar la reserva con relaciones
        $reserva = Reserva::with(['huesped', 'habitacion', 'descuento', 'pago'])->find($id);

        // Verificar si la reserva existe
        if (!$reserva) {
            Log::error('Reserva no encontrada con ID:', ['id' => $id]);
            return response()->json([
                'mensaje' => 'Reserva no encontrada.',
                'status' => 404
            ], 404);
        }

        // Validar los datos de la solicitud
        $request->validate([
            'huesped_id' => 'sometimes|required|exists:huesped,id',
            'habitacion_id' => 'sometimes|required|exists:habitaciones,id',
            'descuento_id' => 'nullable|exists:descuento,id',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'sometimes|required|date|after:fecha_inicio',
            'metodo_de_pago' => 'sometimes|required|in:qr,efectivo',
            'monto_pagado' => 'sometimes|required|numeric|min:0',
        ]);

        // Actualizar campos de la reserva si se proporcionan
        if ($request->has('huesped_id')) {
            $reserva->huesped_id = $request->huesped_id;
        }
        if ($request->has('habitacion_id')) {
            $reserva->habitacion_id = $request->habitacion_id;
        }
        if ($request->has('descuento_id')) {
            $reserva->descuento_id = $request->descuento_id;
        }
        if ($request->has('fecha_inicio')) {
            $reserva->fecha_inicio = Carbon::parse($request->fecha_inicio)->setTime(12, 0, 0);
        }
        if ($request->has('fecha_fin')) {
            $reserva->fecha_fin = Carbon::parse($request->fecha_fin)->setTime(12, 0, 0);
        }

        // Guardar los cambios en la reserva
        $reserva->save();

        // Actualizar el pago si se proporciona monto_pagado
        if ($request->has('monto_pagado')) {
            $reserva->pago->monto_pagado += $request->monto_pagado;
            $reserva->pago->saldo = $reserva->total - $reserva->pago->monto_pagado;
            $reserva->pago->estado_pago = ($reserva->pago->monto_pagado >= $reserva->total) ? 'completado' : 'deuda';
            $reserva->pago->save();
        }

        // Cargar relaciones actualizadas para la respuesta
        $reserva->load('huesped', 'habitacion', 'descuento', 'pago');

        return response()->json([
            'mensaje' => 'Reserva actualizada exitosamente.',
            'reserva' => $reserva,
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al actualizar la reserva:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al actualizar la reserva.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}

    /**
     * Eliminar una reserva.
     */
    // public function destroy($id)
    // {
    //     try {
    //         // Buscar la reserva
    //         $reserva = Reserva::find($id);

    //         if (!$reserva) {
    //             return response()->json([
    //                 'mensaje' => 'Reserva no encontrada.',
    //             ], 404);
    //         }

    //         // Eliminar el pago asociado
    //         $reserva->pago()->delete();

    //         // Eliminar la reserva
    //         $reserva->delete();

    //         return response()->json([
    //             'mensaje' => 'Reserva eliminada exitosamente.',
    //         ], 200);

    //     } catch (\Exception $e) {
    //         // Capturar cualquier excepción no manejada
    //         Log::error('Error al eliminar la reserva:', ['error' => $e->getMessage()]);
    //         return response()->json([
    //             'mensaje' => 'Ocurrió un error al eliminar la reserva.',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    public function destroy($id)
{
    try {
        Log::info('Buscando reserva con ID para eliminar:', ['id' => $id]);

        // Buscar la reserva con relaciones
        $reserva = Reserva::with('pago')->find($id);

        // Verificar si la reserva existe
        if (!$reserva) {
            Log::error('Reserva no encontrada con ID:', ['id' => $id]);
            return response()->json([
                'mensaje' => 'Reserva no encontrada.',
                'status' => 404
            ], 404);
        }

        // Eliminar el pago asociado si existe
        if ($reserva->pago) {
            Log::info('Eliminando pago asociado a la reserva:', ['pago_id' => $reserva->pago->id]);
            $reserva->pago()->delete();
        }

        // Eliminar la reserva
        Log::info('Eliminando reserva:', ['reserva_id' => $reserva->id]);
        $reserva->delete();

        return response()->json([
            'mensaje' => 'Reserva eliminada exitosamente.',
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al eliminar la reserva:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al eliminar la reserva.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}




    // public function checkin($id)
    // {
    //     try {
    //         // Buscar la reserva
    //         $reserva = Reserva::find($id);

    //         if (!$reserva) {
    //             return response()->json(['mensaje' => 'Reserva no encontrada.'], 404);
    //         }

    //         // Verificar si la reserva ya está activa
    //         if ($reserva->estado === 'activa') {
    //             return response()->json(['mensaje' => 'La reserva ya está activa.'], 400);
    //         }

    //         // Verificar si la fecha de check-in es hoy
    //         $checkin = Carbon::parse($reserva->fecha_inicio);
    //         if (!$checkin->isToday()) {
    //             return response()->json(['mensaje' => 'El check-in solo puede realizarse el día de la reserva.'], 400);
    //         }

    //         // Obtener la habitación y el huésped asociados a la reserva
    //         $habitacion = $reserva->habitacion;
    //         $huesped = $reserva->huesped;

    //         // Verificar si la habitación está disponible
    //         if ($habitacion->estado !== 'reservado') {
    //             return response()->json(['mensaje' => 'La habitación no está en estado "reservado".'], 409);
    //         }

    //         // Calcular la duración de la estancia en días
    //         $checkout = Carbon::parse($reserva->fecha_fin);
    //         $duracion = $checkin->diffInDays($checkout);

    //         // Calcular el costo total sin descuento
    //         $costoTotalSinDescuento = $habitacion->costo * $duracion;

    //         // Aplicar descuento si existe
    //         $descuento = $reserva->descuento;
    //         $montoDescuento = 0;
    //         if ($descuento) {
    //             $montoDescuento = ($costoTotalSinDescuento * $descuento->porcentaje) / 100;
    //         }

    //         // Calcular el total después de aplicar el descuento
    //         $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

    //         // Actualizar estados
    //         $reserva->update(['estado' => 'activa']);
    //         $habitacion->update(['estado' => 'ocupado']); // Cambiar el estado de la habitación a "ocupado"
    //         $huesped->update(['estado' => 'activo']); // Cambiar el estado del huésped a "activo"

    //         // Cargar relaciones para la respuesta
    //         $reserva->load('huesped', 'habitacion', 'descuento', 'pago');

    //         // Respuesta con detalles adicionales
    //         return response()->json([
    //             'mensaje' => 'Check-in realizado exitosamente.',
    //             'reserva' => $reserva,
    //             'huesped' => $huesped, // Detalles del huésped
    //             'habitacion' => $habitacion, // Detalles de la habitación
    //             'descuento' => $descuento, // Detalles del descuento (si aplica)
    //             'detalles_pago' => [
    //                 'dias_hospedaje' => $duracion, // Días de hospedaje
    //                 'costo_por_noche' => $habitacion->costo, // Costo por noche
    //                 'costo_total_sin_descuento' => $costoTotalSinDescuento, // Costo total sin descuento
    //                 'monto_descuento' => $montoDescuento, // Monto del descuento en dinero
    //                 'total_con_descuento' => $totalConDescuento // Total a pagar con descuento
    //             ]
    //         ], 200);

    //     } catch (\Exception $e) {
    //         Log::error('Error al realizar el check-in:', ['error' => $e->getMessage()]);
    //         return response()->json([
    //             'mensaje' => 'Ocurrió un error al realizar el check-in.',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function checkin($id)
    {
        try {
            Log::info('Buscando reserva con ID para check-in:', ['id' => $id]);

            // Buscar la reserva con relaciones
            $reserva = Reserva::with(['huesped', 'habitacion', 'descuento', 'pago'])->find($id);

            // Verificar si la reserva existe
            if (!$reserva) {
                Log::error('Reserva no encontrada con ID:', ['id' => $id]);
                return response()->json([
                    'mensaje' => 'Reserva no encontrada.',
                    'status' => 404
                ], 404);
            }

            // Verificar si la reserva ya está activa
            if ($reserva->estado === 'activa') {
                Log::warning('La reserva ya está activa:', ['reserva_id' => $reserva->id]);
                return response()->json([
                    'mensaje' => 'La reserva ya está activa.',
                    'status' => 400
                ], 400);
            }

            // Verificar si la fecha de check-in es hoy
            $checkin = Carbon::parse($reserva->fecha_inicio);
            if (!$checkin->isToday()) {
                Log::warning('El check-in solo puede realizarse el día de la reserva:', ['fecha_inicio' => $reserva->fecha_inicio]);
                return response()->json([
                    'mensaje' => 'El check-in solo puede realizarse el día de la reserva.',
                    'status' => 400
                ], 400);
            }

            // Obtener la habitación y el huésped asociados a la reserva
            $habitacion = $reserva->habitacion;
            $huesped = $reserva->huesped;

            // Verificar si la habitación está disponible
            if ($habitacion->estado !== 'reservado') {
                Log::warning('La habitación no está en estado "reservado":', ['habitacion_id' => $habitacion->id, 'estado' => $habitacion->estado]);
                return response()->json([
                    'mensaje' => 'La habitación no está en estado "reservado".',
                    'status' => 409
                ], 409);
            }

            // Calcular la duración de la estancia en días
            $checkout = Carbon::parse($reserva->fecha_fin);
            $duracion = $checkin->diffInDays($checkout);

            // Calcular el costo total sin descuento
            $costoTotalSinDescuento = $habitacion->costo * $duracion;

            // Aplicar descuento si existe
            $descuento = $reserva->descuento;
            $montoDescuento = 0;
            if ($descuento) {
                $montoDescuento = ($costoTotalSinDescuento * $descuento->porcentaje) / 100;
            }

            // Calcular el total después de aplicar el descuento
            $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

            // Actualizar estados
            $reserva->update(['estado' => 'activa']);
            $habitacion->update(['estado' => 'ocupado']); // Cambiar el estado de la habitación a "ocupado"
            $huesped->update(['estado' => 'activo']); // Cambiar el estado del huésped a "activo"

            // Cargar relaciones actualizadas para la respuesta
            $reserva->load('huesped', 'habitacion', 'descuento', 'pago');

            // Respuesta con detalles adicionales
            return response()->json([
                'mensaje' => 'Check-in realizado exitosamente.',
                'reserva' => $reserva,
                'huesped' => $huesped, // Detalles del huésped
                'habitacion' => $habitacion, // Detalles de la habitación
                'descuento' => $descuento, // Detalles del descuento (si aplica)
                'detalles_pago' => [
                    'dias_hospedaje' => $duracion, // Días de hospedaje
                    'costo_por_noche' => $habitacion->costo, // Costo por noche
                    'costo_total_sin_descuento' => $costoTotalSinDescuento, // Costo total sin descuento
                    'monto_descuento' => $montoDescuento, // Monto del descuento en dinero
                    'total_con_descuento' => $totalConDescuento // Total a pagar con descuento
                ],
                'status' => 200
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al realizar el check-in:', ['error' => $e->getMessage()]);
            return response()->json([
                'mensaje' => 'Ocurrió un error al realizar el check-in.',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }



// public function checkinDirecto(Request $request)
// {
//     try {
//         Log::info('Iniciando check-in directo:', ['request' => $request->all()]);

//         // Validar los datos de la solicitud
//         $request->validate([
//             'huesped_id' => 'required|exists:huesped,id',
//             'habitacion_id' => 'required|exists:habitaciones,id',
//             'fecha_inicio' => 'required|date',
//             'fecha_fin' => 'required|date|after:fecha_inicio',
//             'metodo_de_pago' => 'required|in:qr,efectivo',
//             'monto_pagado' => 'required|numeric|min:0',
//             'descuento_id' => 'nullable|exists:descuento,id', // Descuento opcional
//         ]);

//         // Obtener la habitación y el huésped
//         $habitacion = Habitaciones::find($request->habitacion_id);
//         $huesped = Huesped::find($request->huesped_id);

//         // Verificar si la habitación y el huésped existen
//         if (!$habitacion) {
//             Log::error('Habitación no encontrada:', ['habitacion_id' => $request->habitacion_id]);
//             return response()->json([
//                 'mensaje' => 'Habitación no encontrada.',
//                 'status' => 404
//             ], 404);
//         }
//         if (!$huesped) {
//             Log::error('Huésped no encontrado:', ['huesped_id' => $request->huesped_id]);
//             return response()->json([
//                 'mensaje' => 'Huésped no encontrado.',
//                 'status' => 404
//             ], 404);
//         }

//         // Parsear fechas con horas
//         $checkin = Carbon::parse($request->fecha_inicio)->setTime(12, 0, 0); // Forzar check-in a las 12:00 PM
//         $checkout = Carbon::parse($request->fecha_fin)->setTime(12, 0, 0); // Forzar check-out a las 12:00 PM

//         // Verificar si el check-out es después del check-in
//         if ($checkout->lte($checkin)) {
//             return response()->json([
//                 'mensaje' => 'La fecha de salida debe ser después de la fecha de entrada.',
//                 'status' => 400
//             ], 400);
//         }

//         // Verificar si ya existe una reserva para esta habitación en estas fechas
//         $reservaExistente = Reserva::where('habitacion_id', $request->habitacion_id)
//             ->where(function($query) use ($checkin, $checkout) {
//                 $query->where(function($q) use ($checkin, $checkout) {
//                         $q->where('fecha_inicio', '<', $checkout)
//                           ->where('fecha_fin', '>', $checkin);
//                     });
//             })
//             ->first(); // Obtener la primera reserva que cause conflicto

//         if ($reservaExistente) {
//             // Verificar si la fecha de inicio de la nueva reserva es al menos un día posterior al check-out de la reserva existente
//             $fechaFinReservaExistente = Carbon::parse($reservaExistente->fecha_fin);
//             if ($checkin->gt($fechaFinReservaExistente)) {
//                 // No hay solapamiento, permitir la reserva
//             } else {
//                 return response()->json([
//                     'mensaje' => 'Ya existe una reserva para esta habitación en las fechas seleccionadas.',
//                     'reserva_existente' => [
//                         'fecha_inicio' => $reservaExistente->fecha_inicio,
//                         'fecha_fin' => $reservaExistente->fecha_fin,
//                     ],
//                     'status' => 409
//                 ], 409);
//             }
//         }

//         // Verificar si la habitación está disponible
//         if ($habitacion->estado !== 'disponible') {
//             Log::warning('La habitación no está disponible:', ['habitacion_id' => $habitacion->id, 'estado' => $habitacion->estado]);
//             return response()->json([
//                 'mensaje' => 'La habitación no está disponible.',
//                 'status' => 409
//             ], 409);
//         }

//         // Calcular la duración de la estancia en días
//         $duracion = $checkin->diffInDays($checkout);

//         // Calcular el costo total sin descuento
//         $costoTotalSinDescuento = $habitacion->costo * $duracion;

//         // Aplicar descuento si existe
//         $descuento = null;
//         $montoDescuento = 0;
//         if ($request->descuento_id) {
//             $descuento = Descuento::find($request->descuento_id);
//             if (!$descuento) {
//                 Log::error('Descuento no encontrado:', ['descuento_id' => $request->descuento_id]);
//                 return response()->json([
//                     'mensaje' => 'El descuento no existe.',
//                     'status' => 404
//                 ], 404);
//             }
//             $montoDescuento = ($costoTotalSinDescuento * $descuento->porcentaje) / 100;
//         }

//         // Calcular el total después de aplicar el descuento
//         $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

//         // Verificar si el monto pagado es mayor que el total
//         if ($request->monto_pagado > $totalConDescuento) {
//             Log::warning('El monto pagado no puede ser mayor que el total de la reserva:', ['monto_pagado' => $request->monto_pagado, 'total_con_descuento' => $totalConDescuento]);
//             return response()->json([
//                 'mensaje' => 'El monto pagado no puede ser mayor que el total de la reserva.',
//                 'status' => 400
//             ], 400);
//         }

//         // Crear la reserva con check-in inmediato
//         $reserva = Reserva::create([
//             'huesped_id' => $huesped->id,
//             'habitacion_id' => $habitacion->id,
//             'descuento_id' => $request->descuento_id, // Puede ser NULL
//             'usuario_id' => auth()->id(), // ID del usuario autenticado
//             'fecha_inicio' => $checkin->format('Y-m-d H:i:s'), // Guardar en formato datetime
//             'fecha_fin' => $checkout->format('Y-m-d H:i:s'), // Guardar en formato datetime
//             'estado' => 'confirmada', // Usar un valor válido del ENUM
//             'total' => $totalConDescuento, // Total con descuento aplicado
//         ]);

//         // Actualizar estados
//         $habitacion->update(['estado' => 'ocupado']); // Cambiar el estado de la habitación a "ocupado"
//         $huesped->update(['estado' => 'activo']); // Cambiar el estado del huésped a "activo"

//         // Registrar el pago
//         $pago = Pago::create([
//             'reserva_id' => $reserva->id,
//             'usuario_id' => auth()->id(), // ID del usuario autenticado
//             'monto_pagado' => $request->monto_pagado,
//             'saldo' => $totalConDescuento - $request->monto_pagado,
//             'metodo_de_pago' => $request->metodo_de_pago,
//             'estado_pago' => ($request->monto_pagado >= $totalConDescuento) ? 'completado' : 'deuda',
//             'fecha_de_pago' => now(),
//         ]);

//         // Cargar relaciones para la respuesta
//         $reserva->load('huesped', 'habitacion', 'descuento', 'pago');

//         // Respuesta con detalles adicionales
//         return response()->json([
//             'mensaje' => 'Check-in directo realizado exitosamente.',
//             'reserva' => $reserva,
//             'pago' => $pago,
//             'huesped' => $huesped, // Detalles del huésped
//             'habitacion' => $habitacion, // Detalles de la habitación
//             'descuento' => $descuento, // Detalles del descuento (si aplica)
//             'detalles_pago' => [
//                 'dias_hospedaje' => $duracion, // Días de hospedaje
//                 'costo_por_noche' => $habitacion->costo, // Costo por noche
//                 'costo_total_sin_descuento' => $costoTotalSinDescuento, // Costo total sin descuento
//                 'monto_descuento' => $montoDescuento, // Monto del descuento en dinero
//                 'total_con_descuento' => $totalConDescuento // Total a pagar con descuento
//             ],
//             'status' => 201
//         ], 201);

//     } catch (\Exception $e) {
//         Log::error('Error al realizar el check-in directo:', ['error' => $e->getMessage()]);
//         return response()->json([
//             'mensaje' => 'Ocurrió un error al realizar el check-in directo.',
//             'error' => $e->getMessage(),
//             'status' => 500
//         ], 500);
//     }
// }
public function checkinDirecto(Request $request)
{
    try {
        Log::info('Iniciando check-in directo:', ['request' => $request->all()]);

        // Validar los datos de la solicitud
        $request->validate([
            'huesped_id' => 'required|exists:huesped,id',
            'habitacion_id' => 'required|exists:habitaciones,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'metodo_de_pago' => 'required|in:qr,efectivo',
            'monto_pagado' => 'required|numeric|min:0',
            'descuento_id' => 'nullable|exists:descuento,id', // Descuento opcional
        ]);

        // Obtener la habitación y el huésped
        $habitacion = Habitaciones::find($request->habitacion_id);
        $huesped = Huesped::find($request->huesped_id);

        // Verificar si la habitación y el huésped existen
        if (!$habitacion) {
            Log::error('Habitación no encontrada:', ['habitacion_id' => $request->habitacion_id]);
            return response()->json([
                'mensaje' => 'Habitación no encontrada.',
                'status' => 404
            ], 404);
        }
        if (!$huesped) {
            Log::error('Huésped no encontrado:', ['huesped_id' => $request->huesped_id]);
            return response()->json([
                'mensaje' => 'Huésped no encontrado.',
                'status' => 404
            ], 404);
        }

        // Parsear fechas con horas
        $checkin = Carbon::parse($request->fecha_inicio)->setTime(12, 0, 0); // Forzar check-in a las 12:00 PM
        $checkout = Carbon::parse($request->fecha_fin)->setTime(12, 0, 0); // Forzar check-out a las 12:00 PM

        // Verificar si el check-out es después del check-in
        if ($checkout->lte($checkin)) {
            return response()->json([
                'mensaje' => 'La fecha de salida debe ser después de la fecha de entrada.',
                'status' => 400
            ], 400);
        }

        // Verificar si ya existe una reserva para esta habitación en estas fechas
        $reservaExistente = Reserva::where('habitacion_id', $request->habitacion_id)
            ->where(function($query) use ($checkin, $checkout) {
                $query->where(function($q) use ($checkin, $checkout) {
                        $q->where('fecha_inicio', '<', $checkout) // Reserva existente comienza antes del check-out de la nueva reserva
                          ->where('fecha_fin', '>', $checkin); // Reserva existente termina después del check-in de la nueva reserva
                    })
                    ->orWhere(function($q) use ($checkin, $checkout) {
                        $q->where('fecha_inicio', '=', $checkout) // Reserva existente comienza justo cuando la nueva reserva termina
                          ->orWhere('fecha_fin', '=', $checkin); // Reserva existente termina justo cuando la nueva reserva comienza
                    });
            })
            ->first(); // Obtener la primera reserva que cause conflicto

        if ($reservaExistente) {
            return response()->json([
                'mensaje' => 'Ya existe una reserva para esta habitación en las fechas seleccionadas.',
                'reserva_existente' => [
                    'fecha_inicio' => $reservaExistente->fecha_inicio,
                    'fecha_fin' => $reservaExistente->fecha_fin,
                ],
                'status' => 409
            ], 409);
        }

        // Verificar si la habitación está disponible
        if ($habitacion->estado !== 'disponible') {
            Log::warning('La habitación no está disponible:', ['habitacion_id' => $habitacion->id, 'estado' => $habitacion->estado]);
            return response()->json([
                'mensaje' => 'La habitación no está disponible.',
                'status' => 409
            ], 409);
        }

        // Calcular la duración de la estancia en días
        $duracion = $checkin->diffInDays($checkout);

        // Calcular el costo total sin descuento
        $costoTotalSinDescuento = $habitacion->costo * $duracion;

        // Aplicar descuento si existe
        $descuento = null;
        $montoDescuento = 0;
        if ($request->descuento_id) {
            $descuento = Descuento::find($request->descuento_id);
            if (!$descuento) {
                Log::error('Descuento no encontrado:', ['descuento_id' => $request->descuento_id]);
                return response()->json([
                    'mensaje' => 'El descuento no existe.',
                    'status' => 404
                ], 404);
            }
            $montoDescuento = ($costoTotalSinDescuento * $descuento->porcentaje) / 100;
        }

        // Calcular el total después de aplicar el descuento
        $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

        // Verificar si el monto pagado es mayor que el total
        if ($request->monto_pagado > $totalConDescuento) {
            Log::warning('El monto pagado no puede ser mayor que el total de la reserva:', ['monto_pagado' => $request->monto_pagado, 'total_con_descuento' => $totalConDescuento]);
            return response()->json([
                'mensaje' => 'El monto pagado no puede ser mayor que el total de la reserva.',
                'status' => 400
            ], 400);
        }

        // Crear la reserva con check-in inmediato
        $reserva = Reserva::create([
            'huesped_id' => $huesped->id,
            'habitacion_id' => $habitacion->id,
            'descuento_id' => $request->descuento_id, // Puede ser NULL
            'usuario_id' => auth()->id(), // ID del usuario autenticado
            'fecha_inicio' => $checkin->format('Y-m-d H:i:s'), // Guardar en formato datetime
            'fecha_fin' => $checkout->format('Y-m-d H:i:s'), // Guardar en formato datetime
            'estado' => 'activa', // Usar un valor válido del ENUM
            'total' => $totalConDescuento, // Total con descuento aplicado
        ]);

        // Actualizar estados
        $habitacion->update(['estado' => 'ocupado']); // Cambiar el estado de la habitación a "ocupado"
        $huesped->update(['estado' => 'activo']); // Cambiar el estado del huésped a "activo"

        // Registrar el pago
        $pago = Pago::create([
            'reserva_id' => $reserva->id,
            'usuario_id' => auth()->id(), // ID del usuario autenticado
            'monto_pagado' => $request->monto_pagado,
            'saldo' => $totalConDescuento - $request->monto_pagado,
            'metodo_de_pago' => $request->metodo_de_pago,
            'estado_pago' => ($request->monto_pagado >= $totalConDescuento) ? 'completado' : 'deuda',
            'fecha_de_pago' => now(),
        ]);

        // Cargar relaciones para la respuesta
        $reserva->load('huesped', 'habitacion', 'descuento', 'pago');

        // Respuesta con detalles adicionales
        return response()->json([
            'mensaje' => 'Check-in directo realizado exitosamente.',
            'reserva' => $reserva,
            'pago' => $pago,
            'huesped' => $huesped, // Detalles del huésped
            'habitacion' => $habitacion, // Detalles de la habitación
            'descuento' => $descuento, // Detalles del descuento (si aplica)
            'detalles_pago' => [
                'dias_hospedaje' => $duracion, // Días de hospedaje
                'costo_por_noche' => $habitacion->costo, // Costo por noche
                'costo_total_sin_descuento' => $costoTotalSinDescuento, // Costo total sin descuento
                'monto_descuento' => $montoDescuento, // Monto del descuento en dinero
                'total_con_descuento' => $totalConDescuento // Total a pagar con descuento
            ],
            'status' => 201
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error al realizar el check-in directo:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al realizar el check-in directo.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}




// public function checkout($id)
// {
//     try {
//         // Buscar la reserva
//         $reserva = Reserva::find($id);

//         if (!$reserva) {
//             return response()->json(['mensaje' => 'Reserva no encontrada.'], 404);
//         }

//         // Verificar si la reserva ya está completada
//         if ($reserva->estado === 'completada') {
//             return response()->json(['mensaje' => 'La reserva ya está completada.'], 400);
//         }

//         // Verificar si hay saldo pendiente
//         if ($reserva->pago->saldo > 0) {
//             return response()->json([
//                 'mensaje' => 'Hay un saldo pendiente de pago.',
//                 'saldo_pendiente' => $reserva->pago->saldo, // Total de la deuda
//                 'total_reserva' => $reserva->total, // Total de la reserva
//                 'monto_pagado' => $reserva->pago->monto_pagado, // Monto ya pagado
//                 'metodo_pago' => $reserva->pago->metodo_de_pago, // Método de pago
//                 'reserva' => $reserva // Detalles de la reserva
//             ], 400);
//         }

//         // Actualizar estados
//         $reserva->update(['estado' => 'completada']);
//         $reserva->habitacion->update(['estado' => 'disponible']);
//         $reserva->huesped->update(['estado' => 'inactivo']);
//          // Disparar el evento
//          event(new HabitacionCheckout($reserva));
//          // Disparar el evento

//         return response()->json([
//             'mensaje' => 'Check-out realizado exitosamente.',
//             'reserva' => $reserva,
//             'total_reserva' => $reserva->total, // Total de la reserva
//             'monto_pagado' => $reserva->pago->monto_pagado, // Monto ya pagado
//             'saldo_pendiente' => $reserva->pago->saldo, // Saldo pendiente (debería ser 0)
//             'metodo_pago' => $reserva->pago->metodo_de_pago // Método de pago
//         ], 200);

//     } catch (\Exception $e) {
//         Log::error('Error al realizar el check-out:', ['error' => $e->getMessage()]);
//         return response()->json([
//             'mensaje' => 'Ocurrió un error al realizar el check-out.',
//             'error' => $e->getMessage()
//         ], 500);
//     }
// }
public function checkout($id)
{
    try {
        Log::info('Buscando reserva con ID para check-out:', ['id' => $id]);

        // Buscar la reserva con relaciones
        $reserva = Reserva::with(['huesped', 'habitacion', 'pago'])->find($id);

        // Verificar si la reserva existe
        if (!$reserva) {
            Log::error('Reserva no encontrada con ID:', ['id' => $id]);
            return response()->json([
                'mensaje' => 'Reserva no encontrada.',
                'status' => 404
            ], 404);
        }

        // Verificar si la reserva ya está completada
        if ($reserva->estado === 'completada') {
            Log::warning('La reserva ya está completada:', ['reserva_id' => $reserva->id]);
            return response()->json([
                'mensaje' => 'La reserva ya está completada.',
                'status' => 400
            ], 400);
        }

        // Verificar si hay saldo pendiente
        if ($reserva->pago->saldo > 0) {
            Log::warning('Hay un saldo pendiente de pago:', ['reserva_id' => $reserva->id, 'saldo_pendiente' => $reserva->pago->saldo]);
            return response()->json([
                'mensaje' => 'Hay un saldo pendiente de pago.',
                'saldo_pendiente' => $reserva->pago->saldo, // Total de la deuda
                'total_reserva' => $reserva->total, // Total de la reserva
                'monto_pagado' => $reserva->pago->monto_pagado, // Monto ya pagado
                'metodo_pago' => $reserva->pago->metodo_de_pago, // Método de pago
                'reserva' => $reserva, // Detalles de la reserva
                'status' => 400
            ], 400);
        }

        // Actualizar estados
        $reserva->update(['estado' => 'completada']);
        $reserva->habitacion->update(['estado' => 'disponible']);
        $reserva->huesped->update(['estado' => 'inactivo']);

        // Disparar el evento de check-out
        event(new HabitacionCheckout($reserva));

        // Respuesta con detalles adicionales
        return response()->json([
            'mensaje' => 'Check-out realizado exitosamente.',
            'reserva' => $reserva,
            'total_reserva' => $reserva->total, // Total de la reserva
            'monto_pagado' => $reserva->pago->monto_pagado, // Monto ya pagado
            'saldo_pendiente' => $reserva->pago->saldo, // Saldo pendiente (debería ser 0)
            'metodo_pago' => $reserva->pago->metodo_de_pago, // Método de pago
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al realizar el check-out:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al realizar el check-out.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}



public function habitacionesDisponibles(Request $request)
{
    try {
        // Validar los datos del cuerpo de la solicitud (JSON)
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
        ]);

        // Obtener las fechas del cuerpo de la solicitud (JSON)
        $fechaInicio = Carbon::parse($request->fecha_inicio)->setTime(12, 0, 0); // Check-in a las 12:00 PM
        $fechaFin = Carbon::parse($request->fecha_fin)->setTime(12, 0, 0); // Check-out a las 12:00 PM

        // Obtener todas las habitaciones
        $habitaciones = Habitaciones::all();

        // Filtrar las habitaciones disponibles
        $habitacionesDisponibles = $habitaciones->filter(function ($habitacion) use ($fechaInicio, $fechaFin) {
            // Verificar si hay reservas para esta habitación en el rango de fechas
            $reservaExistente = Reserva::where('habitacion_id', $habitacion->id)
                ->where(function ($query) use ($fechaInicio, $fechaFin) {
                    $query->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                          ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                          ->orWhere(function ($q) use ($fechaInicio, $fechaFin) {
                              $q->where('fecha_inicio', '<', $fechaInicio)
                                ->where('fecha_fin', '>', $fechaFin);
                          });
                })
                ->exists();

            // Si no hay reservas, la habitación está disponible
            return !$reservaExistente;
        });

        // Si no hay habitaciones disponibles, devolver un mensaje
        if ($habitacionesDisponibles->isEmpty()) {
            return response()->json([
                'mensaje' => 'No hay habitaciones disponibles para las fechas seleccionadas.',
                'status' => 404
            ], 404);
        }

        return response()->json([
            'mensaje' => 'Habitaciones disponibles obtenidas exitosamente.',
            'habitaciones_disponibles' => $habitacionesDisponibles->values(), // Convertir a array indexado
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al obtener habitaciones disponibles:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al obtener las habitaciones disponibles.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}

public function reservasPorFecha(Request $request)
{
    try {
        // Validar los datos del cuerpo de la solicitud (JSON)
        $request->validate([
            'fecha' => 'nullable|date', // La fecha es opcional
        ]);

        // Obtener la fecha del cuerpo de la solicitud (JSON), si se proporciona
        $fechaFiltro = $request->fecha ? Carbon::parse($request->fecha) : Carbon::now();

        // Obtener todas las reservas a partir de la fecha de filtro
        $reservas = Reserva::where('fecha_inicio', '>=', $fechaFiltro)
            ->orderBy('fecha_inicio', 'asc') // Ordenar por fecha ascendente
            ->get();

        // Si no hay reservas, devolver un mensaje
        if ($reservas->isEmpty()) {
            return response()->json([
                'mensaje' => 'No hay reservas disponibles a partir de la fecha seleccionada.',
                'status' => 404
            ], 404);
        }

        return response()->json([
            'mensaje' => 'Reservas obtenidas exitosamente.',
            'reservas' => $reservas,
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al obtener reservas:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al obtener las reservas.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}

public function reservasParaHoyYManana(Request $request)
{
    try {
        // Obtener la fecha de hoy y mañana
        $hoy = Carbon::today();
        $manana = Carbon::tomorrow();

        // Obtener todas las reservas para hoy y mañana
        $reservas = Reserva::with(['huesped', 'habitacion', 'descuento', 'pago'])
            ->where(function ($query) use ($hoy, $manana) {
                $query->whereDate('fecha_inicio', '=', $hoy)
                      ->orWhereDate('fecha_inicio', '=', $manana);
            })
            ->orderBy('fecha_inicio', 'asc') // Ordenar por fecha ascendente
            ->get();

        // Si no hay reservas, devolver un mensaje
        if ($reservas->isEmpty()) {
            return response()->json([
                'mensaje' => 'No hay reservas disponibles para hoy y mañana.',
                'status' => 404
            ], 404);
        }

        // Procesar las reservas para incluir información adicional
        $reservasConDetalles = $reservas->map(function ($reserva) {
            // Calcular la duración de la estancia en días
            $checkin = Carbon::parse($reserva->fecha_inicio);
            $checkout = Carbon::parse($reserva->fecha_fin);
            $duracion = $checkin->diffInDays($checkout);

            // Calcular el costo total sin descuento
            $costoTotalSinDescuento = $reserva->habitacion->costo * $duracion;

            // Aplicar descuento si existe
            $descuento = $reserva->descuento;
            $montoDescuento = 0;
            if ($descuento) {
                $montoDescuento = ($costoTotalSinDescuento * $descuento->porcentaje) / 100;
            }

            // Calcular el total después de aplicar el descuento
            $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

            // Obtener detalles del pago
            $pago = $reserva->pago;

            return [
                'id' => $reserva->id,
                'huesped' => $reserva->huesped, // Detalles del huésped
                'habitacion' => $reserva->habitacion, // Detalles de la habitación
                'descuento' => $descuento, // Detalles del descuento (si aplica)
                'fecha_inicio' => $reserva->fecha_inicio,
                'fecha_fin' => $reserva->fecha_fin,
                'estado' => $reserva->estado,
                'total' => $reserva->total,
                'detalles_pago' => [
                    'dias_hospedaje' => $duracion, // Días de hospedaje
                    'costo_por_noche' => $reserva->habitacion->costo, // Costo por noche
                    'costo_total_sin_descuento' => $costoTotalSinDescuento, // Costo total sin descuento
                    'monto_descuento' => $montoDescuento, // Monto del descuento en dinero
                    'total_con_descuento' => $totalConDescuento, // Total a pagar con descuento
                ],
                'pago' => [
                    'monto_pagado' => $pago->monto_pagado, // Monto ya pagado
                    'saldo' => $pago->saldo, // Saldo pendiente
                    'metodo_de_pago' => $pago->metodo_de_pago, // Método de pago
                    'estado_pago' => $pago->estado_pago, // Estado del pago
                    'fecha_de_pago' => $pago->fecha_de_pago, // Fecha de pago
                ],
            ];
        });

        return response()->json([
            'mensaje' => 'Reservas obtenidas exitosamente para hoy y mañana.',
            'reservas' => $reservasConDetalles,
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al obtener reservas para hoy y mañana:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al obtener las reservas.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}




public function habitacionesOcupadasParaCheckout()
{
    try {
        // Obtener la fecha y hora actual
        $fechaActual = Carbon::now();
        $fechaCheckoutHoy = $fechaActual->copy()->endOfDay(); // Fin del día actual

        // Obtener todas las habitaciones que están ocupadas y tienen reservas activas con checkout hoy
        $habitacionesOcupadas = Habitaciones::where('estado', 'ocupado')
            ->whereHas('reservas', function ($query) use ($fechaCheckoutHoy) {
                $query->where('estado', 'activa') // Reservas activas
                    ->whereDate('fecha_fin', $fechaCheckoutHoy->toDateString()); // Checkout hoy
            })
            ->with(['reservas' => function ($query) use ($fechaCheckoutHoy) {
                $query->where('estado', 'activa') // Reservas activas
                    ->whereDate('fecha_fin', $fechaCheckoutHoy->toDateString()); // Checkout hoy
            }, 'reservas.huesped', 'reservas.descuento', 'reservas.pago', 'tipoHabitacion']) // Incluir tipo de habitación
            ->get();

        // Si no hay habitaciones ocupadas, devolver un mensaje
        if ($habitacionesOcupadas->isEmpty()) {
            return response()->json([
                'mensaje' => 'No hay habitaciones ocupadas para checkout hoy.',
                'status' => 404
            ], 404);
        }

        // Procesar las habitaciones para incluir información adicional
        $habitacionesConDetalles = $habitacionesOcupadas->map(function ($habitacion) use ($fechaActual) {
            $reservasConDetalles = $habitacion->reservas->map(function ($reserva) use ($habitacion, $fechaActual) {
                // Calcular la duración de la estancia en días
                $checkin = Carbon::parse($reserva->fecha_inicio);
                $checkout = Carbon::parse($reserva->fecha_fin);
                $duracion = $checkin->diffInDays($checkout);

                // Calcular el costo total sin descuento
                $costoTotalSinDescuento = $habitacion->costo * $duracion;

                // Aplicar descuento si existe
                $descuento = $reserva->descuento;
                $montoDescuento = 0;
                if ($descuento) {
                    $montoDescuento = ($costoTotalSinDescuento * $descuento->porcentaje) / 100;
                }

                // Calcular el total después de aplicar el descuento
                $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

                // Obtener detalles del pago
                $pago = $reserva->pago;

                // Calcular el tiempo restante para el checkout
                $tiempoRestante = $fechaActual->diff($checkout);
                $diasRestantes = $tiempoRestante->d;
                $horasRestantes = $tiempoRestante->h;
                $minutosRestantes = $tiempoRestante->i;

                // Determinar si el checkout ya pasó o está en curso
                if ($fechaActual->gt($checkout)) {
                    $mensajeCheckout = 'El checkout ya pasó.';
                } elseif ($fechaActual->eq($checkout)) {
                    $mensajeCheckout = 'El checkout es hoy.';
                } else {
                    $mensajeCheckout = "Faltan {$diasRestantes} días, {$horasRestantes} horas y {$minutosRestantes} minutos para el checkout.";
                }

                // Formatear las fechas
                $fechaInicioFormateada = $checkin->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY hh:mm A');
                $fechaFinFormateada = $checkout->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY hh:mm A');

                return [
                    'id' => $reserva->id, // Añadir el id de la reserva
                    'huesped' => $reserva->huesped, // Detalles del huésped
                    'fecha_inicio' => $fechaInicioFormateada,
                    'fecha_fin' => $fechaFinFormateada,
                    'estado' => $reserva->estado,
                    'detalles_pago' => [
                        'dias_hospedaje' => $duracion, // Días de hospedaje
                        'costo_por_noche' => $habitacion->costo, // Costo por noche
                        'costo_total_sin_descuento' => $costoTotalSinDescuento, // Costo total sin descuento
                        'monto_descuento' => $montoDescuento, // Monto del descuento en dinero
                        'total_con_descuento' => $totalConDescuento // Total a pagar con descuento
                    ],
                    'pago' => [
                        'monto_pagado' => $pago->monto_pagado, // Monto ya pagado
                        'saldo' => $pago->saldo, // Saldo pendiente
                        'metodo_de_pago' => $pago->metodo_de_pago, // Método de pago
                        'estado_pago' => $pago->estado_pago, // Estado del pago
                        'fecha_de_pago' => $pago->fecha_de_pago // Fecha de pago
                    ],
                    'descuento' => $descuento ? [
                        'id' => $descuento->id,
                        'porcentaje' => $descuento->porcentaje,
                        'descripcion' => $descuento->descripcion // Descripción del descuento
                    ] : null, // Si no hay descuento, devolver null
                    'tiempo_restante_checkout' => [
                        'dias_restantes' => $diasRestantes,
                        'horas_restantes' => $horasRestantes,
                        'minutos_restantes' => $minutosRestantes,
                        'mensaje' => $mensajeCheckout,
                    ],
                ];
            });

            return [
                'id' => $habitacion->id,
                'numero_piso' => $habitacion->numero_piso,
                'numero' => $habitacion->numero,
                'cantidad_camas' => $habitacion->cantidad_camas,
                'tipo_id' => $habitacion->tipo_id,
                'limite_personas' => $habitacion->limite_personas,
                'descripcion' => $habitacion->descripcion,
                'costo' => $habitacion->costo,
                'tv' => $habitacion->tv,
                'ducha' => $habitacion->ducha,
                'banio' => $habitacion->banio,
                'estado' => $habitacion->estado,
                'created_at' => $habitacion->created_at,
                'updated_at' => $habitacion->updated_at,
                'tipo_habitacion' => $habitacion->tipoHabitacion, // Detalles del tipo de habitación
                'reservas' => $reservasConDetalles, // Detalles de las reservas, incluyendo el id
            ];
        });

        return response()->json([
            'mensaje' => 'Habitaciones ocupadas para checkout hoy obtenidas exitosamente.',
            'habitaciones' => $habitacionesConDetalles,
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al obtener habitaciones ocupadas para checkout:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al obtener las habitaciones ocupadas.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}

// public function listarHabitacionesDisponiblesHoy()
// {
//     try {
//         // Obtener la fecha de hoy
//         $hoy = Carbon::today();

//         // Obtener todas las habitaciones
//         $habitaciones = Habitaciones::with('tipoHabitacion')->orderBy('numero', 'asc')->get();

//         // Obtener reservas para hoy
//         $reservasHoy = Reserva::where(function($query) use ($hoy) {
//             $query->whereDate('fecha_inicio', $hoy)
//                   ->orWhereDate('fecha_fin', $hoy);
//         })->pluck('habitacion_id'); // Obtener solo los IDs de las habitaciones reservadas

//         // Marcar habitaciones como disponibles o reservadas
//         $habitacionesConEstado = $habitaciones->map(function ($habitacion) use ($reservasHoy) {
//             // Verificar el estado actual de la habitación
//             if (in_array($habitacion->estado, ['mantenimiento', 'limpieza', 'ocupado'])) {
//                 $estado = $habitacion->estado; // Mantener el estado actual
//             } else {
//                 $estado = $reservasHoy->contains($habitacion->id) ? 'reservado' : 'disponible';
//             }

//             return [
//                 'id' => $habitacion->id,
//                 'numero_piso' => $habitacion->numero_piso,
//                 'numero' => $habitacion->numero,
//                 'cantidad_camas' => $habitacion->cantidad_camas,
//                 'tipo_id' => $habitacion->tipo_id,
//                 'limite_personas' => $habitacion->limite_personas,
//                 'descripcion' => $habitacion->descripcion,
//                 'costo' => $habitacion->costo,
//                 'tv' => $habitacion->tv,
//                 'ducha' => $habitacion->ducha,
//                 'banio' => $habitacion->banio,
//                 'estado' => $estado,
//                 'created_at' => $habitacion->created_at,
//                 'updated_at' => $habitacion->updated_at,
//                 'tipo_habitacion' => [
//                     'id' => $habitacion->tipoHabitacion->id,
//                     'nombre' => $habitacion->tipoHabitacion->nombre,
//                     'descripcion' => $habitacion->tipoHabitacion->descripcion,
//                     'created_at' => $habitacion->tipoHabitacion->created_at,
//                     'updated_at' => $habitacion->tipoHabitacion->updated_at,
//                 ]
//             ];
//         });

//         return response()->json([
//             'msg' => 'Habitaciones obtenidas con éxito',
//             'habitaciones' => $habitacionesConEstado,
//             'status' => 200
//         ], 200);

//     } catch (\Exception $e) {
//         Log::error('Error al listar habitaciones disponibles hoy:', ['error' => $e->getMessage()]);
//         return response()->json([
//             'msg' => 'Ocurrió un error al listar las habitaciones.',
//             'error' => $e->getMessage(),
//             'status' => 500
//         ], 500);
//     }
// }
public function listarHabitacionesDisponiblesHoy()
{
    try {
        // Obtener la fecha de hoy
        $hoy = Carbon::today();

        // Obtener todas las habitaciones
        $habitaciones = Habitaciones::with('tipoHabitacion')->orderBy('numero', 'asc')->get();

        // Obtener reservas activas para hoy
        $reservasActivasHoy = Reserva::where(function($query) use ($hoy) {
            $query->whereDate('fecha_inicio', $hoy)
                  ->orWhereDate('fecha_fin', $hoy);
        })->where('estado', 'activa') // Solo reservas activas
          ->pluck('habitacion_id'); // Obtener solo los IDs de las habitaciones reservadas

        // Obtener reservas pendientes para hoy
        $reservasPendientesHoy = Reserva::where(function($query) use ($hoy) {
            $query->whereDate('fecha_inicio', $hoy)
                  ->orWhereDate('fecha_fin', $hoy);
        })->where('estado', 'pendiente') // Solo reservas pendientes
          ->pluck('habitacion_id'); // Obtener solo los IDs de las habitaciones reservadas

        // Actualizar el estado de las habitaciones en la base de datos
        $habitaciones->each(function ($habitacion) use ($reservasActivasHoy, $reservasPendientesHoy) {
            // Verificar si la habitación está reservada activamente hoy
            if ($reservasActivasHoy->contains($habitacion->id)) {
                // Si está reservada activamente, actualizar el estado a "ocupado"
                if ($habitacion->estado !== 'ocupado') {
                    $habitacion->update(['estado' => 'ocupado']);
                }
            }
            // Verificar si la habitación tiene una reserva pendiente hoy
            elseif ($reservasPendientesHoy->contains($habitacion->id)) {
                // Si tiene una reserva pendiente, actualizar el estado a "reservado"
                if ($habitacion->estado !== 'reservado') {
                    $habitacion->update(['estado' => 'reservado']);
                }
            }
            // Si no tiene reservas activas ni pendientes hoy
            else {
                // Si no está en mantenimiento, limpieza o ocupado, actualizar a "disponible"
                if (!in_array($habitacion->estado, ['mantenimiento', 'limpieza', 'ocupado'])) {
                    $habitacion->update(['estado' => 'disponible']);
                }
            }
        });

        // Obtener las habitaciones actualizadas
        $habitacionesActualizadas = Habitaciones::with('tipoHabitacion')->orderBy('numero', 'asc')->get();

        // Mapear las habitaciones para la respuesta
        $habitacionesConEstado = $habitacionesActualizadas->map(function ($habitacion) {
            return [
                'id' => $habitacion->id,
                'numero_piso' => $habitacion->numero_piso,
                'numero' => $habitacion->numero,
                'cantidad_camas' => $habitacion->cantidad_camas,
                'tipo_id' => $habitacion->tipo_id,
                'limite_personas' => $habitacion->limite_personas,
                'descripcion' => $habitacion->descripcion,
                'costo' => $habitacion->costo,
                'tv' => $habitacion->tv,
                'ducha' => $habitacion->ducha,
                'banio' => $habitacion->banio,
                'estado' => $habitacion->estado, // Estado actualizado en la base de datos
                'created_at' => $habitacion->created_at,
                'updated_at' => $habitacion->updated_at,
                'tipo_habitacion' => [
                    'id' => $habitacion->tipoHabitacion->id,
                    'nombre' => $habitacion->tipoHabitacion->nombre,
                    'descripcion' => $habitacion->tipoHabitacion->descripcion,
                    'created_at' => $habitacion->tipoHabitacion->created_at,
                    'updated_at' => $habitacion->tipoHabitacion->updated_at,
                ]
            ];
        });

        return response()->json([
            'msg' => 'Habitaciones obtenidas con éxito',
            'habitaciones' => $habitacionesConEstado,
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al listar habitaciones disponibles hoy:', ['error' => $e->getMessage()]);
        return response()->json([
            'msg' => 'Ocurrió un error al listar las habitaciones.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}

// public function obtenerReservaPendienteHoyPorID($habitacionId)
// {
//     try {
//         // Obtener la fecha de hoy
//         $hoy = Carbon::today();

//         // Buscar la reserva pendiente para la habitación específica
//         $reservaPendiente = Reserva::with(['huesped', 'habitacion', 'descuento'])
//             ->where('habitacion_id', $habitacionId)
//             ->where(function($query) use ($hoy) {
//                 $query->whereDate('fecha_inicio', $hoy)
//                       ->orWhereDate('fecha_fin', $hoy);
//             })
//             ->where('estado', 'pendiente') // Filtrar por estado pendiente
//             ->first();

//         if ($reservaPendiente) {
//             return response()->json([
//                 'mensaje' => 'Reserva pendiente encontrada.',
//                 'reserva' => [
//                     'huesped_id' => $reservaPendiente->huesped_id,
//                     'habitacion_id' => $reservaPendiente->habitacion_id,
//                     'descuento_id' => $reservaPendiente->descuento_id,
//                     'usuario_id' => $reservaPendiente->usuario_id,
//                     'fecha_inicio' => $reservaPendiente->fecha_inicio,
//                     'fecha_fin' => $reservaPendiente->fecha_fin,
//                     'estado' => $reservaPendiente->estado,
//                     'total' => $reservaPendiente->total,
//                     'updated_at' => $reservaPendiente->updated_at,
//                     'created_at' => $reservaPendiente->created_at,
//                     'id' => $reservaPendiente->id,
//                     'huesped' => $reservaPendiente->huesped,
//                     'habitacion' => $reservaPendiente->habitacion,
//                     'descuento' => $reservaPendiente->descuento,
//                 ],
//                 'pago' => [
//                     'reserva_id' => $reservaPendiente->id,
//                     'monto_pagado' => $reservaPendiente->total,
//                     'saldo' => 0,
//                     'metodo_de_pago' => 'efectivo', // Suponiendo que el método de pago es efectivo
//                     'estado_pago' => 'completado', // Suponiendo que el estado de pago es completado
//                     'fecha_de_pago' => now(), // Fecha actual como ejemplo
//                     'updated_at' => now(),
//                     'created_at' => now(),
//                     'id' => $reservaPendiente->id,
//                 ],
//                 'detalles_pago' => [
//                     'dias_hospedaje' => 1, // Suponiendo que es una noche
//                     'costo_por_noche' => $reservaPendiente->total,
//                     'costo_total_sin_descuento' => $reservaPendiente->total,
//                     'monto_descuento' => 0,
//                     'total_con_descuento' => $reservaPendiente->total,
//                 ],
//                 'status' => 200
//             ], 200);
//         } else {
//             return response()->json([
//                 'mensaje' => 'No hay reservas pendientes para esta habitación hoy.',
//                 'status' => 404
//             ], 404);
//         }

//     } catch (\Exception $e) {
//         Log::error('Error al obtener la reserva pendiente:', ['error' => $e->getMessage()]);
//         return response()->json([
//             'mensaje' => 'Ocurrió un error al obtener la reserva pendiente.',
//             'error' => $e->getMessage(),
//             'status' => 500
//         ], 500);
//     }
// }

// public function obtenerReservaPendienteHoyPorID($habitacionId)
// {
//     try {
//         // Obtener la fecha de hoy
//         $hoy = Carbon::today();

//         // Buscar la reserva pendiente para la habitación específica
//         $reservaPendiente = Reserva::with([
//             'huesped',          // Relación con el huésped
//             'habitacion',       // Relación con la habitación
//             'descuento',        // Relación con el descuento
//             'pago',             // Relación con el pago
//             'usuario',          // Relación con el usuario (si existe)
//             'habitacion.tipoHabitacion', // Relación con el tipo de habitación (si existe)
//         ])
//             ->where('habitacion_id', $habitacionId)
//             ->where(function($query) use ($hoy) {
//                 $query->whereDate('fecha_inicio', $hoy)
//                       ->orWhereDate('fecha_fin', $hoy);
//             })
//             ->where('estado', 'pendiente') // Filtrar por estado pendiente
//             ->first();

//         if ($reservaPendiente) {
//             // Obtener el pago asociado a la reserva
//             $pago = $reservaPendiente->pago;

//             // Calcular los detalles del pago
//             $diasHospedaje = Carbon::parse($reservaPendiente->fecha_inicio)
//                 ->diffInDays(Carbon::parse($reservaPendiente->fecha_fin));

//             $costoPorNoche = $reservaPendiente->habitacion->costo;
//             $costoTotalSinDescuento = $costoPorNoche * $diasHospedaje;

//             $montoDescuento = 0;
//             if ($reservaPendiente->descuento) {
//                 $montoDescuento = ($costoTotalSinDescuento * $reservaPendiente->descuento->porcentaje) / 100;
//             }

//             $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

//             return response()->json([
//                 'mensaje' => 'Reserva pendiente encontrada.',
//                 'reserva' => $reservaPendiente, // Devolver todos los datos de la reserva
//                 'pago' => $pago, // Usar el pago real desde la base de datos
//                 'detalles_pago' => [
//                     'dias_hospedaje' => $diasHospedaje,
//                     'costo_por_noche' => $costoPorNoche,
//                     'costo_total_sin_descuento' => $costoTotalSinDescuento,
//                     'monto_descuento' => $montoDescuento,
//                     'total_con_descuento' => $totalConDescuento,
//                 ],
//                 'status' => 200
//             ], 200);
//         } else {
//             return response()->json([
//                 'mensaje' => 'No hay reservas pendientes para esta habitación hoy.',
//                 'status' => 404
//             ], 404);
//         }

//     } catch (\Exception $e) {
//         Log::error('Error al obtener la reserva pendiente:', ['error' => $e->getMessage()]);
//         return response()->json([
//             'mensaje' => 'Ocurrió un error al obtener la reserva pendiente.',
//             'error' => $e->getMessage(),
//             'status' => 500
//         ], 500);
//     }
// }

public function obtenerReservaPendienteHoyPorID($habitacionId)
{
    try {
        Log::info('Buscando reserva pendiente para la habitación:', ['habitacion_id' => $habitacionId]);

        // Obtener la fecha de hoy
        $hoy = Carbon::today();

        // Buscar la reserva pendiente para la habitación específica
        $reservaPendiente = Reserva::with([
            'huesped',          // Relación con el huésped
            'habitacion',       // Relación con la habitación
            'descuento',        // Relación con el descuento
            'pago',             // Relación con el pago
            'usuario',          // Relación con el usuario (si existe)
            'habitacion.tipoHabitacion', // Relación con el tipo de habitación (si existe)
        ])
            ->where('habitacion_id', $habitacionId)
            ->where(function($query) use ($hoy) {
                $query->whereDate('fecha_inicio', $hoy)
                      ->orWhereDate('fecha_fin', $hoy);
            })
            ->where('estado', 'pendiente') // Filtrar por estado pendiente
            ->first();

        // Verificar si se encontró una reserva pendiente
        if ($reservaPendiente) {
            Log::info('Reserva pendiente encontrada:', ['reserva_id' => $reservaPendiente->id]);

            // Obtener el pago asociado a la reserva
            $pago = $reservaPendiente->pago;

            // Calcular los detalles del pago
            $diasHospedaje = Carbon::parse($reservaPendiente->fecha_inicio)
                ->diffInDays(Carbon::parse($reservaPendiente->fecha_fin));

            $costoPorNoche = $reservaPendiente->habitacion->costo;
            $costoTotalSinDescuento = $costoPorNoche * $diasHospedaje;

            $montoDescuento = 0;
            if ($reservaPendiente->descuento) {
                $montoDescuento = ($costoTotalSinDescuento * $reservaPendiente->descuento->porcentaje) / 100;
            }

            $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

            // Formatear las fechas
            $fechaInicioFormateada = Carbon::parse($reservaPendiente->fecha_inicio)->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY hh:mm A');
            $fechaFinFormateada = Carbon::parse($reservaPendiente->fecha_fin)->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY hh:mm A');

            // Calcular el tiempo restante para el checkout
            $fechaActual = Carbon::now();
            $fechaFin = Carbon::parse($reservaPendiente->fecha_fin);
            $tiempoRestante = $fechaActual->diff($fechaFin);

            $diasRestantes = $tiempoRestante->d;
            $horasRestantes = $tiempoRestante->h;
            $minutosRestantes = $tiempoRestante->i;

            // Determinar si el checkout ya pasó o está en curso
            if ($fechaActual->gt($fechaFin)) {
                $mensajeCheckout = 'El checkout ya pasó.';
            } elseif ($fechaActual->eq($fechaFin)) {
                $mensajeCheckout = 'El checkout es hoy.';
            } else {
                $mensajeCheckout = "Faltan {$diasRestantes} días, {$horasRestantes} horas y {$minutosRestantes} minutos para el checkout.";
            }

            // Respuesta con detalles de la reserva y el pago
            return response()->json([
                'mensaje' => 'Reserva pendiente encontrada.',
                'reserva' => [
                    'id' => $reservaPendiente->id,
                    'huesped' => $reservaPendiente->huesped,
                    'habitacion' => $reservaPendiente->habitacion,
                    'fecha_inicio' => $fechaInicioFormateada,
                    'fecha_fin' => $fechaFinFormateada,
                    'estado' => $reservaPendiente->estado,
                ],
                'pago' => $pago, // Usar el pago real desde la base de datos
                'detalles_pago' => [
                    'dias_hospedaje' => $diasHospedaje,
                    'costo_por_noche' => $costoPorNoche,
                    'costo_total_sin_descuento' => $costoTotalSinDescuento,
                    'monto_descuento' => $montoDescuento,
                    'total_con_descuento' => $totalConDescuento,
                ],
                'tiempo_restante_checkout' => [
                    'dias_restantes' => $diasRestantes,
                    'horas_restantes' => $horasRestantes,
                    'minutos_restantes' => $minutosRestantes,
                    'mensaje' => $mensajeCheckout,
                ],
                'status' => 200
            ], 200);
        } else {
            Log::warning('No hay reservas pendientes para esta habitación hoy:', ['habitacion_id' => $habitacionId]);
            return response()->json([
                'mensaje' => 'No hay reservas pendientes para esta habitación hoy.',
                'status' => 404
            ], 404);
        }

    } catch (\Exception $e) {
        Log::error('Error al obtener la reserva pendiente:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al obtener la reserva pendiente.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}


public function completarPago(Request $request, $pagoId)
{
    try {
        Log::info('Buscando pago con ID:', ['pago_id' => $pagoId]);

        // Buscar el pago
        $pago = Pago::find($pagoId);

        // Verificar si el pago existe
        if (!$pago) {
            Log::error('Pago no encontrado con ID:', ['pago_id' => $pagoId]);
            return response()->json([
                'mensaje' => 'Pago no encontrado.',
                'status' => 404
            ], 404);
        }

        // Validar los datos de la solicitud
        $request->validate([
            'monto_pagado' => 'required|numeric|min:0', // Monto que se está pagando
            'metodo_de_pago' => 'required|in:qr,efectivo', // Método de pago
        ]);

        // Obtener el usuario autenticado (quien realiza el pago)
        $usuario = auth()->user();

        // Verificar si el usuario existe
        if (!$usuario) {
            Log::error('Usuario no autenticado.');
            return response()->json([
                'mensaje' => 'Usuario no autenticado.',
                'status' => 401
            ], 401);
        }

        // Verificar si el monto pagado es válido
        if ($request->monto_pagado > $pago->saldo) {
            Log::warning('El monto pagado no puede ser mayor que el saldo pendiente:', ['monto_pagado' => $request->monto_pagado, 'saldo' => $pago->saldo]);
            return response()->json([
                'mensaje' => 'El monto pagado no puede ser mayor que el saldo pendiente.',
                'saldo_pendiente' => $pago->saldo,
                'status' => 400
            ], 400);
        }

        // Actualizar el pago
        $pago->monto_pagado += $request->monto_pagado; // Sumar el monto pagado al total
        $pago->saldo -= $request->monto_pagado; // Reducir el saldo pendiente
        $pago->metodo_de_pago = $request->metodo_de_pago; // Actualizar el método de pago
        $pago->usuario_id = $usuario->id; // Registrar el usuario que realizó el pago

        // Si el saldo es 0, marcar el pago como completado
        if ($pago->saldo <= 0) {
            $pago->estado_pago = 'completado';
        }

        // Guardar los cambios en el pago
        $pago->save();

        // Respuesta con detalles del pago
        return response()->json([
            'mensaje' => 'Pago completado exitosamente.',
            'pago' => $pago,
            'usuario' => $usuario, // Detalles del usuario que realizó el pago
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al completar el pago:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al completar el pago.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}

public function obtenerCobroHoy(Request $request)
{
    try {
        // Obtener el usuario autenticado
        $usuario = auth()->user();

        // Verificar si el usuario existe
        if (!$usuario) {
            Log::error('Usuario no autenticado.');
            return response()->json([
                'mensaje' => 'Usuario no autenticado.',
                'status' => 401
            ], 401);
        }

        // Obtener la fecha de hoy (inicio y fin del día)
        $fecha_inicio = now()->startOfDay(); // Hoy a las 00:00
        $fecha_fin = now()->endOfDay(); // Hoy a las 23:59

        // Log para verificar las fechas
        Log::info("Fecha inicio del día: " . $fecha_inicio);
        Log::info("Fecha fin del día: " . $fecha_fin);

        // Obtener el monto total recaudado por el usuario hoy, basándonos en la fecha de pago
        $total_recaudado_hoy = Pago::where('usuario_id', $usuario->id)
            ->whereDate('fecha_de_pago', '>=', $fecha_inicio) // Filtrar solo por la fecha (sin horas)
            ->whereDate('fecha_de_pago', '<=', $fecha_fin) // Filtrar solo por la fecha (sin horas)
            ->sum('monto_pagado'); // Sumar todos los montos pagados hoy

        // Log para verificar el monto total
        Log::info("Monto recaudado hoy: " . $total_recaudado_hoy);

        // Verificar si hay pagos hoy
        if ($total_recaudado_hoy == 0) {
            return response()->json([
                'mensaje' => 'No se realizaron pagos hoy.',
                'status' => 404
            ], 404);
        }

        // Respuesta con el total recaudado hoy
        return response()->json([
            'mensaje' => 'Total recaudado hoy.',
            'total_recaudado' => $total_recaudado_hoy,
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al obtener el pago de hoy:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al obtener el pago de hoy.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}


public function obtenerCheckoutPorHabitacionId($habitacionId)
{
    try {
        Log::info('Buscando checkout para la habitación:', ['habitacion_id' => $habitacionId]);

        // Buscar la reserva activa para la habitación específica
        $reserva = Reserva::with([
            'huesped',          // Relación con el huésped
            'habitacion',       // Relación con la habitación
            'descuento',        // Relación con el descuento
            'pago',             // Relación con el pago
            'usuario',          // Relación con el usuario (si existe)
            'habitacion.tipoHabitacion', // Relación con el tipo de habitación (si existe)
        ])
            ->where('habitacion_id', $habitacionId)
            ->where('estado', 'activa') // Filtrar por estado activa
            ->first();

        // Verificar si se encontró una reserva activa
        if ($reserva) {
            Log::info('Reserva activa encontrada:', ['reserva_id' => $reserva->id]);

            // Verificar si la habitación está ocupada
            if ($reserva->habitacion->estado !== 'ocupado') {
                Log::warning('La habitación no está ocupada:', ['habitacion_id' => $habitacionId]);
                return response()->json([
                    'mensaje' => 'La habitación no está ocupada.',
                    'status' => 404
                ], 404);
            }

            // Obtener el pago asociado a la reserva
            $pago = $reserva->pago;

            // Calcular los detalles del pago
            $diasHospedaje = Carbon::parse($reserva->fecha_inicio)
                ->diffInDays(Carbon::parse($reserva->fecha_fin));

            $costoPorNoche = $reserva->habitacion->costo;
            $costoTotalSinDescuento = $costoPorNoche * $diasHospedaje;

            $montoDescuento = 0;
            if ($reserva->descuento) {
                $montoDescuento = ($costoTotalSinDescuento * $reserva->descuento->porcentaje) / 100;
            }

            $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

            // Formatear las fechas
            $fechaInicioFormateada = Carbon::parse($reserva->fecha_inicio)->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY hh:mm A');
            $fechaFinFormateada = Carbon::parse($reserva->fecha_fin)->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY hh:mm A');

            // Calcular el tiempo restante para el checkout
            $fechaActual = Carbon::now();
            $fechaFin = Carbon::parse($reserva->fecha_fin);
            $tiempoRestante = $fechaActual->diff($fechaFin);

            $diasRestantes = $tiempoRestante->d;
            $horasRestantes = $tiempoRestante->h;
            $minutosRestantes = $tiempoRestante->i;

            // Determinar si el checkout ya pasó o está en curso
            if ($fechaActual->gt($fechaFin)) {
                $mensajeCheckout = 'El checkout ya pasó.';
            } elseif ($fechaActual->eq($fechaFin)) {
                $mensajeCheckout = 'El checkout es hoy.';
            } else {
                $mensajeCheckout = "Faltan {$diasRestantes} días, {$horasRestantes} horas y {$minutosRestantes} minutos para el checkout.";
            }

            // Respuesta con detalles de la reserva, el pago y el tiempo restante
            return response()->json([
                'mensaje' => 'Reserva activa encontrada.',
                'reserva' => [
                    'id' => $reserva->id,
                    'huesped' => $reserva->huesped,
                    'habitacion' => $reserva->habitacion,
                    'fecha_inicio' => $fechaInicioFormateada,
                    'fecha_fin' => $fechaFinFormateada,
                    'estado' => $reserva->estado,
                ],
                'pago' => $pago, // Detalles del pago
                'detalles_pago' => [
                    'dias_hospedaje' => $diasHospedaje,
                    'costo_por_noche' => $costoPorNoche,
                    'costo_total_sin_descuento' => $costoTotalSinDescuento,
                    'monto_descuento' => $montoDescuento,
                    'total_con_descuento' => $totalConDescuento,
                ],
                'tiempo_restante_checkout' => [
                    'dias_restantes' => $diasRestantes,
                    'horas_restantes' => $horasRestantes,
                    'minutos_restantes' => $minutosRestantes,
                    'mensaje' => $mensajeCheckout,
                ],
                'status' => 200
            ], 200);
        } else {
            Log::warning('No hay reservas activas para esta habitación:', ['habitacion_id' => $habitacionId]);
            return response()->json([
                'mensaje' => 'No hay reservas activas para esta habitación.',
                'status' => 404
            ], 404);
        }

    } catch (\Exception $e) {
        Log::error('Error al obtener el checkout:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al obtener el checkout.',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}



}




