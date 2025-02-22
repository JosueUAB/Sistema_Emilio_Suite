import { Routes, RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { VentasComponent } from './ventas.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: VentasComponent }
    ])],
    exports: [RouterModule]
})
export class VentasRouterModule { }
