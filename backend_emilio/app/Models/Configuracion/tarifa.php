<?php

namespace App\Models\Configuracion;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class tarifa extends Model
{
    use HasFactory;



    protected $table = 'tarifa';
    protected $fillable = [
        "nombre",
        "precio_base"

    ];

    //* almacenar fecha de crecion y actualizacion **//

    public function setCreatedAtAttribute($value){
        date_default_timezone_set("UTC");

        $this -> attributes["created_at"] = Carbon::now();
    }
    public function setUpdateddAtAttribute($value){
        date_default_timezone_set("UTC");

        $this -> attributes["updated_at"] = Carbon::now();

    }
}
