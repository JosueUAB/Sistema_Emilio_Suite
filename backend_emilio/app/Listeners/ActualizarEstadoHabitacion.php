<?php

namespace App\Listeners;

use Carbon\Carbon;
use App\Models\Reserva;
use App\Events\HabitacionCheckout;
use App\Notifications\NotificarCheckout;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;


class ActualizarEstadoHabitacion
{
    public function handle(HabitacionCheckout $event)
    {
        $reserva = $event->reserva;
        $habitacion = $reserva->habitacion;

        // Verificar si la habitación no tiene reservas activas para el día actual
        $fechaActual = Carbon::now()->setTime(12, 0, 0);

        $reservasActivas = Reserva::where('habitacion_id', $habitacion->id)
            ->where(function($query) use ($fechaActual) {
                $query->where('fecha_inicio', '<=', $fechaActual)
                      ->where('fecha_fin', '>', $fechaActual);
            })
            ->exists();

        // Si no hay reservas activas, marcar la habitación como disponible
        if (!$reservasActivas) {
            $habitacion->update(['estado' => 'disponible']);
        }

        // Enviar notificación de checkout al huésped
        $reserva->huesped->notify(new NotificarCheckout());
    }
}
