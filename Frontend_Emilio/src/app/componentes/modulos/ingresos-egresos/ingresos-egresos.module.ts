import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngresosEgresosRouterModule } from './ingresos-egresos.routing';
import { IngresosEgresosComponent } from './ingresos-egresos.component';



@NgModule({
  declarations: [
    IngresosEgresosComponent
  ],
  imports: [
    CommonModule,
    IngresosEgresosRouterModule
  ]
})
export class IngresosEgresosModule { }
