<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Storage;

class UserAccessController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get("search");
        $users =User::where("name", "LIKE", "%{$search}%")-> orderBy("id", "desc")->paginate(25);
        return  response ()->json([

            "total" => $users->total(),
            "users" => $users->map(function ($user) {
               return[
               'id' => $user->id,
               'name'=>$user->name,
                'email'=>$user->email,
                'surname'=>$user->surname,
                'full_name'=>$user->name . ' ' . $user->surname,

                'phone'=>$user->phone,
                'role_id'=>$user->role_id,
                'rol'=>$user->role,
                'roles'=>$user->roles,
                'type_document'=>$user->type_document,
                'n_document'=>$user->n_document,
                'gender'=>$user->gender,
                'address'=>$user->address,
                'avatar' => $user->avatar ? env('APP_URL') . '/storage/' . $user->avatar : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                // 'avatar' => $user->avatar ? env('APP_URL') . '/storage/' . basename($user->avatar) : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',

                'created_format_at' => $user->created_at->format('Y-m-d h:i:A'),


               ];
            })

        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $USER_EXISTS = User::where("email", $request->email)->first();
        if ($USER_EXISTS) {
            return response()->json([
                "message" => 403,
                "message_text" => "ESTE USUARIO YA EXISTE"
            ]);
        }
        if ($request->hasFile('imagen')) {
            $path = Storage:: putFile('users', $request->file('imagen'));
            $request -> request->add(["avatar" => $path]);

        }

        if ($request ->password) {
            $request -> request->add(["password" => bcrypt($request -> password)]);
        }
        $role = Role::findOrFail($request->role_id);
        $user = User::Create($request->all());
        $user-> assignRole($role);
        return response()->json([
            "message" => 200,


            "user" => [
                'id' => $user->id,
                'name'=>$user->name,
                 'email'=>$user->email,
                 'surname'=>$user->surname,
                 'full_name'=>$user->name . ' ' . $user->surname,
                 'phone'=>$user->phone,
                 'role_id'=>$user->role_id,
                 'roles'=>$user->roles,
                 'type_document'=>$user->type_document,
                 'n_document'=>$user->n_document,
                 'gender'=>$user->gender,
                 'address'=>$user->address,
                    'avatar' => $user->avatar ? env('APP_URL') . '/storage/' . $user->avatar : NULL,
                 'created_format_at' => $user->created_at->format('Y-m-d h:i:A'),



            ],
            "message_text" => "USUARIO CREADO EXITOSAMENTE"

        ], 200);


    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
{
    $user = User::findOrFail($id);  // Encuentra al usuario por ID
    return response()->json([
        "user" => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'surname' => $user->surname,
            'full_name' => $user->name . ' ' . $user->surname,
            'phone' => $user->phone,
            'role_id' => $user->role_id,
            'rol' => $user->role,
            'roles' => $user->roles,
            'type_document' => $user->type_document,
            'n_document' => $user->n_document,
            'gender' => $user->gender,
            'address' => $user->address,
            'avatar' => $user->avatar ? env('APP_URL') . '/storage/' . $user->avatar : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Avatar por defecto
            'created_format_at' => $user->created_at->format('Y-m-d h:i:A'),
        ]
    ]);
}


    /**
     * Update the specified resource in storage.
     */



//     public function update(Request $request, string $id)
// {
//     // Verifica si el correo electrónico ya está registrado por otro usuario (excepto el actual)
//     $USER_EXISTS = User::where("email", $request->email)
//                       ->where("id", "<>", $id)
//                       ->first();

//     if ($USER_EXISTS) {
//         return response()->json([
//             "message" => 403,
//             "message_text" => "ESTE USUARIO YA EXISTE"
//         ]);
//     }

//     // Encuentra el usuario por ID
//     $user = User::find($id);

//     if (!$user) {
//         return response()->json([
//             'message' => 404,
//             'message_text' => 'Usuario no encontrado'
//         ], 404);
//     }

//     // Si el usuario sube una nueva imagen, elimine la antigua y guarda la nueva
//     if ($request->hasFile('imagen')) {
//         if ($user->avatar) {
//             Storage::delete($user->avatar);  // Elimina la imagen anterior si existe
//         }
//         $path = Storage::putFile('users', $request->file('imagen'));  // Guarda la nueva imagen
//         $request->request->add(["avatar" => $path]);  // Agrega la ruta de la nueva imagen al request
//     }

//     // Si se proporciona una nueva contraseña, cifrarla
//     if ($request->password) {
//         $request->request->add(["password" => bcrypt($request->password)]);
//     }

//     // Actualiza los datos del usuario (sin el role_id por ahora)
//     $user->update($request->except(['role_id']));

//     // Verifica si el rol del usuario ha cambiado
//     if ($request->has('role_id') && $request->role_id != $user->role_id) {
//         // Si hay un cambio en el rol, maneja el cambio de rol
//         $role_old = Role::find($user->role_id);  // Obtiene el rol anterior
//         if ($role_old) {
//             $user->removeRole($role_old);  // Elimina el rol anterior
//         }

//         // Verifica que el rol nuevo exista
//         $role = Role::find($request->role_id);
//         if (!$role) {
//             return response()->json([
//                 'message' => 404,
//                 'message_text' => 'Rol no encontrado'
//             ], 404);
//         }

//         // Asigna el nuevo rol
//         $user->assignRole($role);
//     }

//     // Devuelve la respuesta con los detalles del usuario actualizado
//     return response()->json([
//         "message" => 200,
//         "user" => [
//             'id' => $user->id,
//             'name' => $user->name,
//             'email' => $user->email,
//             'surname' => $user->surname,
//             'full_name' => $user->name . ' ' . $user->surname,
//             'phone' => $user->phone,
//             'role_id' => $user->role_id,
//             'rol' => $user->role,
//             'roles' => $user->roles,
//             'type_document' => $user->type_document,
//             'n_document' => $user->n_document,
//             'gender' => $user->gender,
//             'address' => $user->address,
//             'avatar' => $user->avatar ? env('APP_URL') . '/storage/' . $user->avatar : NULL,
//             'created_format_at' => $user->created_at->format('Y-m-d h:i:A'),
//         ],
//         "message_text" => "USUARIO ACTUALIZADO EXITOSAMENTE"
//     ], 200);
// }


public function update(Request $request, string $id)
{
    // Verifica si el correo electrónico ya está registrado por otro usuario (excepto el actual)
    $USER_EXISTS = User::where("email", $request->email)
                      ->where("id", "<>", $id)
                      ->first();

    if ($USER_EXISTS) {
        return response()->json([
            "message" => 403,
            "message_text" => "ESTE USUARIO YA EXISTE"
        ]);
    }

    // Encuentra el usuario por ID
    $user = User::find($id);

    if (!$user) {
        return response()->json([
            'message' => 404,
            'message_text' => 'Usuario no encontrado'
        ], 404);
    }

    // Si el usuario sube una nueva imagen, elimine la antigua y guarda la nueva
    if ($request->hasFile('imagen')) {
        if ($user->avatar) {
            Storage::delete($user->avatar);  // Elimina la imagen anterior si existe
        }
        $path = Storage::putFile('users', $request->file('imagen'));  // Guarda la nueva imagen
        $request->request->add(["avatar" => $path]);  // Agrega la ruta de la nueva imagen al request
    }

    // Si se proporciona una nueva contraseña, cifrarla
    if ($request->password) {
        $request->request->add(["password" => bcrypt($request->password)]);
    }

    // Actualiza los datos del usuario (sin el role_id por ahora)
    $user->update($request->except(['role_id']));

    // Verifica si el rol del usuario ha cambiado
    if ($request->has('role_id') && $request->role_id != $user->role_id) {
        // Si hay un cambio en el rol, maneja el cambio de rol
        $role_old = Role::find($user->role_id);  // Obtiene el rol anterior
        if ($role_old) {
            $user->removeRole($role_old);  // Elimina el rol anterior
        }

        // Verifica que el rol nuevo exista
        $role = Role::find($request->role_id);
        if (!$role) {
            return response()->json([
                'message' => 404,
                'message_text' => 'Rol no encontrado'
            ], 404);
        }

        // Asigna el nuevo rol
        $user->assignRole($role);
    }

    // Devuelve la respuesta con los detalles del usuario actualizado
    return response()->json([
        "message" => 200,
        "user" => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'surname' => $user->surname,
            'full_name' => $user->name . ' ' . $user->surname,
            'phone' => $user->phone,
            'role_id' => $user->role_id,
            'rol' => $user->role,
            'roles' => $user->roles,
            'type_document' => $user->type_document,
            'n_document' => $user->n_document,
            'gender' => $user->gender,
            'address' => $user->address,
            'avatar' => $user->avatar ? env('APP_URL') . '/storage/' . $user->avatar : NULL,
            'created_format_at' => $user->created_at->format('Y-m-d h:i:A'),
        ],
        "message_text" => "USUARIO ACTUALIZADO EXITOSAMENTE"
    ], 200);
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        if ($user->avatar) {
            storage::delete($user->avatar);
        }
        $user->delete();

        return response()->json([
            "message" => 200,
            "message_text" => "USUARIO ELIMINADO EXITOSAMENTE"
        ]);
    }
}
