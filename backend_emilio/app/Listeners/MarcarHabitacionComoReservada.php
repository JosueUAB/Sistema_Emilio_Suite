<?php

namespace App\Listeners;

use Carbon\Carbon;
use App\Models\Reserva;
use App\Events\HabitacionReservada;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class MarcarHabitacionComoReservada
{
    public function handle(HabitacionReservada $event)
    {
        $reserva = $event->reserva;
        $habitacion = $reserva->habitacion;

        // Verificar si la reserva está activa para la fecha actual
        $fechaActual = Carbon::now()->setTime(12, 0, 0);

        $reservaActiva = Reserva::where('habitacion_id', $habitacion->id)
            ->where('fecha_inicio', '<=', $fechaActual)
            ->where('fecha_fin', '>', $fechaActual)
            ->exists();

        // Si hay una reserva activa, marcar la habitación como reservada
        if ($reservaActiva) {
            $habitacion->update(['estado' => 'reservada']);
        }
    }
}
