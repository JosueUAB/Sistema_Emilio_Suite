<?php

namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use App\Models\Configuracion\Tarifa;
use App\Models\Configuracion\Descuento;
use App\Models\Configuracion\tarifa_descuento;
use Illuminate\Http\Request;

class tarifa_descuentoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tarifasDescuentos = tarifa_descuento::with(['tarifa', 'descuento'])->get();
        return response()->json($tarifasDescuentos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validación de datos
        $request->validate([
            'tarifa_id' => 'required|exists:tarifas,id',
            'descuento_id' => 'required|exists:descuentos,id',
        ], [
            'tarifa_id.required' => 'La tarifa es obligatoria.',
            'descuento_id.required' => 'El descuento es obligatorio.',
            'tarifa_id.exists' => 'La tarifa no existe.',
            'descuento_id.exists' => 'El descuento no existe.',
        ]);

        // Verificar si la relación ya existe
        $existingRelation = tarifa_descuento::where('tarifa_id', $request->tarifa_id)
                                             ->where('descuento_id', $request->descuento_id)
                                             ->first();
        if ($existingRelation) {
            return response()->json([
                'message' => 403,
                'message_text' => 'La relación entre tarifa y descuento ya existe.',
            ], 403);
        }

        // Crear la relación entre tarifa y descuento
        $tarifaDescuento = tarifa_descuento::create([
            'tarifa_id' => $request->tarifa_id,
            'descuento_id' => $request->descuento_id,
        ]);

        return response()->json([
            'message' => 'Descuento aplicado a la tarifa correctamente.',
            'data' => $tarifaDescuento
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $tarifaDescuento = tarifa_descuento::with(['tarifa', 'descuento'])->find($id);

        if (!$tarifaDescuento) {
            return response()->json([
                'message' => 404,
                'message_text' => 'Relación tarifa-descuento no encontrada.',
            ], 404);
        }

        return response()->json($tarifaDescuento);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $tarifaDescuento = tarifa_descuento::find($id);

        // Verificar si la relación existe
        if (!$tarifaDescuento) {
            return response()->json([
                'message' => 404,
                'message_text' => 'Relación tarifa-descuento no encontrada para actualizar.',
            ], 404);
        }

        // Validación de datos
        $request->validate([
            'tarifa_id' => 'required|exists:tarifas,id',
            'descuento_id' => 'required|exists:descuentos,id',
        ]);

        // Actualizar la relación
        $tarifaDescuento->tarifa_id = $request->tarifa_id;
        $tarifaDescuento->descuento_id = $request->descuento_id;
        $tarifaDescuento->save();

        return response()->json([
            'message' => 'Relación tarifa-descuento actualizada correctamente.',
            'data' => $tarifaDescuento
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tarifaDescuento = tarifa_descuento::find($id);

        if (!$tarifaDescuento) {
            return response()->json([
                'message' => 404,
                'message_text' => 'Relación tarifa-descuento no encontrada para eliminar.',
            ], 404);
        }

        // Eliminar la relación
        $tarifaDescuento->delete();

        return response()->json([
            'message' => 'Relación tarifa-descuento eliminada correctamente.',
        ]);
    }

    /**
     * Obtener todas las tarifas con sus descuentos aplicados.
     */
    public function tarifasConDescuentos()
    {
        $tarifas = Tarifa::with('descuentos')->get(); // Relación con descuentos
        return response()->json($tarifas);
    }

    /**
     * Calcular el precio con descuento aplicado a una tarifa.
     */
    public function calcularPrecioConDescuento($tarifa_id)
    {
        $tarifa = Tarifa::findOrFail($tarifa_id);
        // Obtener los descuentos asociados a esta tarifa
        $descuentos = $tarifa->descuentos;

        if ($descuentos->isEmpty()) {
            return response()->json([
                'tarifa' => $tarifa->nombre,
                'precio_original' => $tarifa->precio_base,
                'mensaje' => 'No se aplicó ningún descuento.',
            ]);
        }

        // Suponiendo que tomamos el primer descuento en la lista
        $descuento = $descuentos->first();
        $precio_final = $tarifa->precio_base - ($tarifa->precio_base * $descuento->porcentaje / 100);

        return response()->json([
            'tarifa' => $tarifa->nombre,
            'precio_original' => $tarifa->precio_base,
            'descuento' => $descuento->nombre,
            'porcentaje_descuento' => $descuento->porcentaje,
            'precio_final' => $precio_final,
        ]);
    }

    /**
     * Eliminar la relación entre tarifa y descuento.
     */
    public function eliminarDescuento($tarifa_id, $descuento_id)
    {
        $tarifaDescuento = tarifa_descuento::where('tarifa_id', $tarifa_id)
                                          ->where('descuento_id', $descuento_id)
                                          ->first();

        if (!$tarifaDescuento) {
            return response()->json(['message' => 'No se encontró la relación entre tarifa y descuento'], 404);
        }

        $tarifaDescuento->delete();
        return response()->json(['message' => 'Relación tarifa-descuento eliminada correctamente']);
    }
}
