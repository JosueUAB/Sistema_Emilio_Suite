<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Pago;
use App\Models\huesped;
use App\Models\Reserva;
use App\Models\habitaciones;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class ReportesController extends Controller
{
    public function obtenerCobroHoy()
    {
        // Obtener el usuario autenticado
        $usuario = Auth::user();

        // Sumar los montos pagados hoy por el usuario autenticado
        $montoTotalHoy = Pago::whereDate('fecha_de_pago', Carbon::today())
            ->where('usuario_id', $usuario->id)
            ->sum('monto_pagado');

        // Retornar la respuesta
        return response()->json([
            'mensaje' => 'Monto total recaudado hoy obtenido exitosamente.',
            'monto_total' => $montoTotalHoy,
        ]);
    }

    public function obtenerReportesDashboard()
    {
        // Obtener el usuario autenticado
        $usuario = Auth::user();

        // Reportes principales
        $totalHabitaciones = habitaciones::count();
        $habitacionesDisponibles = habitaciones::where('estado', 'disponible')->count();
        $habitacionesOcupadas = habitaciones::where('estado', 'ocupado')->count();
        $porcentajeOcupadas = ($habitacionesOcupadas / $totalHabitaciones) * 100;
        $totalHuespedes = huesped::count();
        $huespedesActivos = huesped::where('estado', 'activo')->count();
        $reservasPendientes = Reserva::where('estado', 'pendiente')->count();
        $reservasActivas = Reserva::where('estado', 'activa')->count();
        $ingresosHoy = Pago::whereDate('fecha_de_pago', Carbon::today())->sum('monto_pagado');
        $ingresosTotales = Pago::sum('monto_pagado');

        // Nuevos datos solicitados
        $nuevosRegistradosHoy = huesped::whereDate('created_at', Carbon::today())->count();
        $pendientesPorConfirmarHoy = Reserva::whereDate('created_at', Carbon::today())
            ->where('estado', 'pendiente')
            ->count();
        $totalHabitacionesCheckoutHoy = Reserva::whereDate('fecha_fin', Carbon::today())
            ->where('estado', 'activa')
            ->count();
        $ingresosEsteMes = Pago::whereYear('fecha_de_pago', Carbon::now()->year)
            ->whereMonth('fecha_de_pago', Carbon::now()->month)
            ->sum('monto_pagado');

        // Otros reportes
        $reservasPorTipo = Reserva::with('habitacion.tipoHabitacion')
            ->get()
            ->groupBy('habitacion.tipoHabitacion.nombre')
            ->map->count();
        $huespedesPorNacionalidad = huesped::groupBy('nacionalidad')->selectRaw('nacionalidad, count(*) as total')->get();
        $reservasPorEstado = Reserva::groupBy('estado')->selectRaw('estado, count(*) as total')->get();
        $topHuespedes = huesped::withCount('reservas')->orderByDesc('reservas_count')->limit(5)->get();
        $habitacionesMasReservadas = habitaciones::withCount('reservas')->orderByDesc('reservas_count')->limit(5)->get();
        $ingresosPorMes = Pago::selectRaw('YEAR(fecha_de_pago) as year, MONTH(fecha_de_pago) as month, SUM(monto_pagado) as total')
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();
        $reservasPorMes = Reserva::selectRaw('YEAR(fecha_inicio) as year, MONTH(fecha_inicio) as month, COUNT(*) as total')
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();
        $promedioEstancia = Reserva::selectRaw('AVG(DATEDIFF(fecha_fin, fecha_inicio)) as promedio')->first()->promedio;
        $reservasConDescuento = Reserva::whereNotNull('descuento_id')->count();
        $reservasSinDescuento = Reserva::whereNull('descuento_id')->count();

        // Retornar la respuesta
        return response()->json([
            'mensaje' => 'Reportes obtenidos exitosamente.',
            'reportes' => [
                'total_habitaciones' => $totalHabitaciones,
                'habitaciones_disponibles' => $habitacionesDisponibles,
                'habitaciones_ocupadas' => $habitacionesOcupadas,
                'porcentaje_ocupadas' => $porcentajeOcupadas,
                'total_huespedes' => $totalHuespedes,
                'huespedes_activos' => $huespedesActivos,
                'reservas_pendientes' => $reservasPendientes,
                'reservas_activas' => $reservasActivas,
                'ingresos_hoy' => $ingresosHoy,
                'ingresos_totales' => $ingresosTotales,
                'nuevos_registrados_hoy' => $nuevosRegistradosHoy, // Nuevos registrados hoy
                'pendientes_por_confirmar_hoy' => $pendientesPorConfirmarHoy, // Pendientes por confirmar hoy
                'total_habitaciones_checkout_hoy' => $totalHabitacionesCheckoutHoy, // Habitaciones para checkout hoy
                'ingresos_este_mes' => $ingresosEsteMes, // Ingresos acumulados este mes
                'reservas_por_tipo' => $reservasPorTipo,
                'huespedes_por_nacionalidad' => $huespedesPorNacionalidad,
                'reservas_por_estado' => $reservasPorEstado,
                'top_huespedes' => $topHuespedes,
                'habitaciones_mas_reservadas' => $habitacionesMasReservadas,
                'ingresos_por_mes' => $ingresosPorMes,
                'reservas_por_mes' => $reservasPorMes,
                'promedio_estancia' => $promedioEstancia,
                'reservas_con_descuento' => $reservasConDescuento,
                'reservas_sin_descuento' => $reservasSinDescuento,
            ],
        ]);
    }



}
