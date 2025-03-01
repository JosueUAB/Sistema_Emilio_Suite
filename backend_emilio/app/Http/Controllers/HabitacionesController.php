<?php

namespace App\Http\Controllers;

use App\Models\habitaciones;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HabitacionesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        

        $habitaciones = habitaciones::with('tipoHabitacion')
                                     ->orderBy('numero', 'asc')
                                     ->get();

        if ($habitaciones->isEmpty()) {
            return response()->json([
                'msg' => 'No hay habitaciones registradas',
                'status' => 400
            ], 400);
        }

        return response()->json([
            'msg' => 'Habitaciones obtenidas con éxito',
            'habitaciones' => $habitaciones,
            'status' => 200
        ], 200);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validación de los datos de la habitación
        $validator = Validator::make($request->all(), [
            'numero_piso' => 'required|integer',
            'numero' => 'required|integer',
            'tipo_id' => 'required|exists:tipo_habitacion,id',
            'cantidad_camas' => 'required|integer',
            'limite_personas' => 'required|integer',
            'descripcion' => 'nullable|string|max:255',
            'costo' => 'required|numeric',
            'tv' => 'nullable|boolean',
            'ducha' => 'nullable|boolean',
            'banio' => 'nullable|boolean',
            'estado' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'msg' => 'Error en la validación',
                'errors' => $validator->errors(),
                'status' => 400
            ], 400);
        }

        // Verificar si el número de habitación ya existe
        $existingHabitacion = habitaciones::where('numero', $request->numero)->first();

        if ($existingHabitacion) {
            return response()->json([
                'msg' => 'La habitación con este número ya existe.',
                'status' => 403
            ], 403);
        }

        // Crear una nueva habitación
        $habitacion = habitaciones::create($request->all());

        return response()->json([
            'msg' => 'Habitación guardada con éxito',
            'habitacion' => $habitacion,
            'status' => 201
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Buscar la habitación por ID
        $habitacion = habitaciones::find($id);

        // Verificar si la habitación existe
        if (!$habitacion) {
            return response()->json([
                'msg' => 'La habitación no se encontró',
                'status' => 404
            ], 404);
        }

        // Cargar la relación 'tipoHabitacion' para obtener los detalles del tipo de habitación
        $habitacion->load('tipoHabitacion');

        return response()->json([
            'msg' => 'Habitación encontrada',
            'habitacion' => $habitacion,
            'status' => 200
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Buscar la habitación por ID
        $habitacion = habitaciones::find($id);

        // Si la habitación no existe, retornar un error con status 404
        if (!$habitacion) {
            return response()->json([
                'msg' => 'La habitación no se encontró',
                'status' => 404
            ], 404);
        }

        // Si estamos renombrando el número de la habitación, verificamos si ya existe
        if ($request->has('numero') && $request->numero != $habitacion->numero) {
            $existingHabitacion = habitaciones::where('numero', $request->numero)->first();
            if ($existingHabitacion) {
                return response()->json([
                    'msg' => 'El número de habitación ya está en uso. Elige otro.',
                    'status' => 403
                ], 403);
            }
        }

        // Validación de los datos de la habitación
        $validator = Validator::make($request->all(), [
            'numero_piso' => 'sometimes|required|integer',
            'numero' => 'sometimes|required|integer', // Permitir el mismo número en la actualización
            'tipo_id' => 'sometimes|required|exists:tipo_habitacion,id',
            'cantidad_camas' => 'sometimes|required|integer',
            'limite_personas' => 'sometimes|required|integer',
            'descripcion' => 'nullable|string|max:255',
            'costo' => 'sometimes|required|numeric',
            'tv' => 'nullable|boolean',
            'ducha' => 'nullable|boolean',
            'banio' => 'nullable|boolean',
            'estado' => 'sometimes|required|in:disponible,mantenimiento,limpieza,ocupado,reservado',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'msg' => 'Error en la validación',
                'errors' => $validator->errors(),
                'status' => 400
            ], 400);
        }

        // Actualizar la habitación
        $habitacion->update($request->all());

        return response()->json([
            'msg' => 'Habitación actualizada con éxito',
            'habitacion' => $habitacion,
            'status' => 200
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        // Buscar la habitación por ID
        $habitacion = habitaciones::find($id);

        if (!$habitacion) {
            return response()->json([
                'msg' => 'La habitación no se encontró',
                'status' => 404
            ], 404);
        }

        // Eliminar la habitación
        $habitacion->delete();

        return response()->json([
            'msg' => 'Habitación eliminada con éxito',
            'status' => 200
        ], 200);
    }

}
