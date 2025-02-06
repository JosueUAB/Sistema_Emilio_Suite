import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesRouterModule } from './reportes.routing';
import { ReportesComponent } from './reportes.component';



@NgModule({
  declarations: [
    ReportesComponent
  ],
  imports: [
    CommonModule,
    ReportesRouterModule
  ]
})
export class ReportesModule { }
