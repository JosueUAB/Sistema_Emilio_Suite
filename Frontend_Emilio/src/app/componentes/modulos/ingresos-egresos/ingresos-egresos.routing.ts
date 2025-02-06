import { Routes, RouterModule } from '@angular/router';


import { IngresosEgresosComponent } from './ingresos-egresos.component';

import { NgModule } from '@angular/core';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: IngresosEgresosComponent }
    ])],
    exports: [RouterModule]
})
export class IngresosEgresosRouterModule { }
