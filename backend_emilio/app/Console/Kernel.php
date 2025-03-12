<?php

namespace App\Console;

use Carbon\Carbon;
use App\Models\Reserva;
use App\Models\habitaciones;
use App\Events\HabitacionCheckout;
use App\Events\HabitacionReservada;
use Illuminate\Support\Facades\Log;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
{
    $schedule->call(function () {
        try {
            $fechaActual = Carbon::now()->setTime(12, 0, 0);

            // 1. Marcar como disponibles las habitaciones que no tienen reservas activas
            $habitacionesOcupadas = Reserva::where('fecha_inicio', '<=', $fechaActual)
                ->where('fecha_fin', '>', $fechaActual)
                ->pluck('habitacion_id'); // Obtener IDs de habitaciones ocupadas

            // Marcar como disponibles las habitaciones que no están en la lista de ocupadas
            habitaciones::whereNotIn('id', $habitacionesOcupadas)
                ->update(['estado' => 'disponible']);

            // 2. Marcar como reservadas las habitaciones con reservas activas
            Reserva::where('fecha_inicio', '<=', $fechaActual)
                ->where('fecha_fin', '>', $fechaActual)
                ->chunk(100, function ($reservas) {
                    foreach ($reservas as $reserva) {
                        $reserva->habitacion->update(['estado' => 'reservada']);
                    }
                });

        } catch (\Exception $e) {
            // Registrar cualquier error en los logs
            Log::error('Error en el Scheduler de reservas:', ['error' => $e->getMessage()]);
        }
    })->everyMinute(); // Ejecutar cada minuto (para pruebas)
}

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
