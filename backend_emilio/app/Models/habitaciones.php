<?php

namespace App\Models;

use App\Models\Configuracion\tipo_habitacion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class habitaciones extends Model
{



    use HasFactory;


    protected $table='habitaciones';
    protected $fillable=[
        'numero_piso',
        'numero',
        'cantidad_camas',
        'tipo_id',
        'limite_personas',
        'descripcion',
        'costo',
        'tv',
        'ducha',
        'banio',
        'estado'

    ];

    public function tipoHabitacion()
    {
        return $this->belongsTo(tipo_habitacion::class, 'tipo_id');
    }


}
