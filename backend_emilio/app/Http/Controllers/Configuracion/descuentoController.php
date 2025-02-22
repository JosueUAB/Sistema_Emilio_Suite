<?php
namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use App\Models\Configuracion\Descuento;
use Illuminate\Http\Request;

class descuentoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $descuentos = Descuento::all(); // Obtener todos los descuentos
        return response()->json($descuentos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Verificar si ya existe un descuento con el mismo nombre
        $IS_DESCENTO = Descuento::where('nombre', $request->nombre)->first();
        if ($IS_DESCENTO) {
            return response()->json([
                'message' => 403,
                'message_text' => 'Este nombre de descuento ya existe. Por favor elige otro.',
            ], 403); // Código de estado 403 para conflicto
        }

        // Validación de campos
        $request->validate([
            'nombre' => 'required|string|max:255',
            'porcentaje' => 'required|numeric',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
        ], [
            'nombre.required' => 'El nombre del descuento es obligatorio.',
            'porcentaje.required' => 'El porcentaje de descuento es obligatorio.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la fecha de inicio.',
        ]);

        // Crear el descuento
        $descuento = Descuento::create($request->all());
        return response()->json($descuento, 201); // Devuelve el descuento recién creado
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $descuento = Descuento::find($id);

        // Verificar si el descuento existe
        if (!$descuento) {
            return response()->json([
                'message' => 404,
                'message_text' => 'El descuento no existe.',
            ], 404); // Código de estado 404 para no encontrado
        }

        return response()->json($descuento);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Buscar el descuento por ID
        $descuento = Descuento::find($id);

        // Verificar si el descuento existe
        if (!$descuento) {
            return response()->json([
                'message' => 404,
                'message_text' => 'El descuento no se encuentra disponible para actualizar.',
            ], 404); // Código de estado 404 para no encontrado
        }

        // Verificar si el nombre del descuento ya está registrado para otro descuento
        if ($request->has('nombre')) {
            $IS_DESCENTO = Descuento::where('nombre', $request->nombre)
                ->where('id', '<>', $id)  // Evitar que el descuento se compare con él mismo
                ->first();

            if ($IS_DESCENTO) {
                return response()->json([
                    'message' => 403,
                    'message_text' => 'Este nombre de descuento ya existe. Por favor elige otro.',
                ], 403); // Código de estado 403 para conflicto
            }
        }

        // Validación de campos
        $request->validate([
            'nombre' => 'nullable|string|max:255',  // Hacer 'nombre' opcional para actualizaciones parciales
            'porcentaje' => 'nullable|numeric',   // Hacer 'porcentaje' opcional también
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        // Actualizar solo los campos proporcionados
        $descuento->fill($request->only(['nombre', 'porcentaje', 'fecha_inicio', 'fecha_fin'])); // Solo actualiza los campos presentes en la solicitud
        $descuento->save(); // Guarda el descuento actualizado

        return response()->json($descuento);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $descuento = Descuento::find($id);

        // Verificar si el descuento existe
        if (!$descuento) {
            return response()->json([
                'message' => 404,
                'message_text' => 'El descuento no se encuentra disponible para eliminar.',
            ], 404); // Código de estado 404 para no encontrado
        }

        // Eliminar el descuento
        $descuento->delete();
        return response()->json([
            'message' => 200,
            'message_text' => 'Descuento eliminado con éxito.',
        ]);
    }
}
