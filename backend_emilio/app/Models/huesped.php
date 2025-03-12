<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class huesped extends Model
{
    use HasFactory, Notifiable;



    protected $table='huesped';
    protected $fillable=[
        'nombre',
        'apellido',
        'numero_documento',
        'correo',
        'direccion',
        'nacionalidad',
        'procedencia',
        'fecha_de_nacimiento',
        'estado_civil',
        'telefono',
        'estado',
        'tipo_de_huesped',
        'tipo_de_documento',

    ];

    protected $atributes=[
        'estado'=>'inactivo',
        'nacionalidad'=>'boliviana',
        'estado_civil'=>'soltero',
        'tipo_de_huesped'=>'natural',
        'tipo_de_documento'=>'ci',
    ];
    protected $casts = [
        'fecha_de_nacimiento' => 'date',
    ];


}
