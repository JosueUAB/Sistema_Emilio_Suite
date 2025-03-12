<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Pago;
use Illuminate\Http\Request;
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
}
