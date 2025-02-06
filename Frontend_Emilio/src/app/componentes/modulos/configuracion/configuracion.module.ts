import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfiguracionRouterModule } from './configuracion.routing';
import { ConfiguracionComponent } from './configuracion.component';



@NgModule({
  declarations: [ConfiguracionComponent],
  imports: [
    CommonModule,
    ConfiguracionRouterModule,
  ]
})
export class ConfiguracionModule { }
