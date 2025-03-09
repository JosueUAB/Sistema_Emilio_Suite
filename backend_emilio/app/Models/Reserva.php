<?php

namespace App\Models;

use App\Models\Configuracion\descuento;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reserva extends Model
{
    use HasFactory;

    protected $table='reserva';
    protected $fillable=[
        'huesped_id',
        'habitacion_id',
        'descuento_id',
        'usuario_id',
        'total',
        'fecha_inicio',
        'fecha_fin',
        'estado'
    ];


    // Relación con el descuento
    public function descuento()
    {
        return $this->belongsTo(descuento::class, 'descuento_id');
    }

    // Relación con la habitación
    public function habitacion()
    {
        return $this->belongsTo(Habitaciones::class, 'habitacion_id');
    }

    // Relación con el usuario (quién hizo la reserva)
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function huesped()
    {
        return $this->belongsTo(huesped::class, 'huesped_id');
    }
    public function pago(): HasOne
    {
        return $this->hasOne(Pago::class, 'reserva_id', 'id');
    }


}
