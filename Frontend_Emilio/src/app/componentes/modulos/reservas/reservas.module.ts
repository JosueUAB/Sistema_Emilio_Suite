import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservasRouterModule } from './reservas.routing';
import { ReservasComponent } from './reservas.component';



@NgModule({
  declarations: [
    ReservasComponent
  ],
  imports: [
    CommonModule,
    ReservasRouterModule
  ]
})
export class ReservasModule { }
