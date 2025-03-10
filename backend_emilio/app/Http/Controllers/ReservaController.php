<?php
namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Pago;
use App\Models\Huesped;
use App\Models\Reserva;
use App\Models\Habitaciones;
use Illuminate\Http\Request;
use App\Models\Configuracion\descuento;
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

             // Calcular la duración de la estancia en días
             $duracion = $checkin->diffInDays($checkout);

             // Verificar si ya existe una reserva para esta habitación en estas fechas
             $reservaExistente = Reserva::where('habitacion_id', $request->habitacion_id)
                 ->where(function($query) use ($checkin, $checkout) {
                     $query->whereBetween('fecha_inicio', [$checkin, $checkout])
                           ->orWhereBetween('fecha_fin', [$checkin, $checkout])
                           ->orWhere(function($query) use ($checkin, $checkout) {
                               $query->where('fecha_inicio', '<', $checkin)
                                     ->where('fecha_fin', '>', $checkout);
                           });
                 })
                 ->exists();

             if ($reservaExistente) {
                 return response()->json([
                     'mensaje' => 'Ya existe una reserva para esta habitación en las fechas seleccionadas.',
                     'status' => 409
                 ], 409);
             }

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
                 'monto_pagado' => $request->monto_pagado,
                 'saldo' => $totalConDescuento - $request->monto_pagado,
                 'metodo_de_pago' => $request->metodo_de_pago,
                 'estado_pago' => ($request->monto_pagado >= $totalConDescuento) ? 'completado' : 'deuda',
                 'fecha_de_pago' => now(),
             ]);

             // Actualizar el estado de la habitación a 'reservado'
             $habitacion->update(['estado' => 'reservado']);

             // Si el check-in es hoy, actualizamos el estado del huésped a 'activo'
             if ($checkin->isToday()) {
                 $huesped->update(['estado' => 'activo']);
             }

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
        // Obtener la reserva con relaciones (huesped, habitacion, descuento y pago)
        $reserva = Reserva::with(['huesped', 'habitacion', 'descuento', 'pago'])->find($id);

        if (!$reserva) {
            return response()->json([
                'mensaje' => 'Reserva no encontrada.',
            ], 404);
        }

        return response()->json([
            'mensaje' => 'Reserva obtenida exitosamente.',
            'reserva' => $reserva
        ], 200);
    }
    /**
     * Actualizar una reserva existente.
     */
    public function update(Request $request, $id)
    {
        try {
            Log::info('Buscando reserva con ID:', ['id' => $id]);

            // Buscar la reserva
            $reserva = Reserva::with('pago')->find($id);

            if (!$reserva) {
                Log::error('Reserva no encontrada con ID:', ['id' => $id]);
                return response()->json([
                    'mensaje' => 'Reserva no encontrada.',
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

            // Actualizar el pago si se proporciona
            if ($request->has('monto_pagado')) {
                $reserva->pago->monto_pagado = $request->monto_pagado;
                $reserva->pago->saldo = $reserva->total - $request->monto_pagado;
                $reserva->pago->estado_pago = ($request->monto_pagado >= $reserva->total) ? 'completado' : 'deuda';
                $reserva->pago->save();
            }

            // Guardar los cambios en la reserva
            $reserva->save();

            // Cargar relaciones para la respuesta
            $reserva->load('huesped', 'habitacion', 'descuento', 'pago');

            return response()->json([
                'mensaje' => 'Reserva actualizada exitosamente.',
                'reserva' => $reserva
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al actualizar la reserva:', ['error' => $e->getMessage()]);
            return response()->json([
                'mensaje' => 'Ocurrió un error al actualizar la reserva.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una reserva.
     */
    public function destroy($id)
    {
        try {
            // Buscar la reserva
            $reserva = Reserva::find($id);

            if (!$reserva) {
                return response()->json([
                    'mensaje' => 'Reserva no encontrada.',
                ], 404);
            }

            // Eliminar el pago asociado
            $reserva->pago()->delete();

            // Eliminar la reserva
            $reserva->delete();

            return response()->json([
                'mensaje' => 'Reserva eliminada exitosamente.',
            ], 200);

        } catch (\Exception $e) {
            // Capturar cualquier excepción no manejada
            Log::error('Error al eliminar la reserva:', ['error' => $e->getMessage()]);
            return response()->json([
                'mensaje' => 'Ocurrió un error al eliminar la reserva.',
                'error' => $e->getMessage()
            ], 500);
        }
    }




    public function checkin($id)
    {
        try {
            // Buscar la reserva
            $reserva = Reserva::find($id);

            if (!$reserva) {
                return response()->json(['mensaje' => 'Reserva no encontrada.'], 404);
            }

            // Verificar si la reserva ya está activa
            if ($reserva->estado === 'activa') {
                return response()->json(['mensaje' => 'La reserva ya está activa.'], 400);
            }

            // Verificar si la fecha de check-in es hoy
            $checkin = Carbon::parse($reserva->fecha_inicio);
            if (!$checkin->isToday()) {
                return response()->json(['mensaje' => 'El check-in solo puede realizarse el día de la reserva.'], 400);
            }

            // Obtener la habitación y el huésped asociados a la reserva
            $habitacion = $reserva->habitacion;
            $huesped = $reserva->huesped;

            // Verificar si la habitación está disponible
            if ($habitacion->estado !== 'reservado') {
                return response()->json(['mensaje' => 'La habitación no está en estado "reservado".'], 409);
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

            // Cargar relaciones para la respuesta
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
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al realizar el check-in:', ['error' => $e->getMessage()]);
            return response()->json([
                'mensaje' => 'Ocurrió un error al realizar el check-in.',
                'error' => $e->getMessage()
            ], 500);
        }
    }



public function checkinDirecto(Request $request)
{
    try {
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

        // Verificar si la habitación está disponible
        if ($habitacion->estado !== 'disponible') {
            return response()->json(['mensaje' => 'La habitación no está disponible.'], 409);
        }

        // Calcular la duración de la estancia en días
        $checkin = Carbon::parse($request->fecha_inicio);
        $checkout = Carbon::parse($request->fecha_fin);
        $duracion = $checkin->diffInDays($checkout);

        // Calcular el costo total sin descuento
        $costoTotalSinDescuento = $habitacion->costo * $duracion;

        // Aplicar descuento si existe
        $descuento = null;
        $montoDescuento = 0;
        if ($request->descuento_id) {
            $descuento = descuento::find($request->descuento_id);
            if (!$descuento) {
                return response()->json(['mensaje' => 'El descuento no existe.'], 404);
            }
            $montoDescuento = ($costoTotalSinDescuento * $descuento->porcentaje) / 100;
        }

        // Calcular el total después de aplicar el descuento
        $totalConDescuento = $costoTotalSinDescuento - $montoDescuento;

        // Crear la reserva con check-in inmediato
        $reserva = Reserva::create([
            'huesped_id' => $huesped->id,
            'habitacion_id' => $habitacion->id,
            'descuento_id' => $request->descuento_id, // Puede ser NULL
            'usuario_id' => auth()->id(), // ID del usuario autenticado
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'estado' => 'confirmada', // Usar un valor válido del ENUM
            'total' => $totalConDescuento, // Total con descuento aplicado
        ]);

        // Actualizar estados
        $habitacion->update(['estado' => 'ocupado']); // Usar 'ocupado' en lugar de 'ocupada'
        $huesped->update(['estado' => 'activo']);

        // Registrar el pago
        $pago = Pago::create([
            'reserva_id' => $reserva->id,
            'monto_pagado' => $request->monto_pagado,
            'saldo' => $totalConDescuento - $request->monto_pagado,
            'metodo_de_pago' => $request->metodo_de_pago,
            'estado_pago' => ($request->monto_pagado >= $totalConDescuento) ? 'completado' : 'deuda',
            'fecha_de_pago' => now(),
        ]);

        // Cargar relaciones para la respuesta
        $reserva->load('huesped', 'habitacion', 'descuento');

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
            ]
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error al realizar el check-in directo:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al realizar el check-in directo.',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function checkout($id)
{
    try {
        // Buscar la reserva
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json(['mensaje' => 'Reserva no encontrada.'], 404);
        }

        // Verificar si la reserva ya está completada
        if ($reserva->estado === 'completada') {
            return response()->json(['mensaje' => 'La reserva ya está completada.'], 400);
        }

        // Verificar si hay saldo pendiente
        if ($reserva->pago->saldo > 0) {
            return response()->json([
                'mensaje' => 'Hay un saldo pendiente de pago.',
                'saldo_pendiente' => $reserva->pago->saldo, // Total de la deuda
                'total_reserva' => $reserva->total, // Total de la reserva
                'monto_pagado' => $reserva->pago->monto_pagado, // Monto ya pagado
                'metodo_pago' => $reserva->pago->metodo_de_pago, // Método de pago
                'reserva' => $reserva // Detalles de la reserva
            ], 400);
        }

        // Actualizar estados
        $reserva->update(['estado' => 'completada']);
        $reserva->habitacion->update(['estado' => 'disponible']);
        $reserva->huesped->update(['estado' => 'inactivo']);

        return response()->json([
            'mensaje' => 'Check-out realizado exitosamente.',
            'reserva' => $reserva,
            'total_reserva' => $reserva->total, // Total de la reserva
            'monto_pagado' => $reserva->pago->monto_pagado, // Monto ya pagado
            'saldo_pendiente' => $reserva->pago->saldo, // Saldo pendiente (debería ser 0)
            'metodo_pago' => $reserva->pago->metodo_de_pago // Método de pago
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error al realizar el check-out:', ['error' => $e->getMessage()]);
        return response()->json([
            'mensaje' => 'Ocurrió un error al realizar el check-out.',
            'error' => $e->getMessage()
        ], 500);
    }
}




}
