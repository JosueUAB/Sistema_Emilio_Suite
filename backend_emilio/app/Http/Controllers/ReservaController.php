<?php
namespace App\Http\Controllers;

use App\Models\Configuracion\descuento as ConfiguracionDescuento;
use App\Models\Reserva;
use App\Models\Pago;
use App\Models\Habitaciones;
use App\Models\Huesped;
use Illuminate\Http\Request;
use Carbon\Carbon;
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
                 'fecha_inicio' => 'required|date', // Acepta fecha y hora
                 'fecha_fin' => 'required|date|after:fecha_inicio', // Acepta fecha y hora
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
             $checkin = Carbon::parse($request->fecha_inicio);
             $checkout = Carbon::parse($request->fecha_fin);

             // Forzar el check-in y el check-out a las 12:00 PM
             $checkin->setTime(12, 0, 0); // Check-in a las 12:00 PM
             $checkout->setTime(12, 0, 0); // Check-out a las 12:00 PM

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
                     'mensaje' => 'Ya existe una reserva para esta habitación en las fechas seleccionadas.'
                 ], 409);
             }

             // Calcular el costo total según el costo de la habitación y la duración
             $costoTotal = $habitacion->costo * $duracion;

             // Aplicar descuento si existe
             $descuento = null;
             $montoDescuento = 0;
             if ($request->descuento_id) {
                 $descuento = ConfiguracionDescuento::find($request->descuento_id);
                 if ($descuento) {
                     $montoDescuento = ($costoTotal * $descuento->porcentaje) / 100;
                 }
             }

             // Calcular el total después de aplicar el descuento
             $totalConDescuento = $costoTotal - $montoDescuento;

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
             $reserva->load('huesped', 'habitacion', 'descuento');

             // Devolver la respuesta con la reserva y el pago creados
             return response()->json([
                 'mensaje' => 'Reserva creada exitosamente.',
                 'reserva' => $reserva,
                 'pago' => $pago,
                 'duracion' => $duracion . ' día(s)', // Mostrar la duración en días
                 'fecha_inicio' => $reserva->fecha_inicio, // Ya está en formato datetime
                 'fecha_fin' => $reserva->fecha_fin, // Ya está en formato datetime
             ], 201);

         } catch (\Exception $e) {
             // Capturar cualquier excepción no manejada
             Log::error('Error al crear la reserva:', ['error' => $e->getMessage()]);
             return response()->json([
                 'mensaje' => 'Ocurrió un error al crear la reserva.',
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
            // Buscar la reserva
            $reserva = Reserva::with('pago')->find($id);

            if (!$reserva) {
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

            // Actualizar la reserva
            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
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

                // Actualizar fechas y duración
                $reserva->fecha_inicio = $checkin;
                $reserva->fecha_fin = $checkout;
                $reserva->total = $reserva->habitacion->costo * $duracion;
            }

            if ($request->has('huesped_id')) {
                $reserva->huesped_id = $request->huesped_id;
            }

            if ($request->has('habitacion_id')) {
                $reserva->habitacion_id = $request->habitacion_id;
            }

            if ($request->has('descuento_id')) {
                $reserva->descuento_id = $request->descuento_id;
            }

            // Actualizar el pago si se proporciona
            if ($request->has('metodo_de_pago') || $request->has('monto_pagado')) {
                if ($request->has('metodo_de_pago')) {
                    $reserva->pago->metodo_de_pago = $request->metodo_de_pago;
                }

                if ($request->has('monto_pagado')) {
                    $reserva->pago->monto_pagado = $request->monto_pagado;
                    $reserva->pago->saldo = $reserva->total - $request->monto_pagado;
                    $reserva->pago->estado_pago = ($request->monto_pagado >= $reserva->total) ? 'completado' : 'deuda';
                }

                // Guardar los cambios en el pago
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
            // Capturar cualquier excepción no manejada
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
}
