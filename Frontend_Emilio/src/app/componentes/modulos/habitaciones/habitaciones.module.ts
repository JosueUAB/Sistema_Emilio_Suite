import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitacionesComponent } from './habitaciones.component';
import { HabitacionesRouterModule } from './habitaciones.routing';



@NgModule({
  declarations: [HabitacionesComponent],
  imports: [
    CommonModule,
    HabitacionesRouterModule

  ]
})
export class HabitacionesModule { }
