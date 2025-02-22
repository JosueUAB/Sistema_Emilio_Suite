<?php

namespace App\Models\Configuracion;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class descuento extends Model
{
    use HasFactory;


    protected $table='descuento';
    protected $fillable=[
        'nombre',
        'porcentaje',
        'fecha_inicio',
        'fecha_fin'



    ];


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
