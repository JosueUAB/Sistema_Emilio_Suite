<?php
namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use App\Models\Configuracion\tipo_habitacion;
use Illuminate\Http\Request;

class tipo_habitacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tiposHabitacion = tipo_habitacion::all(); // Obtener todos los tipos de habitación
        if ($tiposHabitacion->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron tipos de habitación.',
                'msg'=>403,
                'error_code' => 403
            ], 403);
        }

        return response()->json($tiposHabitacion);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validación de campos
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string|max:500',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser una cadena de texto.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
        ]);

        try {
            // Intentamos crear el nuevo tipo de habitación
            $tipoHabitacion = tipo_habitacion::create($request->all());

            // Si se crea exitosamente, retornamos la respuesta
            return response()->json([
                'message' => 'Tipo de habitación creado con éxito.',
                'msg'=> 201,
                'data' => $tipoHabitacion
            ], 201); // Devuelve el tipo de habitación recién creado
        } catch (\Illuminate\Database\QueryException $e) {
            // Si ocurre un error de SQL (como clave duplicada), se captura la excepción
            if ($e->getCode() == 23000) {
                return response()->json([
                    'message' => 'El nombre de la habitación ya existe.',
                    'error_code' => 409, // Conflicto de recursos
                    'msg' => 409,
                    'error_details' => 'Ya existe un tipo de habitación con ese nombre en la base de datos.'
                ], 409); // Error de conflicto (409)
            }

            // Si es otro tipo de error, se captura y se devuelve el error genérico
            return response()->json([
                'message' => 'Hubo un error al crear el tipo de habitación.',
                'error_code' => 500,
                'msg' => 500,
                'error_details' => $e->getMessage()
            ], 500); // Error al crear el tipo de habitación
        }
    }


    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $tipoHabitacion = tipo_habitacion::find($id); // Buscar el tipo de habitación por ID
        if (!$tipoHabitacion) {
            return response()->json([
                'message' => 'Tipo de habitación no encontrado.',
                'msg'=>403,
                'error_code' => 403
            ], 403);
        }
        return response()->json($tipoHabitacion);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Buscar el tipo de habitación por ID
        $tipoHabitacion = tipo_habitacion::find($id);

        if (!$tipoHabitacion) {
            return response()->json([
                'message' => 'Tipo de habitación no encontrado.',
                'msg' => 403,
                'error_code' => 403
            ], 403);
        }

        // Validación de campos (solo los campos proporcionados en la solicitud)
        $request->validate([
            'nombre' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:500',
        ], [
            'nombre.string' => 'El nombre debe ser una cadena de texto.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
        ]);

        try {
            // Usamos only() para tomar solo los campos enviados en la solicitud
            $data = $request->only(['nombre', 'descripcion']);

            // Filtramos los datos nulos
            $data = array_filter($data, function ($value) {
                return !is_null($value);
            });

            // Si no hay datos para actualizar, se retorna una respuesta indicando que no se enviaron cambios
            if (empty($data)) {
                return response()->json([
                    'message' => 'No se enviaron datos para actualizar.',
                    'msg' => 400,
                    'error_code' => 400
                ], 400);
            }

            // Actualizar solo los campos proporcionados
            $tipoHabitacion->update($data);

            return response()->json([
                'message' => 'Tipo de habitación actualizado con éxito.',
                'data' => $tipoHabitacion
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Hubo un error al actualizar el tipo de habitación.',
                'msg' => 500,
                'error_code' => 500,
                'error_details' => $e->getMessage()
            ], 500); // Error al actualizar
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tipoHabitacion = tipo_habitacion::find($id);
        if (!$tipoHabitacion) {
            return response()->json([
                'message' => 'Tipo de habitación no encontrado.',
                'msg'=>403,
                'error_code' => 403
            ], 403);
        }

        try {
            $tipoHabitacion->delete();
            return response()->json([
                'message' => 'Tipo de habitación eliminado con éxito.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Hubo un error al eliminar el tipo de habitación.',
                'msg'=>500,
                'error_code' => 500,
                'error_details' => $e->getMessage()
            ], 500); // Error al eliminar
        }
    }
}
