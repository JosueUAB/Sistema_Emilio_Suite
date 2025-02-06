import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HabitacionesComponent } from './habitaciones.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: HabitacionesComponent }
    ])],
    exports: [RouterModule]
})
export class HabitacionesRouterModule { }
