import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HuespedesComponent } from './huespedes.component';
import { HuespedesRouterModule } from './huespedes.routing';




@NgModule({
  declarations: [
    HuespedesComponent
  ],
  imports: [
    CommonModule,
    HuespedesRouterModule
  ]
})
export class HuespedesModule { }
