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

        // Formatear ingresos
        $ingresosHoyFormateado = number_format($ingresosHoy, 2, '.', ',');
        $ingresosTotalesFormateado = number_format($ingresosTotales, 2, '.', ',');
        $ingresosEsteMesFormateado = number_format($ingresosEsteMes, 2, '.', ',');

        // Formatear ingresos por mes
        $ingresosPorMesFormateado = $ingresosPorMes->map(function ($item) {
            $item->total = number_format($item->total, 2, '.', ',');
            return $item;
        });

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
                'ingresos_hoy' => $ingresosHoyFormateado, // Formateado
                'ingresos_totales' => $ingresosTotalesFormateado, // Formateado
                'nuevos_registrados_hoy' => $nuevosRegistradosHoy,
                'pendientes_por_confirmar_hoy' => $pendientesPorConfirmarHoy,
                'total_habitaciones_checkout_hoy' => $totalHabitacionesCheckoutHoy,
                'ingresos_este_mes' => $ingresosEsteMesFormateado, // Formateado
                'reservas_por_tipo' => $reservasPorTipo,
                'huespedes_por_nacionalidad' => $huespedesPorNacionalidad,
                'reservas_por_estado' => $reservasPorEstado,
                'top_huespedes' => $topHuespedes,
                'habitaciones_mas_reservadas' => $habitacionesMasReservadas,
                'ingresos_por_mes' => $ingresosPorMesFormateado, // Formateado
                'reservas_por_mes' => $reservasPorMes,
                'promedio_estancia' => $promedioEstancia,
                'reservas_con_descuento' => $reservasConDescuento,
                'reservas_sin_descuento' => $reservasSinDescuento,
            ],
        ]);
    }
    public function obtenerHuespedesPorNacionalidad()
    {
        // Obtener el total de huéspedes
        $totalHuespedes = huesped::count();

        // Obtener los huéspedes agrupados por nacionalidad con su respectivo conteo
        $huespedesPorNacionalidad = huesped::groupBy('nacionalidad')
            ->selectRaw('nacionalidad, count(*) as total')
            ->get();

        // Calcular el porcentaje para cada nacionalidad y agregarlo al objeto
        $huespedesPorNacionalidadConPorcentaje = $huespedesPorNacionalidad->map(function ($item) use ($totalHuespedes) {
            $porcentaje = ($item->total / $totalHuespedes) * 100;
            $item->porcentaje = number_format($porcentaje, 2);
            return $item;
        });

        // Ordenar los huéspedes por porcentaje de mayor a menor y tomar los primeros 6
        $top6HuespedesPorNacionalidad = $huespedesPorNacionalidadConPorcentaje->sortByDesc('porcentaje')->take(6);

        // Devolver la respuesta en formato JSON
        return response()->json([
            'mensaje' => 'Huéspedes por nacionalidad obtenidos exitosamente.',
            'huespedes_por_nacionalidad' => $top6HuespedesPorNacionalidad->values(), // Usar values() para reindexar el array
        ]);
    }



    public function obtenerClientesPorMesYIngresosMensuales()
    {
        // Obtener los clientes por mes
        $clientesPorMes = Reserva::where('estado', 'activa')
            ->orWhere('estado', 'completada')
            ->selectRaw('YEAR(fecha_inicio) as year, MONTH(fecha_inicio) as month, COUNT(*) as total')
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        // Obtener los ingresos mensuales
        $ingresosMensuales = Pago::selectRaw('YEAR(fecha_de_pago) as year, MONTH(fecha_de_pago) as month, SUM(monto_pagado) as total')
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        // Obtener la cantidad total de habitaciones disponibles en el hotel
        $totalHabitaciones = Habitaciones::count(); // Asumiendo que tienes un modelo Habitacion

        // Inicializar los arreglos de datos
        $clientesPorMesData = array_fill(0, 12, 0);
        $ingresosMensualesData = array_fill(0, 12, 0);
        $porcentajeOcupacionData = array_fill(0, 12, 0);

        // Rellenar los arreglos de datos
        foreach ($clientesPorMes as $mes) {
            $clientesPorMesData[$mes->month - 1] = $mes->total;
            $porcentajeOcupacionData[$mes->month - 1] = round(($mes->total / $totalHabitaciones) * 100, 2);
        }

        foreach ($ingresosMensuales as $mes) {
            $ingresosMensualesData[$mes->month - 1] = $mes->total;
        }

        // Devolver la respuesta en formato JSON
        return response()->json([
            'labels' => [
                'Enero',
                'Febrero',
                'Marzo',
                'Abril',
                'Mayo',
                'Junio',
                'Julio',
                'Agosto',
                'Septiembre',
                'Octubre',
                'Noviembre',
                'Diciembre'
            ],
            'datasets' => [
                [
                    'label' => 'Clientes por mes',
                    'data' => $clientesPorMesData
                ],
                [
                    'label' => 'Ingresos mensuales',
                    'data' => $ingresosMensualesData
                ],
                [
                    'label' => 'Porcentaje de ocupación',
                    'data' => $porcentajeOcupacionData
                ]
            ]
        ]);

    }public function obtenerClientesPorDiaYIngresosDiarios()
    {
        // Obtener los clientes por día
        $clientesPorDia = Reserva::where('estado', 'activa')
            ->orWhere('estado', 'completada')
            ->selectRaw('DATE(fecha_inicio) as dia, COUNT(*) as total')
            ->groupBy('dia')
            ->orderBy('dia', 'asc')
            ->get();

        // Obtener los ingresos diarios
        $ingresosDiarios = Pago::selectRaw('DATE(fecha_de_pago) as dia, SUM(monto_pagado) as total')
            ->groupBy('dia')
            ->orderBy('dia', 'asc')
            ->get();

        // Obtener la cantidad total de habitaciones disponibles en el hotel
        $totalHabitaciones = Habitaciones::count(); // Asumiendo que tienes un modelo Habitacion

        // Obtener el día de hoy
        $hoy = date('Y-m-d');
        $diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        // Calcular los últimos 7 días
        $labels = [];
        for ($i = 6; $i >= 0; $i--) {
            $fecha = date('Y-m-d', strtotime("-$i days", strtotime($hoy)));
            $nombreDia = $diasSemana[date('w', strtotime($fecha))];
            $labels[] = $nombreDia;
        }

        // Inicializar los arreglos de datos
        $clientesPorDiaData = array_fill(0, 7, 0);
        $ingresosDiariosData = array_fill(0, 7, 0);
        $porcentajeOcupacionData = array_fill(0, 7, 0);

        // Rellenar los arreglos de datos
        foreach ($clientesPorDia as $dia) {
            $diferenciaDias = abs((strtotime($hoy) - strtotime($dia->dia)) / (60 * 60 * 24));
            if ($diferenciaDias <= 6) {
                $clientesPorDiaData[6 - $diferenciaDias] = $dia->total;
                $porcentajeOcupacionData[6 - $diferenciaDias] = round(($dia->total / $totalHabitaciones) * 100, 2);
            }
        }

        foreach ($ingresosDiarios as $dia) {
            $diferenciaDias = abs((strtotime($hoy) - strtotime($dia->dia)) / (60 * 60 * 24));
            if ($diferenciaDias <= 6) {
                $ingresosDiariosData[6 - $diferenciaDias] = $dia->total;
            }
        }

        // Devolver la respuesta en formato JSON
        return response()->json([
            'labels' => $labels, // Labels dinámicos
            'datasets' => [
                [
                    'label' => 'Clientes por día',
                    'data' => $clientesPorDiaData
                ],
                [
                    'label' => 'Ingresos diarios',
                    'data' => $ingresosDiariosData
                ],
                [
                    'label' => 'Porcentaje de ocupación',
                    'data' => $porcentajeOcupacionData
                ]
            ]
        ]);
    }











    public function obtenerMesConMasHospedaje()
    {
        // Obtener el mes con más clientes
        $mesConMasHospedaje = Reserva::where('estado', 'activa')
            ->orWhere('estado', 'completada')
            ->selectRaw('YEAR(fecha_inicio) as year, MONTH(fecha_inicio) as month, COUNT(*) as total')
            ->groupBy('year', 'month')
            ->orderBy('total', 'desc')
            ->first();

        // Devolver la respuesta en formato JSON
        return response()->json([
            'mensaje' => 'Mes con más hospedaje obtenido exitosamente.',
            'mes_con_mas_hospedaje' => $mesConMasHospedaje,
        ]);
    }



}
