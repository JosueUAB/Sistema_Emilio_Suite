<?php
namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use App\Models\Configuracion\tarifa;
use Illuminate\Http\Request;

class tarifaController extends Controller
{
     /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tarifas = tarifa::all(); // Obtener todas las tarifas
        return response()->json($tarifas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Verificar si ya existe una tarifa con el mismo nombre
        $IS_TARIFA = tarifa::where('nombre', $request->nombre)->first();
        if ($IS_TARIFA) {
            return response()->json([
                'message' => 403,
                'message_text' => 'Este nombre de tarifa ya existe. Por favor elige otro.',
            ], 403); // Código de estado 403 para conflicto
        }

        // Validación de campos
        $request->validate([
            'nombre' => 'required|string|max:255',
            'precio_base' => 'required|numeric',
        ], [
            'nombre.required' => 'El nombre de la tarifa es obligatorio.',
            'precio_base.required' => 'El precio base es obligatorio.',
            'precio_base.numeric' => 'El precio base debe ser un número.',
        ]);

        // Crear la tarifa
        $tarifa = tarifa::create($request->all());
        return response()->json($tarifa, 201); // Devuelve la tarifa recién creada
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $tarifa = tarifa::find($id);

        // Verificar si la tarifa existe
        if (!$tarifa) {
            return response()->json([
                'message' => 404,
                'message_text' => 'La tarifa no existe.',
            ], 404); // Código de estado 404 para no encontrado
        }

        return response()->json($tarifa);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Buscar la tarifa por ID
        $tarifa = tarifa::find($id);

        // Verificar si la tarifa existe
        if (!$tarifa) {
            return response()->json([
                'message' => 404,
                'message_text' => 'La tarifa no se encuentra disponible para actualizar.',
            ], 404);
        }

        // Verificar si el nombre de la tarifa ya está registrado para otra tarifa
        if ($request->has('nombre')) {
            $IS_TARIFA = tarifa::where('nombre', $request->nombre)
                ->where('id', '<>', $id)
                ->first();

            if ($IS_TARIFA) {
                return response()->json([
                    'message' => 403,
                    'message_text' => 'Este nombre de tarifa ya existe. Por favor elige otro.',
                ], 403);
            }
        }

        // Validación de campos
        $request->validate([
            'nombre' => 'nullable|string|max:255',  // Hacer 'nombre' opcional para actualizaciones parciales
            'precio_base' => 'nullable|numeric',   // Hacer 'precio_base' opcional también
        ], [
            'nombre.required' => 'El nombre de la tarifa es obligatorio.',
            'precio_base.required' => 'El precio base es obligatorio.',
            'precio_base.numeric' => 'El precio base debe ser un número.',
        ]);

        // Actualizar solo los campos proporcionados
        $tarifa->fill($request->only(['nombre', 'precio_base'])); // Solo actualiza los campos presentes en la solicitud
        $tarifa->save(); // Guarda la tarifa actualizada

        return response()->json($tarifa);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tarifa = tarifa::find($id);

        // Verificar si la tarifa existe
        if (!$tarifa) {
            return response()->json([
                'message' => 404,
                'message_text' => 'La tarifa no se encuentra disponible para eliminar.',
            ], 404); // Código de estado 404 para no encontrado
        }

        // Eliminar la tarifa
        $tarifa->delete();
        return response()->json([
            'message' => 200,
            'message_text' => 'Tarifa eliminada con éxito.',
        ]);
    }
}
