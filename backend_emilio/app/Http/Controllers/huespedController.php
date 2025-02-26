<?php

namespace App\Http\Controllers;

use App\Models\Huesped;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HuespedController extends Controller
{
    public function index()
    {
        $huespedes = huesped::all();

        if ($huespedes->isEmpty()) {
            $data = [
                'msg' => 'No hay huespedes registrados',
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $data = [
            'msg' => 'true',
            'huespedes' => $huespedes,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    public function store(Request $request)
    {
        // Validación para evitar duplicados en numero_documento y correo
        $validator = Validator::make($request->all(), [
            'nombre' => 'required',
            'apellido' => 'required',
            'numero_documento' => 'required:huesped,numero_documento',
            'correo' => 'required|email:huesped,correo',
            'direccion' => 'required',
            'nacionalidad' => 'required',
            'procedencia' => 'required',
            'fecha_de_nacimiento' => 'required|date',
            'estado_civil' => 'required|in:soltero,casado,divorciado,viudo',
            'telefono' => 'required',
            'tipo_de_huesped' => 'required|in:natural,empresa',
            'tipo_de_documento' => 'required|in:ci,pasaporte,carnet_de_extranjero,nit',
        ]);

        if ($validator->fails()) {
            // En caso de que los datos no pasen la validación
            $data = [
                'msg' => 'Error en la validacion',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        // Comprobamos si el número de documento o el correo ya existen en la base de datos
        if (huesped::where('numero_documento', $request->numero_documento)->exists()) {
            return response()->json([
                'msg' => 'El numero de documento ya existe',
                'status' => 403
            ], 403);
        }

        if (huesped::where('correo', $request->correo)->exists()) {
            return response()->json([
                'msg' => 'El correo ya existe',
                'status' => 403
            ], 403);
        }

        // Crear el nuevo registro
        $huesped = huesped::create($request->all());

        if (!$huesped) {
            $data = [
                'msg' => 'Error al guardar el huésped',
                'status' => 500
            ];
            return response()->json($data, 500);
        }

        $data = [
            'msg' => 'Huésped guardado con éxito',
            'huesped' => $huesped,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    public function show($id)
    {
        $huesped = huesped::find($id);

        if (!$huesped) {
            $data = [
                'msg' => 'El huésped no existe',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'msg' => 'true',
            'huesped' => $huesped,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    public function update($id, Request $request)
    {
        $huesped = huesped::find($id);

        if (!$huesped) {
            $data = [
                'msg' => 'El huésped no existe',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        // Validación condicional para permitir solo los campos que vienen en la solicitud
        $rules = [
            'nombre' => 'nullable|string',
            'apellido' => 'nullable|string',
            'numero_documento' => 'nullable:huesped,numero_documento,' . $id,
            'correo' => 'nullable|email:huesped,correo,' . $id,
            'direccion' => 'nullable|string',
            'nacionalidad' => 'nullable|string',
            'procedencia' => 'nullable|string',
            'fecha_de_nacimiento' => 'nullable|date',
            'estado_civil' => 'nullable|in:soltero,casado,divorciado,viudo',
            'telefono' => 'nullable|string',
            'tipo_de_huesped' => 'nullable|in:natural,empresa',
            'tipo_de_documento' => 'nullable|in:ci,pasaporte,carnet_de_extranjero,nit',
        ];

        // Validamos solo los campos presentes en la solicitud
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            $data = [
                'msg' => 'Error en la validación',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        // Comprobamos si el número de documento o el correo ya existen en la base de datos (al editar)
        if ($request->numero_documento && $request->numero_documento !== $huesped->numero_documento && huesped::where('numero_documento', $request->numero_documento)->exists()) {
            return response()->json([
                'msg' => 'El numero de documento ya existe',
                'status' => 403
            ], 403);
        }

        if ($request->correo && $request->correo !== $huesped->correo && huesped::where('correo', $request->correo)->exists()) {
            return response()->json([
                'msg' => 'El correo ya existe',
                'status' => 403
            ], 403);
        }

        // Actualizamos el huésped solo con los campos que vienen en la solicitud
        $huesped->update($request->only(array_keys($rules)));

        $data = [
            'msg' => 'Huésped actualizado con éxito',
            'huesped' => $huesped,
            'status' => 200
        ];
        return response()->json($data, 200);
    }


    public function destroy($id)
    {
        $huesped = huesped::find($id);

        if (!$huesped) {
            $data = [
                'msg' => 'El huésped no existe',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $huesped->delete();

        $data = [
            'msg' => 'Huésped eliminado con éxito',
            'status' => 200
        ];
        return response()->json($data, 200);
    }
}
