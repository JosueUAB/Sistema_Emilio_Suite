import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfiguracionComponent } from './configuracion.component';
import { TarifasComponent } from './tarifas/tarifas.component';
import { DescuentosComponent } from './descuentos/descuentos.component';
import { TipoHabitacionComponent } from './tipo-habitacion/tipo-habitacion.component';



@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: ConfiguracionComponent },
        {path:'tarifas',component:TarifasComponent},
        {path: 'descuentos',component:DescuentosComponent},
        {path:'tipos-habitacion',component:TipoHabitacionComponent}
    ])],
    exports: [RouterModule]
})
export class ConfiguracionRouterModule { }
