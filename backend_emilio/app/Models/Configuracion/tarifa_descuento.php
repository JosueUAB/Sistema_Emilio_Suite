<?php

namespace App\Models\Configuracion;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class tarifa_descuento extends Model
{
    use HasFactory;
    use SoftDeletes;

    // Relación con el modelo de tarifa
    public function tarifa()
    {
        return $this->belongsTo(tarifa::class, 'tarifa_id');
    }

    // Relación con el modelo de descuento
    public function descuento()
    {
        return $this->belongsTo(descuento::class, 'descuento_id');
    }


     //* almacenar fecha de crecion y actualizacion **//

     public function setCreatedAtAttribute($value){
        date_default_timezone_set("America/La_Paz");

        $this -> attributes["created_at"] = Carbon::now();
    }
    public function setUpdateddAtAttribute($value){
        date_default_timezone_set("America/La_Paz");

        $this -> attributes["updated_at"] = Carbon::now();

    }
}
