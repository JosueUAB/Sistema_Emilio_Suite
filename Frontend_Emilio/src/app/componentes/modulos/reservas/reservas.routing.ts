import { Routes, RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { ReservasComponent } from './reservas.component';
import { AdministrarReservasComponent } from './administrar-reservas/administrar-reservas.component';
import { CheckInComponent } from './check-in/check-in.component';
import { CheckOutComponent } from './check-out/check-out.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: ReservasComponent },
        {path:'administrar-reservas',component:AdministrarReservasComponent},
        {path:'check-in',component:CheckInComponent},
        {path:'check-out',component:CheckOutComponent}
    ])],
    exports: [RouterModule]
})
export class ReservasRouterModule { }
