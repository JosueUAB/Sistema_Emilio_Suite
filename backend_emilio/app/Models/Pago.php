<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    use HasFactory;

    protected $table ='pago';
    protected $fillable=[
        'reserva_id',
        'monto_pagado',
        'saldo',
        'metodo_de_pago',
        'estado_pago',
        'fecha_de_pago'
    ];


    public function reserva(){
        return $this->belongsTo(Reserva::class,'reserva_id'. 'id');
    }

}
