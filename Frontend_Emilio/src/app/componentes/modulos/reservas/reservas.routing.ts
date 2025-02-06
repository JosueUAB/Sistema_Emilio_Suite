import { Routes, RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { ReservasComponent } from './reservas.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: ReservasComponent }
    ])],
    exports: [RouterModule]
})
export class ReservasRouterModule { }
